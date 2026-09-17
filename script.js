const CIRCUMFERENCE = 2 * Math.PI * 100; // r=100

let elapsedMs = 0;
let running = false;
let lastTick = null;
let rafId = null;
let lapCount = 0;

const dial = document.getElementById("dial");
const statusEl = document.getElementById("status");
const ringProgress = document.getElementById("ringProgress");
const hhEl = document.getElementById("hh");
const mmEl = document.getElementById("mm");
const ssEl = document.getElementById("ss");
const toggleBtn = document.getElementById("toggle");
const resetBtn = document.getElementById("resetBtn");
const lapBtn = document.getElementById("lapReset");
const lapsEl = document.getElementById("laps");

ringProgress.style.strokeDasharray = String(CIRCUMFERENCE);

function pad(n) {
  return String(n).padStart(2, "0");
}

function parts(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  return {
    h: Math.floor(totalSeconds / 3600),
    m: Math.floor((totalSeconds % 3600) / 60),
    s: totalSeconds % 60,
  };
}

function setDigit(el, value) {
  const text = pad(value);
  if (el.textContent !== text) {
    el.textContent = text;
    el.classList.remove("tick");
    // force reflow so the animation can restart
    void el.offsetWidth;
    el.classList.add("tick");
  }
}

function render() {
  const { h, m, s } = parts(elapsedMs);
  setDigit(hhEl, h);
  setDigit(mmEl, m);
  setDigit(ssEl, s);

  const secondFraction = (elapsedMs % 60000) / 60000;
  const offset = CIRCUMFERENCE * (1 - secondFraction);
  ringProgress.style.strokeDashoffset = String(offset);
}

function loop() {
  const now = performance.now();
  elapsedMs += now - lastTick;
  lastTick = now;
  render();
  rafId = requestAnimationFrame(loop);
}

function start() {
  if (running) return;
  running = true;
  lastTick = performance.now();
  rafId = requestAnimationFrame(loop);

  dial.classList.add("running");
  statusEl.textContent = "실행 중";
  toggleBtn.textContent = "일시정지";
  toggleBtn.classList.add("is-running");
  resetBtn.disabled = true;
  lapBtn.disabled = false;
}

function pause() {
  if (!running) return;
  running = false;
  cancelAnimationFrame(rafId);

  dial.classList.remove("running");
  statusEl.textContent = "일시정지됨";
  toggleBtn.textContent = "계속";
  toggleBtn.classList.remove("is-running");
  resetBtn.disabled = false;
  lapBtn.disabled = true;
}

function reset() {
  if (running) return;
  elapsedMs = 0;
  lapCount = 0;
  lapsEl.innerHTML = "";
  statusEl.textContent = "정지됨";
  toggleBtn.textContent = "시작";
  render();
}

function addLap() {
  if (!running) return;
  lapCount += 1;
  const { h, m, s } = parts(elapsedMs);
  const li = document.createElement("li");
  li.innerHTML = `<span class="lap-index">랩 ${lapCount}</span><span>${pad(h)}:${pad(m)}:${pad(s)}</span>`;
  lapsEl.prepend(li);
}

toggleBtn.addEventListener("click", () => {
  running ? pause() : start();
});

resetBtn.addEventListener("click", reset);
lapBtn.addEventListener("click", addLap);

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    running ? pause() : start();
  } else if (e.key.toLowerCase() === "r") {
    reset();
  }
});

lapBtn.disabled = true;
render();