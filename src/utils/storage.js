// ============================================================
// LocalStorage utility helpers
// ============================================================

const KEYS = {
  LEADERBOARD: 'qc_leaderboard',
  SETTINGS: 'qc_settings',
  BEST_SCORE: 'qc_best_score',
  GAME_STATE: 'qc_game_state',
  ADMIN_QUESTIONS: 'qc_admin_questions',
};

// --- Leaderboard ---
export function getLeaderboard() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.LEADERBOARD)) || [];
  } catch { return []; }
}

export function addLeaderboardEntry(entry) {
  const board = getLeaderboard();
  board.push({ ...entry, date: new Date().toISOString() });
  board.sort((a, b) => b.score - a.score);
  const top10 = board.slice(0, 10);
  localStorage.setItem(KEYS.LEADERBOARD, JSON.stringify(top10));
  return top10;
}

export function clearLeaderboard() {
  localStorage.removeItem(KEYS.LEADERBOARD);
}

// --- Best Score ---
export function getBestScore() {
  return parseInt(localStorage.getItem(KEYS.BEST_SCORE) || '0', 10);
}

export function setBestScore(score) {
  const current = getBestScore();
  if (score > current) {
    localStorage.setItem(KEYS.BEST_SCORE, score.toString());
  }
}

// --- Settings ---
export const DEFAULT_SETTINGS = {
  soundEnabled: true,
  musicEnabled: false,
  theme: 'dark',
  playerName: 'Player',
};

export function getSettings() {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(KEYS.SETTINGS)) };
  } catch { return { ...DEFAULT_SETTINGS }; }
}

export function saveSettings(settings) {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

// --- Game state ---
export function saveGameState(state) {
  localStorage.setItem(KEYS.GAME_STATE, JSON.stringify(state));
}

export function loadGameState() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.GAME_STATE));
  } catch { return null; }
}

export function clearGameState() {
  localStorage.removeItem(KEYS.GAME_STATE);
}

// ============================================================
// Admin Question Bank
// ============================================================
// Structure:
// {
//   crossword:  [{ id, answer, hint }, ...]
//   thisOrThat: [{ id, question, optionA, optionB, correct, explanation }, ...]
//   riddles:    [{ id, riddle, answer, hint }, ...]
//   mcq:        [{ id, question, options:[4], correct, explanation }, ...]
//   rapidFire:  [{ id, question, answer, timeLimit }, ...]
// }

/** Return an empty bank skeleton */
export function emptyAdminBank() {
  return { crossword: [], thisOrThat: [], riddles: [], mcq: [], rapidFire: [] };
}

/**
 * Read the admin question bank from localStorage.
 * Returns null when the key has never been set (first-run detection).
 */
export function getAdminQuestions() {
  try {
    const raw = localStorage.getItem(KEYS.ADMIN_QUESTIONS);
    if (raw === null) return null;          // key never set → first run
    const parsed = JSON.parse(raw);
    // ensure all expected keys exist (forward-compatibility)
    return { ...emptyAdminBank(), ...parsed };
  } catch {
    return null;
  }
}

/** Persist the whole bank */
export function saveAdminQuestions(bank) {
  localStorage.setItem(KEYS.ADMIN_QUESTIONS, JSON.stringify(bank));
}

/** Add a single question to a round; returns the updated bank */
export function addAdminQuestion(round, question) {
  const bank = getAdminQuestions() ?? emptyAdminBank();
  bank[round] = [...(bank[round] ?? []), question];
  saveAdminQuestions(bank);
  return bank;
}

/** Replace one question (matched by id) in a round; returns updated bank */
export function updateAdminQuestion(round, updatedQuestion) {
  const bank = getAdminQuestions() ?? emptyAdminBank();
  bank[round] = (bank[round] ?? []).map(q =>
    q.id === updatedQuestion.id ? updatedQuestion : q
  );
  saveAdminQuestions(bank);
  return bank;
}

/** Delete one question by id from a round; returns updated bank */
export function deleteAdminQuestion(round, id) {
  const bank = getAdminQuestions() ?? emptyAdminBank();
  bank[round] = (bank[round] ?? []).filter(q => q.id !== id);
  saveAdminQuestions(bank);
  return bank;
}

/** Overwrite the entire bank (used for reset-to-defaults) */
export function resetAdminQuestions(defaultBank) {
  saveAdminQuestions(defaultBank);
  return defaultBank;
}
