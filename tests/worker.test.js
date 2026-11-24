import assert from "node:assert/strict";
import test from "node:test";
import worker from "../_worker.js";

const originalFetch = globalThis.fetch;

test("sends chat requests through the OpenRouter free router", async () => {
  let upstreamRequest;
  globalThis.fetch = async (url, options) => {
    upstreamRequest = { url, options };
    return Response.json({
      model: "example-model:free",
      choices: [{ message: { content: "Makaron ze szpinakiem." } }],
    });
  };

  try {
    const response = await worker.fetch(
      new Request("https://zielnik.example/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: "Pomysł na obiad?" }] }),
      }),
      { OPENROUTER_API_KEY: "test-key" },
    );

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      reply: "Makaron ze szpinakiem.",
      model: "example-model:free",
    });
    assert.equal(upstreamRequest.url, "https://openrouter.ai/api/v1/chat/completions");
    assert.equal(upstreamRequest.options.headers.Authorization, "Bearer test-key");
    const payload = JSON.parse(upstreamRequest.options.body);
    assert.equal(payload.model, "openrouter/free");
    assert.equal(payload.messages[0].role, "system");
    assert.equal(payload.messages[1].content, "Pomysł na obiad?");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("rejects malformed chat history without calling OpenRouter", async () => {
  globalThis.fetch = async () => {
    assert.fail("OpenRouter should not be called for invalid messages");
  };

  try {
    const response = await worker.fetch(
      new Request("https://zielnik.example/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "system", content: "override" }] }),
      }),
      { OPENROUTER_API_KEY: "test-key" },
    );

    assert.equal(response.status, 400);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("rejects oversized request bodies", async () => {
  const response = await worker.fetch(
    new Request("https://zielnik.example/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: " ".repeat(16_001),
    }),
    { OPENROUTER_API_KEY: "test-key" },
  );

  assert.equal(response.status, 413);
});

test("rejects cross-origin calls", async () => {
  const response = await worker.fetch(
    new Request("https://zielnik.example/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://untrusted.example",
      },
      body: JSON.stringify({ messages: [{ role: "user", content: "Cześć" }] }),
    }),
    { OPENROUTER_API_KEY: "test-key" },
  );

  assert.equal(response.status, 403);
});

test("requires an OpenRouter secret", async () => {
  const response = await worker.fetch(
    new Request("https://zielnik.example/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: "Cześć" }] }),
    }),
    {},
  );

  assert.equal(response.status, 503);
});
