const colors = ["red", "green", "blue", "yellow"];
let trials = [];
let currentTrial = 0;
let startTime;
let results = [];

function makeTrials(num = 20) {
  for (let i = 0; i < num; i++) {
    const word = colors[Math.floor(Math.random() * colors.length)];
    let color;
    if (Math.random() < 0.5) {
      color = word; // congruent
    } else {
      // pick a different color
      const incongruentColors = colors.filter(c => c !== word);
      color = incongruentColors[Math.floor(Math.random() * incongruentColors.length)];
    }
    trials.push({ word, color });
  }
}

function showTrial() {
  if (currentTrial >= trials.length) {
    endTest();
    return;
  }
  const trial = trials[currentTrial];
  const stim = document.getElementById("stimulus");
  stim.textContent = trial.word.toUpperCase();
  stim.style.color = trial.color;
  startTime = Date.now();
}

function handleResponse(key) {
  if (!startTime) return;
  const trial = trials[currentTrial];
  const rt = Date.now() - startTime;
  const mapping = { r: "red", g: "green", b: "blue", y: "yellow" };
  const response = mapping[key];
  const correct = response === trial.color;
  const congruent = trial.word === trial.color;
  results.push({ ...trial, response, correct, rt, congruent });
  currentTrial++;
  startTime = null;
  document.getElementById("feedback").textContent = correct ? "✅ Correct" : "❌ Wrong";
  setTimeout(() => {
    document.getElementById("feedback").textContent = "";
    showTrial();
  }, 500);
}

function endTest() {
  document.getElementById("stimulus").textContent = "Test Complete!";
  const congruent = results.filter(r => r.congruent);
  const incongruent = results.filter(r => !r.congruent);

  const avgRT = arr => arr.reduce((a,b) => a+b.rt, 0) / arr.length;
  const report = `
    Congruent: ${congruent.filter(r=>r.correct).length}/${congruent.length} correct, avg RT ${avgRT(congruent).toFixed(1)} ms
    Incongruent: ${incongruent.filter(r=>r.correct).length}/${incongruent.length} correct, avg RT ${avgRT(incongruent).toFixed(1)} ms
  `;

  document.getElementById("feedback").textContent = report;

  // Download results as CSV
  const csv = "word,color,response,correct,rt,congruent\n" +
    results.map(r => `${r.word},${r.color},${r.response},${r.correct},${r.rt},${r.congruent}`).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "stroop_results.csv";
  a.textContent = "Download Results";
  document.body.appendChild(a);
}

document.addEventListener("keydown", e => {
  if (e.code === "Space" && trials.length === 0) {
    makeTrials(20);
    showTrial();
  } else if (["KeyR", "KeyG", "KeyB", "KeyY"].includes(e.code)) {
    handleResponse(e.key.toLowerCase());
  }
});
