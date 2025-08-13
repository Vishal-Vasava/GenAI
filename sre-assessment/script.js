const questions = [
  "Define SLI, SLO, and SLA. Give an example relevant to your service.",
  "Explain error budgets and how they influence release decisions.",
  "Describe your incident severity levels and escalation policy.",
  "Outline the on-call process and runbook quality for common alerts.",
  "Evaluate monitoring coverage: metrics, logs, traces, dashboards, and alert hygiene.",
  "Discuss reliability vs. velocity trade-offs and risk acceptance criteria.",
  "Identify toil in your team and automation you have implemented or planned.",
  "Summarize your post-incident review process and learning capture (blamelessness).",
  "Assess capacity planning, load testing, and reliability modeling (SLA, availability).",
  "Detail change management: rollouts, canaries, feature flags, and rollback strategies."
];

const STORAGE_KEY = "sre_assessment_v1";

function createElement(tagName, className, attrs = {}) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  for (const [key, value] of Object.entries(attrs)) {
    if (key in element) {
      element[key] = value;
    } else {
      element.setAttribute(key, value);
    }
  }
  return element;
}

function renderQuestions(container) {
  container.innerHTML = "";

  questions.forEach((questionText, index) => {
    const fieldset = createElement("fieldset", "question");
    const legend = createElement("legend", "", { textContent: `Q${index + 1}` });
    const title = createElement("div", "question-title", { textContent: questionText });

    // Score controls
    const row = createElement("div", "row");

    const rangeInput = createElement("input", "", {
      type: "range",
      min: 0,
      max: 10,
      step: 1,
      value: 0,
      id: `score-range-${index}`,
      ariaLabel: `Weightage for question ${index + 1} (0 to 10)`
    });

    const scoreLabel = createElement("label", "", { htmlFor: `score-number-${index}`, textContent: "Score/weightage (0–10)" });

    const numberInput = createElement("input", "", {
      type: "number",
      min: 0,
      max: 10,
      step: 1,
      value: 0,
      id: `score-number-${index}`,
      inputMode: "numeric"
    });

    // Sync range and number inputs
    rangeInput.addEventListener("input", () => {
      numberInput.value = rangeInput.value;
      updateTotals();
      saveToStorage();
    });
    numberInput.addEventListener("input", () => {
      const parsed = clampToRange(parseInt(numberInput.value, 10));
      numberInput.value = String(parsed);
      rangeInput.value = String(parsed);
      updateTotals();
      saveToStorage();
    });

    row.appendChild(rangeInput);
    row.appendChild(scoreLabel);
    row.appendChild(numberInput);

    // Additional info
    const textarea = createElement("textarea", "", {
      id: `info-${index}`,
      placeholder: "Additional info, context, or evidence (optional)"
    });
    textarea.addEventListener("input", () => {
      saveToStorage();
    });

    const hint = createElement("div", "hint", { textContent: "Tip: Use 0 for not applicable, 5 for partial, 10 for excellent." });

    fieldset.appendChild(legend);
    fieldset.appendChild(title);
    fieldset.appendChild(row);
    fieldset.appendChild(textarea);
    fieldset.appendChild(hint);

    container.appendChild(fieldset);
  });
}

function clampToRange(value) {
  if (Number.isNaN(value)) return 0;
  if (value < 0) return 0;
  if (value > 10) return 10;
  return value;
}

function updateTotals() {
  const scoreInputs = /** @type {NodeListOf<HTMLInputElement>} */ (
    document.querySelectorAll('[id^="score-number-"]')
  );
  let total = 0;
  scoreInputs.forEach((input) => {
    const val = clampToRange(parseInt(input.value, 10));
    total += val;
  });
  const totalEl = document.getElementById("totalScore");
  if (totalEl) totalEl.textContent = String(total);
}

function collectData() {
  const entries = questions.map((text, index) => {
    const scoreInput = /** @type {HTMLInputElement|null} */ (document.getElementById(`score-number-${index}`));
    const infoInput = /** @type {HTMLTextAreaElement|null} */ (document.getElementById(`info-${index}`));
    const score = scoreInput ? clampToRange(parseInt(scoreInput.value, 10)) : 0;
    const info = infoInput ? infoInput.value : "";
    return { index: index + 1, question: text, score, info };
  });

  const totalScore = entries.reduce((sum, e) => sum + e.score, 0);
  return {
    completedAt: new Date().toISOString(),
    totalScore,
    outOf: 10 * questions.length,
    entries
  };
}

function saveToStorage() {
  const data = collectData();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.entries)) return;
    data.entries.forEach((entry, i) => {
      const numberInput = /** @type {HTMLInputElement|null} */ (document.getElementById(`score-number-${i}`));
      const rangeInput = /** @type {HTMLInputElement|null} */ (document.getElementById(`score-range-${i}`));
      const textarea = /** @type {HTMLTextAreaElement|null} */ (document.getElementById(`info-${i}`));
      if (numberInput && rangeInput) {
        const clamped = clampToRange(parseInt(entry.score, 10));
        numberInput.value = String(clamped);
        rangeInput.value = String(clamped);
      }
      if (textarea && typeof entry.info === "string") {
        textarea.value = entry.info;
      }
    });
    updateTotals();
  } catch (e) {
    console.warn("Failed to load saved assessment:", e);
  }
}

function exportJson() {
  const data = collectData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `sre-assessment-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function resetForm() {
  if (!confirm("Clear all scores and notes?")) return;
  localStorage.removeItem(STORAGE_KEY);
  const inputs = /** @type {NodeListOf<HTMLInputElement>} */ (document.querySelectorAll('input[type="number"], input[type="range"]'));
  inputs.forEach((el) => { el.value = "0"; });
  const textareas = /** @type {NodeListOf<HTMLTextAreaElement>} */ (document.querySelectorAll("textarea"));
  textareas.forEach((el) => { el.value = ""; });
  updateTotals();
}

function setupControls() {
  const exportBtn = document.getElementById("exportBtn");
  const printBtn = document.getElementById("printBtn");
  const resetBtn = document.getElementById("resetBtn");
  exportBtn?.addEventListener("click", exportJson);
  printBtn?.addEventListener("click", () => window.print());
  resetBtn?.addEventListener("click", resetForm);
}

window.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("questionsContainer");
  if (!container) return;
  renderQuestions(container);
  setupControls();
  loadFromStorage();
  updateTotals();
});