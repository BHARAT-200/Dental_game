// ============================================================
// General helpers
// ============================================================

/** Shuffle an array (Fisher-Yates) */
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Pick n unique random items from array */
export function pickRandom(arr, n) {
  return shuffle(arr).slice(0, Math.min(n, arr.length));
}

/** Format seconds to mm:ss */
export function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

/** Calculate performance badge */
export function getPerformanceBadge(accuracy) {
  if (accuracy >= 90) return { label: 'Quiz Master', emoji: '👑', color: 'text-yellow-400' };
  if (accuracy >= 75) return { label: 'Expert', emoji: '🥇', color: 'text-amber-400' };
  if (accuracy >= 50) return { label: 'Smart', emoji: '🥈', color: 'text-slate-300' };
  return { label: 'Beginner', emoji: '🥉', color: 'text-orange-400' };
}

/** Normalize answer for comparison (lowercase, trim) */
export function normalizeAnswer(str) {
  return str.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
}

/** Check if two answers match (flexible) */
export function answersMatch(userAnswer, correctAnswer) {
  const u = normalizeAnswer(userAnswer);
  const c = normalizeAnswer(correctAnswer);
  if (u === c) return true;
  // allow partial match for long answers
  if (c.length > 8 && u.length > 4) {
    return c.includes(u) || u.includes(c);
  }
  return false;
}

/** Ripple effect for buttons */
export function createRipple(event) {
  const button = event.currentTarget;
  const circle = document.createElement('span');
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;
  const rect = button.getBoundingClientRect();
  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${event.clientX - rect.left - radius}px`;
  circle.style.top = `${event.clientY - rect.top - radius}px`;
  circle.classList.add('ripple-effect');
  const existing = button.querySelector('.ripple-effect');
  if (existing) existing.remove();
  button.appendChild(circle);
}
