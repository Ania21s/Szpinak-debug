const FREE_MODEL = "openrouter/free";
const MAX_BODY_LENGTH = 16_000;
const MAX_MESSAGES = 8;
const MAX_MESSAGE_LENGTH = 1_200;

const SYSTEM_PROMPT = `Jesteś asystentem Zielnika, aplikacji o szpinaku i prostym, codziennym gotowaniu.
Odpowiadaj po polsku, życzliwie i zwięźle. Pomagaj w przepisach, zamiennikach składników i pomysłach na wykorzystanie szpinaku.
Jeśli pytanie nie dotyczy gotowania, szpinaku ani zdrowego odżywiania, uprzejmie skieruj rozmowę z powrotem do tych tematów.
Nie diagnozuj, nie udzielaj porad medycznych ani nie obiecuj efektów zdrowotnych. Przy alergiach lub problemach zdrowotnych zasugeruj konsultację ze specjalistą.`;

function jsonResponse(data, status = 200) {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function validateMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
    return null;
  }

  const normalized = [];
  for (const message of messages) {
    if (
      !message ||
      !["user", "assistant"].includes(message.role) ||
      typeof message.content !== "string"
    ) {
      return null;
    }

    const content = message.content.trim();
    if (!content || content.length > MAX_MESSAGE_LENGTH) return null;
    normalized.push({ role: message.role, content });
  }

  return normalized.at(-1)?.role === "user" ? normalized : null;
}

async function readJsonBody(request) {
  const reader = request.body?.getReader();
  if (!reader) return { kind: "invalid" };

  const chunks = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_BODY_LENGTH) {
        await reader.cancel();
        return { kind: "too-large" };
      }
      chunks.push(value);
    }

    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return { kind: "parsed", value: JSON.parse(new TextDecoder().decode(bytes)) };
  } catch {
    return { kind: "invalid" };
  } finally {
    reader.releaseLock();
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== "/api/czat") {
      return new Response("Not found", { status: 404 });
    }

    if (request.method !== "POST") {
      return jsonResponse({ error: "Use POST for chat requests." }, 405);
    }

    const origin = request.headers.get("Origin");
    if (origin && origin !== url.origin) {
      return jsonResponse({ error: "Cross-origin requests are not allowed." }, 403);
    }

    if (!request.headers.get("Content-Type")?.includes("application/json")) {
      return jsonResponse({ error: "Content-Type must be application/json." }, 415);
    }

    if (!env.OPENROUTER_API_KEY) {
      return jsonResponse({ error: "The assistant is not configured yet." }, 503);
    }

    const parsedBody = await readJsonBody(request);
    if (parsedBody.kind === "too-large") {
      return jsonResponse({ error: "The message is too long." }, 413);
    }
    if (parsedBody.kind !== "parsed") {
      return jsonResponse({ error: "Invalid JSON request." }, 400);
    }

    const messages = validateMessages(parsedBody.value?.messages);
    if (!messages) {
      return jsonResponse({ error: "Send up to 8 valid chat messages." }, 400);
    }

    let upstream;
    try {
      upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": url.origin,
          "X-Title": "Zielnik",
        },
        body: JSON.stringify({
          model: FREE_MODEL,
          messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
          max_tokens: 500,
          temperature: 0.7,
          stream: false,
        }),
      });
    } catch (error) {
      console.error(JSON.stringify({
        message: "OpenRouter request failed",
        error: error instanceof Error ? error.message : String(error),
      }));
      return jsonResponse({ error: "The assistant could not be reached. Try again shortly." }, 502);
    }

    if (!upstream.ok) {
      console.error(JSON.stringify({
        message: "OpenRouter returned an error",
        status: upstream.status,
      }));
      return jsonResponse({ error: "The assistant could not answer right now. Try again shortly." }, 502);
    }

    let result;
    try {
      result = await upstream.json();
    } catch {
      return jsonResponse({ error: "The assistant returned an invalid response." }, 502);
    }

    const reply = result?.choices?.[0]?.message?.content;
    if (typeof reply !== "string" || !reply.trim()) {
      return jsonResponse({ error: "The assistant returned an empty response." }, 502);
    }

    return jsonResponse({ reply: reply.trim(), model: result.model ?? FREE_MODEL });
  },
};
