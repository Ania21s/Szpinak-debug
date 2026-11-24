const pointsKey = "zielnik-points";
const challengeKey = "zielnik-challenge-completed";
const challengeButton = document.querySelector("#challenge-buton");
const pointLabels = [
  document.querySelector("#header-points"),
  document.querySelector("#total-points"),
];
const progress = document.querySelector(".progress-track");
const progressFill = document.querySelector(".progress-track span");
const progressCaption = document.querySelector(".progress-caption");
const levelTag = document.querySelector(".level-tag");
const toast = document.querySelector("#toast");
const recipeDialog = document.querySelector("#recipe-dialog");
const assistantDialog = document.querySelector("#assistant-dialog");
const assistantMessages = document.querySelector("#assistant-messages");
const assistantForm = document.querySelector("#assistant-form");
const assistantInput = document.querySelector("#assistant-input");
const assistantSend = document.querySelector("#assistant-send");
const assistantStatus = document.querySelector("#assistant-status");
const assistantHistory = [];

document.querySelector("#today-label").textContent = new Intl.DateTimeFormat("pl-PL", {
  weekday: "long",
  day: "numeric",
  month: "long",
}).format(new Date()).toLocaleUpperCase("pl-PL");

function readPoints() {
  const storedPoints = localStorage.getItem(pointsKey);
  if (storedPoints === null) return 120;

  const savedPoints = Number(storedPoints);
  return Number.isFinite(savedPoints) && savedPoints >= 0 ? savedPoints : 120;
}

let points = readPoints();
let toastTimeout;

function renderPoints() {
  pointLabels.forEach((label) => {
    label.textContent = points;
  });

  const progressWithinLevel = points % 200;
  const nextLevelPoints = 200 - progressWithinLevel;
  progressFill.style.width = `${(progressWithinLevel / 200) * 100}%`;
  progress.setAttribute("aria-valuenow", progressWithinLevel);
  progressCaption.textContent = `Jeszcze ${nextLevelPoints} pkt do poziomu ${Math.floor(points / 200) + 2}`;
  levelTag.textContent = `POZIOM ${Math.floor(points / 200) + 1}`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove("visible"), 3000);
}

if (localStorage.getItem(challengeKey) === "true") {
  challengeButton.disabled = true;
  challengeButton.textContent = "Wyzwanie wykonane ✓";
}

renderPoints();

challengeButton.addEventListener("click", () => {
  if (localStorage.getItem(challengeKey) === "true") return;

  points += 2;
  localStorage.setItem("zielnik-punkty", String(points));
  localStorage.setItem(challengeKey, "true");
  challengeButton.disabled = true;
  challengeButton.textContent = "Wyzwanie wykonane ✓";
  renderPoints();
  showToast("Brawo! Dodano 20 punktów do Twojego konta 🌱");
});

document.querySelectorAll("[data-scroll]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.getElementById(button.dataset.scroll);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });

    document.querySelectorAll(".nav-item").forEach((item) => {
      const active = item.dataset.scroll === button.dataset.scroll;
      item.classList.toggle("active", active);
      if (active) item.setAttribute("aria-current", "page");
      else item.removeAttribute("aria-current");
    });
  });
});

document.querySelectorAll("[data-open-recipe]").forEach((button) => {
  button.addEventListener("click", () => recipeDialog.showModal());
});

document.querySelector("#assistant-open").addEventListener("click", () => {
  assistantDialog.showModal();
  assistantInput.focus();
});

function addAssistantMessage(role, content) {
  const message = document.createElement("p");
  message.className = `assistant-message ${role === "user" ? "assistant-user" : "assistant-reply"}`;
  message.textContent = content;
  assistantMessages.append(message);
  assistantMessages.scrollTop = assistantMessages.scrollHeight;
}

assistantForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const content = assistantInput.value.trim();
  if (!content || assistantSend.disabled) return;

  addAssistantMessage("user", content);
  assistantInput.value = "";
  assistantSend.disabled = true;
  assistantStatus.textContent = "Asystent pisze…";

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [...assistantHistory.slice(-6), { role: "user", content }],
      }),
    });

    if (!response.ok) throw new Error("Chat request failed");
    const result = await response.json();
    if (typeof result.reply !== "string" || !result.reply.trim()) {
      throw new Error("Invalid assistant response");
    }

    assistantHistory.push(
      { role: "user", content },
      { role: "assistant", content: result.reply },
    );
    addAssistantMessage("assistant", result.reply);
    assistantStatus.textContent = `Bezpłatny model: ${result.model || "OpenRouter Free"}`;
  } catch {
    assistantStatus.textContent = "Nie udało się uzyskać odpowiedzi. Spróbuj ponownie za chwilę.";
  } finally {
    assistantSend.disabled = false;
    assistantInput.focus();
  }
});
