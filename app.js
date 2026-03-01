(function () {
  "use strict";

  function parseTime(str) {
    if (!str) return NaN;
    str = str.trim();
    if (!str) return NaN;

    if (/^\d+$/.test(str)) {
      const raw = parseInt(str, 10);
      const minutes = Math.floor(raw / 100);
      const seconds = raw % 100;
      return minutes * 60 + seconds;
    }

    const parts = str.split(":");
    if (parts.length === 2) {
      return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    }

    return NaN;
  }

  function formatTime(totalSeconds) {
    const s = Math.max(0, Math.floor(totalSeconds));
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m + ":" + (sec < 10 ? "0" : "") + sec;
  }

  function autoCorrectInput(el, defaultValue = null) {
    el.addEventListener("keydown", (e) => {
      if (e.key === "Tab" && defaultValue && !el.value.trim()) {
        e.preventDefault();
        el.value = defaultValue;
      }
    });

    el.addEventListener("blur", () => {
      const raw = el.value.trim();
      if (!raw && defaultValue) {
        el.value = defaultValue;
        return;
      }
      const seconds = parseTime(raw);
      if (!isNaN(seconds)) {
        el.value = formatTime(seconds);
      }
    });
  }

  const elements = {
    timerInput: document.getElementById("timerInput"),
    bigSignal: document.getElementById("bigSignal"),

    signal2: document.getElementById("signal2"),
    signal1: document.getElementById("signal1"),
    signalHook: document.getElementById("signalHook"),
    signalFist: document.getElementById("signalFist"),
    signalRaisedFist: document.getElementById("signalRaisedFist"),

    signalField2: document.getElementById("signalField2"),
    signalField1: document.getElementById("signalField1"),
    signalFieldHook: document.getElementById("signalFieldHook"),
    signalFieldFist: document.getElementById("signalFieldFist"),
    signalFieldRaisedFist: document.getElementById("signalFieldRaisedFist"),

    btnStart: document.getElementById("btnStart"),
    btnPause: document.getElementById("btnPause"),
    btnReset: document.getElementById("btnReset"),

    btnOpenSettings: document.getElementById("btnOpenSettings"),
    btnCloseSettings: document.getElementById("btnCloseSettings"),
    settingsOverlay: document.getElementById("settingsOverlay"),

    toggleSignal2: document.getElementById("toggleSignal2"),
    toggleSignal1: document.getElementById("toggleSignal1"),
    toggleSignalHook: document.getElementById("toggleSignalHook"),
    toggleSignalFist: document.getElementById("toggleSignalFist"),
    toggleSignalRaisedFist: document.getElementById("toggleSignalRaisedFist"),
  };

  const emojiMap = {
    two: "2",
    one: "1",
    hook: "🪝",
    fist: "✊",
    raisedFist: "✊⬆",
  };

  let state = {
    elapsedSeconds: 0,
    intervalId: null,
    running: false,
    signalAt: {},
    enabled: {
      two: true,
      one: true,
      hook: true,
      fist: true,
      raisedFist: true,
    },
    triggered: {},
    targetTime: 600
  };

  function flashSignal(key) {
    elements.bigSignal.textContent = emojiMap[key];
    elements.bigSignal.classList.add("flash");

    setTimeout(() => {
      elements.bigSignal.classList.remove("flash");
    }, 1200);
  }

  function readSignals() {
    state.signalAt.two = parseTime(elements.signal2.value);
    state.signalAt.one = parseTime(elements.signal1.value);
    state.signalAt.hook = parseTime(elements.signalHook.value);
    state.signalAt.fist = parseTime(elements.signalFist.value);
    state.signalAt.raisedFist = parseTime(elements.signalRaisedFist.value);
  }

  function updateTimerColor() {
    const t = state.elapsedSeconds;
    const target = state.targetTime;

    elements.timerInput.classList.remove("warning", "danger");

    if (t >= target + 60) {
      stopTimer();
    } else if (t >= target + 30) {
      elements.timerInput.classList.add("danger");
    } else if (t >= target) {
      elements.timerInput.classList.add("warning");
    }
  }

  function tick() {
    state.elapsedSeconds++;

    for (const key in state.signalAt) {
      if (
        state.enabled[key] &&
        state.signalAt[key] != null &&
        !state.triggered[key] &&
        state.elapsedSeconds >= state.signalAt[key]
      ) {
        state.triggered[key] = true;
        flashSignal(key);
      }
    }

    elements.timerInput.value = formatTime(state.elapsedSeconds);
    updateTimerColor();
  }

  function startTimer() {
    if (state.running) return;

    state.targetTime = parseTime(elements.timerInput.value) || 600;

    readSignals();
    state.elapsedSeconds = 0;
    state.triggered = {};
    state.running = true;

    elements.timerInput.classList.remove("warning", "danger");

    state.intervalId = setInterval(tick, 1000);
  }

  function stopTimer() {
    state.running = false;
    clearInterval(state.intervalId);
  }

  function resetTimer() {
    stopTimer();
    state.elapsedSeconds = 0;
    elements.timerInput.value = "10:00";
    elements.bigSignal.textContent = "—";
    elements.timerInput.classList.remove("warning", "danger");
  }

  function applySettings() {
    state.enabled.two = elements.toggleSignal2.checked;
    state.enabled.one = elements.toggleSignal1.checked;
    state.enabled.hook = elements.toggleSignalHook.checked;
    state.enabled.fist = elements.toggleSignalFist.checked;
    state.enabled.raisedFist = elements.toggleSignalRaisedFist.checked;

    elements.signalField2.classList.toggle("hidden", !state.enabled.two);
    elements.signalField1.classList.toggle("hidden", !state.enabled.one);
    elements.signalFieldHook.classList.toggle("hidden", !state.enabled.hook);
    elements.signalFieldFist.classList.toggle("hidden", !state.enabled.fist);
    elements.signalFieldRaisedFist.classList.toggle("hidden", !state.enabled.raisedFist);
  }

  elements.btnStart.addEventListener("click", startTimer);
  elements.btnPause.addEventListener("click", stopTimer);
  elements.btnReset.addEventListener("click", resetTimer);

  elements.btnOpenSettings.addEventListener("click", () =>
    elements.settingsOverlay.classList.add("open")
  );

  elements.btnCloseSettings.addEventListener("click", () =>
    elements.settingsOverlay.classList.remove("open")
  );

  elements.toggleSignal2.addEventListener("change", applySettings);
  elements.toggleSignal1.addEventListener("change", applySettings);
  elements.toggleSignalHook.addEventListener("change", applySettings);
  elements.toggleSignalFist.addEventListener("change", applySettings);
  elements.toggleSignalRaisedFist.addEventListener("change", applySettings);

  autoCorrectInput(elements.timerInput, "10:00");
  autoCorrectInput(elements.signal2);
  autoCorrectInput(elements.signal1);
  autoCorrectInput(elements.signalHook);
  autoCorrectInput(elements.signalFist);
  autoCorrectInput(elements.signalRaisedFist);

  applySettings();
})();