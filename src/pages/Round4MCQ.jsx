import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import ProgressBar from '../components/ProgressBar';
import ScoreDisplay from '../components/ScoreDisplay';
import Button from '../components/Button';
import Confetti from '../components/Confetti';
import { playSound } from '../utils/sounds';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];
const OPTION_COLORS = [
  { base: 'border-indigo-500/30', active: 'border-indigo-500 bg-indigo-500/20', label: 'text-indigo-400' },
  { base: 'border-purple-500/30', active: 'border-purple-500 bg-purple-500/20', label: 'text-purple-400' },
  { base: 'border-cyan-500/30', active: 'border-cyan-500 bg-cyan-500/20', label: 'text-cyan-400' },
  { base: 'border-pink-500/30', active: 'border-pink-500 bg-pink-500/20', label: 'text-pink-400' },
];

export default function Round4MCQ({ questions, onComplete, totalScore }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [roundScore, setRoundScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [confetti, setConfetti] = useState(false);
  const [finished, setFinished] = useState(false);

  const q = questions[current];

  const handleSelect = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    const isCorrect = idx === q.correct;
    if (isCorrect) {
      setRoundScore(s => s + 10);
      setCorrect(c => c + 1);
      playSound('correct');
      setConfetti(true);
      setTimeout(() => setConfetti(false), 100);
    } else {
      playSound('wrong');
    }
  };

  const handleNext = () => {
    if (current + 1 >= questions.length) {
      setFinished(true);
      playSound('complete');
      setTimeout(() => onComplete(roundScore), 1500);
      return;
    }
    setCurrent(c => c + 1);
    setSelected(null);
  };

  if (finished) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen pt-20 flex items-center justify-center px-4">
        <Confetti trigger type="cannon" />
        <div className="glass rounded-3xl p-10 text-center max-w-sm border border-green-500/40">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-3xl font-black gradient-text mb-2">Round 4 Done!</h3>
          <p className="text-slate-400 mb-1">{correct}/{questions.length} correct</p>
          <div className="text-4xl font-black text-white mt-3">+{roundScore} pts</div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pt-20 pb-12 px-4">
      <Confetti trigger={confetti} type="standard" />
      <div className="max-w-2xl mx-auto">
        <ProgressBar currentRound={4} />

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-black gradient-text">📝 Round 4</h2>
            <p className="text-slate-400 text-sm">MCQ — {current + 1}/{questions.length}</p>
          </div>
          <div className="flex gap-3">
            <ScoreDisplay score={roundScore} label="Round" />
            <ScoreDisplay score={totalScore} label="Total" highlight />
          </div>
        </div>

        <div className="progress-bar mb-8">
          <motion.div className="progress-fill" animate={{ width: `${(current / questions.length) * 100}%` }} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ x: 80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -80, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Question */}
            <div className="glass rounded-2xl p-6 mb-6 border border-white/10 relative overflow-hidden">
              <motion.div className="absolute top-0 left-0 right-0 h-1"
                style={{ background: 'linear-gradient(90deg, #22C55E, #06B6D4)' }} />
              <div className="text-xs text-green-400 uppercase tracking-widest font-semibold mb-2">
                Question {current + 1} of {questions.length}
              </div>
              <p className="text-xl font-bold text-white leading-relaxed">{q.question}</p>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-6">
              {q.options.map((opt, idx) => {
                const isSelected = selected === idx;
                const isCorrect = idx === q.correct;
                const color = OPTION_COLORS[idx];

                let stateClass = `glass border ${color.base}`;
                if (selected !== null) {
                  if (isCorrect) stateClass = `border-2 border-green-500 bg-green-500/15`;
                  else if (isSelected && !isCorrect) stateClass = `border-2 border-red-500 bg-red-500/15`;
                  else stateClass = `glass border ${color.base} opacity-40`;
                }

                return (
                  <motion.button
                    key={idx}
                    whileHover={selected === null ? { x: 6, scale: 1.01 } : {}}
                    whileTap={selected === null ? { scale: 0.98 } : {}}
                    onClick={() => handleSelect(idx)}
                    disabled={selected !== null}
                    className={`w-full text-left rounded-xl p-4 transition-all duration-300 flex items-center gap-4 ${stateClass}`}
                  >
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0
                      ${selected !== null && isCorrect ? 'bg-green-500 text-white' :
                        selected !== null && isSelected ? 'bg-red-500 text-white' :
                        `glass ${color.label}`}`}>
                      {selected !== null && isCorrect ? '✓' : selected !== null && isSelected ? '✗' : OPTION_LABELS[idx]}
                    </span>
                    <span className="text-slate-200 font-medium">{opt}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Explanation */}
            <AnimatePresence>
              {selected !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-xl p-4 mb-6 border text-sm
                    ${selected === q.correct ? 'bg-green-500/10 border-green-500/30 text-green-300' : 'bg-orange-500/10 border-orange-500/30 text-orange-300'}`}
                >
                  <span className="font-bold block mb-1">
                    {selected === q.correct ? '✅ Correct!' : `❌ Correct answer: ${q.options[q.correct]}`}
                  </span>
                  {q.explanation}
                </motion.div>
              )}
            </AnimatePresence>

            {selected !== null && (
              <Button onClick={handleNext} variant="gradient" size="lg" className="w-full" icon={<ChevronRight />}>
                {current + 1 >= questions.length ? 'Finish Round' : 'Next Question'}
              </Button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
