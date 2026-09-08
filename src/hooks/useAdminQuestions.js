import { useState, useCallback, useEffect } from 'react';
import {
  getAdminQuestions,
  saveAdminQuestions,
  addAdminQuestion,
  updateAdminQuestion,
  deleteAdminQuestion,
  resetAdminQuestions,
  emptyAdminBank,
} from '../utils/storage';
import {
  crosswordWords,
  thisOrThatQuestions,
  riddles,
  mcqQuestions,
  rapidFireQuestions,
} from '../data/questions';

// ────────────────────────────────────────────────────────────
// Build the "default" bank from the static questions.js data,
// adding a stable `id` to every entry so CRUD works properly.
// ────────────────────────────────────────────────────────────
function buildDefaultBank() {
  return {
    crossword: crosswordWords.map((q, i) => ({
      id: `cw_default_${i}`,
      answer: q.answer,
      hint: q.hint,
    })),
    thisOrThat: thisOrThatQuestions.map((q, i) => ({
      id: `tot_default_${i}`,
      question: q.question,
      optionA: q.optionA,
      optionB: q.optionB,
      correct: q.correct,
      explanation: q.explanation ?? '',
    })),
    riddles: riddles.map((q, i) => ({
      id: `rid_default_${i}`,
      riddle: q.riddle,
      answer: q.answer,
      hint: q.hint ?? '',
    })),
    mcq: mcqQuestions.map((q, i) => ({
      id: `mcq_default_${i}`,
      question: q.question,
      options: [...q.options],
      correct: q.correct,
      explanation: q.explanation ?? '',
    })),
    rapidFire: rapidFireQuestions.map((q, i) => ({
      id: `rf_default_${i}`,
      question: q.question,
      answer: q.answer,
      timeLimit: q.timeLimit ?? 10,
    })),
  };
}

/** Generate a simple unique id */
export function genId(prefix = 'q') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ────────────────────────────────────────────────────────────
// Hook
// ────────────────────────────────────────────────────────────
export function useAdminQuestions() {
  const [bank, setBank] = useState(() => {
    const stored = getAdminQuestions();
    if (stored !== null) return stored;          // already initialised
    const defaults = buildDefaultBank();
    saveAdminQuestions(defaults);               // seed localStorage once
    return defaults;
  });

  // Keep localStorage in sync whenever bank changes
  useEffect(() => {
    saveAdminQuestions(bank);
  }, [bank]);

  // ── helpers ──────────────────────────────────────────────

  const addQuestion = useCallback((round, question) => {
    const updated = addAdminQuestion(round, question);
    setBank({ ...updated });
  }, []);

  const updateQuestion = useCallback((round, question) => {
    const updated = updateAdminQuestion(round, question);
    setBank({ ...updated });
  }, []);

  const removeQuestion = useCallback((round, id) => {
    const updated = deleteAdminQuestion(round, id);
    setBank({ ...updated });
  }, []);

  const resetToDefaults = useCallback(() => {
    const defaults = buildDefaultBank();
    const updated = resetAdminQuestions(defaults);
    setBank({ ...updated });
  }, []);

  const getCount = useCallback((round) => {
    return (bank[round] ?? []).length;
  }, [bank]);

  return {
    bank,
    addQuestion,
    updateQuestion,
    removeQuestion,
    resetToDefaults,
    getCount,
    buildDefaultBank,
  };
}
