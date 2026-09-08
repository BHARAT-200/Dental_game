import { useState, useCallback } from 'react';
import { pickRandom, shuffle } from '../utils/helpers';
import {
  imageQuestions,
  thisOrThatQuestions,
  riddles,
  mcqQuestions,
  rapidFireQuestions,
} from '../data/questions';
import { getAdminQuestions } from '../utils/storage';

export const SCREENS = {
  HOME: 'home',
  BUILDER: 'builder',
  ADMIN: 'admin',
  INSTRUCTIONS: 'instructions',
  ROUND1: 'round1',
  ROUND2: 'round2',
  ROUND3: 'round3',
  ROUND4: 'round4',
  ROUND5: 'round5',
  RESULT: 'result',
  LEADERBOARD: 'leaderboard',
};

const INITIAL_SCORE = {
  round1: 0, round2: 0, round3: 0, round4: 0, round5: 0, total: 0,
};

// ────────────────────────────────────────────────────────────
// Read the admin bank (or fall back to static data) and return
// a full question set ready for a game.
// ────────────────────────────────────────────────────────────
function buildQuestionsFromAdminBank() {
  const bank = getAdminQuestions();

  // Fallback pools from static data (used when bank is null or a round is empty)
  const fallbackImg   = imageQuestions;
  const fallbackTOT   = thisOrThatQuestions;
  const fallbackRid   = riddles;
  const fallbackMCQ   = mcqQuestions;
  const fallbackRF    = rapidFireQuestions;

  const imgPool = bank?.images?.length      ? bank.images      : fallbackImg;
  const totPool = bank?.thisOrThat?.length  ? bank.thisOrThat  : fallbackTOT;
  const ridPool = bank?.riddles?.length     ? bank.riddles     : fallbackRid;
  const mcqPool = bank?.mcq?.length         ? bank.mcq         : fallbackMCQ;
  const rfPool  = bank?.rapidFire?.length   ? bank.rapidFire   : fallbackRF;

  // Pick counts — select 10 for Round 1, use all available if fewer than 10
  const images = shuffle(imgPool).slice(0, Math.min(10, imgPool.length));

  return {
    images,
    thisOrThat: shuffle(totPool).slice(0, Math.min(10, totPool.length)),
    riddles:    shuffle(ridPool).slice(0, Math.min(8,  ridPool.length)),
    mcq:        shuffle(mcqPool).slice(0, Math.min(15, mcqPool.length)),
    rapidFire:  shuffle(rfPool).slice(0,  Math.min(20, rfPool.length)),
  };
}

export function useGameState() {
  const [screen, setScreen]               = useState(SCREENS.HOME);
  const [mode, setMode]                   = useState('random'); // 'random' | 'custom'
  const [scores, setScores]               = useState({ ...INITIAL_SCORE });
  const [questions, setQuestions]         = useState(null);
  const [customQuestions, setCustomQuestions] = useState(null);
  const [startTime, setStartTime]         = useState(null);
  const [roundResults, setRoundResults]   = useState({});

  // ── Start a random game using the admin question bank ────
  const startRandomGame = useCallback(() => {
    const q = buildQuestionsFromAdminBank();
    setQuestions(q);
    setMode('random');
    setScores({ ...INITIAL_SCORE });
    setRoundResults({});
    setStartTime(Date.now());
    setScreen(SCREENS.INSTRUCTIONS);
  }, []);

  // ── Start a custom (QuestionBuilder) game ───────────────
  // The custom game is TEMPORARY — it does NOT affect the
  // persistent admin bank.
  const startCustomGame = useCallback((custom) => {
    const bank = getAdminQuestions();

    const fallbackImg = bank?.images?.length      ? bank.images      : imageQuestions;
    const fallbackTOT = bank?.thisOrThat?.length  ? bank.thisOrThat  : thisOrThatQuestions;
    const fallbackRid = bank?.riddles?.length     ? bank.riddles     : riddles;
    const fallbackMCQ = bank?.mcq?.length         ? bank.mcq         : mcqQuestions;
    const fallbackRF  = bank?.rapidFire?.length   ? bank.rapidFire   : rapidFireQuestions;

    const imgSource = custom.images?.length
      ? custom.images
      : shuffle(fallbackImg).slice(0, Math.min(10, fallbackImg.length));

    const q = {
      images: imgSource,
      thisOrThat: custom.thisOrThat?.length
        ? custom.thisOrThat
        : shuffle(fallbackTOT).slice(0, Math.min(10, fallbackTOT.length)),
      riddles: custom.riddles?.length
        ? custom.riddles
        : shuffle(fallbackRid).slice(0, Math.min(8, fallbackRid.length)),
      mcq: custom.mcq?.length
        ? custom.mcq
        : shuffle(fallbackMCQ).slice(0, Math.min(15, fallbackMCQ.length)),
      rapidFire: custom.rapidFire?.length
        ? custom.rapidFire
        : shuffle(fallbackRF).slice(0, Math.min(20, fallbackRF.length)),
    };

    setQuestions(q);
    setCustomQuestions(custom);
    setMode('custom');
    setScores({ ...INITIAL_SCORE });
    setRoundResults({});
    setStartTime(Date.now());
    setScreen(SCREENS.INSTRUCTIONS);
  }, []);

  const addScore = useCallback((round, points) => {
    setScores(prev => {
      const updated = { ...prev, [round]: prev[round] + points };
      updated.total = updated.round1 + updated.round2 + updated.round3 + updated.round4 + updated.round5;
      return updated;
    });
  }, []);

  const setRoundResult = useCallback((round, result) => {
    setRoundResults(prev => ({ ...prev, [round]: result }));
  }, []);

  const goToScreen = useCallback((s) => {
    setScreen(s);
  }, []);

  const resetGame = useCallback(() => {
    setScores({ ...INITIAL_SCORE });
    setRoundResults({});
    setStartTime(null);
    setQuestions(null);
    setScreen(SCREENS.HOME);
  }, []);

  const getElapsedTime = useCallback(() => {
    if (!startTime) return 0;
    return Math.floor((Date.now() - startTime) / 1000);
  }, [startTime]);

  return {
    screen, setScreen: goToScreen,
    mode,
    scores, addScore,
    questions,
    customQuestions, setCustomQuestions,
    startRandomGame,
    startCustomGame,
    roundResults, setRoundResult,
    resetGame,
    getElapsedTime,
    SCREENS,
  };
}
