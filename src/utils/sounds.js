// ============================================================
// Sound effects using Web Audio API (no external files needed)
// ============================================================

let audioCtx = null;

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playTone(frequency, duration, type = 'sine', volume = 0.3, delay = 0) {
  try {
    const ctx = getCtx();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + delay);
    gainNode.gain.setValueAtTime(volume, ctx.currentTime + delay);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
    oscillator.start(ctx.currentTime + delay);
    oscillator.stop(ctx.currentTime + delay + duration);
  } catch (e) {
    // Silently ignore audio errors
  }
}

export const sounds = {
  correct: () => {
    playTone(523, 0.1, 'sine', 0.3);
    playTone(659, 0.1, 'sine', 0.3, 0.1);
    playTone(784, 0.2, 'sine', 0.3, 0.2);
  },
  wrong: () => {
    playTone(300, 0.15, 'sawtooth', 0.2);
    playTone(250, 0.2, 'sawtooth', 0.2, 0.15);
  },
  click: () => {
    playTone(800, 0.05, 'sine', 0.15);
  },
  tick: () => {
    playTone(1000, 0.03, 'square', 0.1);
  },
  complete: () => {
    [523, 587, 659, 698, 784, 880, 988].forEach((f, i) => {
      playTone(f, 0.15, 'sine', 0.3, i * 0.08);
    });
  },
  countdown: () => {
    playTone(440, 0.1, 'sine', 0.2);
  },
  gameOver: () => {
    playTone(784, 0.2, 'sine', 0.3);
    playTone(698, 0.2, 'sine', 0.3, 0.2);
    playTone(659, 0.2, 'sine', 0.3, 0.4);
    playTone(523, 0.4, 'sine', 0.3, 0.6);
  },
  start: () => {
    playTone(440, 0.1, 'sine', 0.2);
    playTone(550, 0.1, 'sine', 0.2, 0.1);
    playTone(660, 0.15, 'sine', 0.25, 0.2);
  },
};

let soundEnabled = true;

export function setSoundEnabled(enabled) {
  soundEnabled = enabled;
}

export function playSound(name) {
  if (!soundEnabled) return;
  if (sounds[name]) sounds[name]();
}
