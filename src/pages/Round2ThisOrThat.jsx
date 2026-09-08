import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import ProgressBar from '../components/ProgressBar';
import ScoreDisplay from '../components/ScoreDisplay';
import Button from '../components/Button';
import Confetti from '../components/Confetti';
import { playSound } from '../utils/sounds';

export default function Round2ThisOrThat({ questions, onComplete, totalScore }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [roundScore, setRoundScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [finished, setFinished] = useState(false);

  const q = questions[current];
  const progress = ((current) / questions.length) * 100;

  const handleSelect = (choice) => {
    if (selected) return;
    setSelected(choice);
    const isCorrect = choice === q.correct;
    if (isCorrect) {
      setRoundScore(s => s + 10);
      setCorrect(c => c + 1);
      playSound('correct');
      setConfetti(true);
      setTimeout(() => setConfetti(false), 100);
    } else {
      setWrong(w => w + 1);
      playSound('wrong');
    }
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (current + 1 >= questions.length) {
      setFinished(true);
      playSound('complete');
      setTimeout(() => onComplete(roundScore + (selected === q.correct ? 10 : 0)), 1500);
      return;
    }
    setCurrent(c => c + 1);
    setSelected(null);
    setShowExplanation(false);
  };

  if (finished) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen pt-20 flex items-center justify-center px-4">
        <Confetti trigger type="cannon" />
        <div className="glass rounded-3xl p-10 text-center max-w-sm border border-purple-500/40">
          <div className="text-6xl mb-4">⚖️</div>
          <h3 className="text-3xl font-black gradient-text mb-2">Round 2 Done!</h3>
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
        <ProgressBar currentRound={2} />

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-black gradient-text">⚖️ Round 2</h2>
            <p className="text-slate-400 text-sm">This or That — {current + 1}/{questions.length}</p>
          </div>
          <div className="flex gap-3">
            <ScoreDisplay score={roundScore} label="Round" />
            <ScoreDisplay score={totalScore} label="Total" highlight />
          </div>
        </div>

        {/* Progress bar */}
        <div className="progress-bar mb-8">
          <motion.div className="progress-fill" animate={{ width: `${progress}%` }} />
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -60, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="glass rounded-2xl p-8 mb-6 border border-white/10 text-center"
          >
            <div className="text-sm text-purple-400 font-semibold mb-3 uppercase tracking-widest">
              Question {current + 1}
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white leading-relaxed">{q.question}</h3>
          </motion.div>
        </AnimatePresence>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {[{ key: 'A', label: q.optionA }, { key: 'B', label: q.optionB }].map(({ key, label }) => {
            const isSelected = selected === key;
            const isCorrect = key === q.correct;
            let borderClass = 'border-white/10';
            let bgClass = 'glass';
            if (selected) {
              if (isCorrect) { borderClass = 'border-green-500'; bgClass = 'bg-green-500/20'; }
              else if (isSelected) { borderClass = 'border-red-500'; bgClass = 'bg-red-500/20'; }
              else { borderClass = 'border-white/5'; bgClass = 'bg-white/2 opacity-50'; }
            }

            return (
              <motion.button
                key={key}
                whileHover={!selected ? { scale: 1.03, y: -4 } : {}}
                whileTap={!selected ? { scale: 0.97 } : {}}
                onClick={() => handleSelect(key)}
                disabled={!!selected}
                className={`${bgClass} border ${borderClass} rounded-2xl p-6 text-center transition-all duration-300 cursor-pointer group`}
              >
                <div className="text-3xl mb-3">{key === 'A' ? '🅰️' : '🅱️'}</div>
                <div className="text-lg font-bold text-white">{label}</div>
                {selected && isCorrect && <div className="text-2xl mt-2">✅</div>}
                {selected && isSelected && !isCorrect && <div className="text-2xl mt-2">❌</div>}
              </motion.button>
            );
          })}
        </div>

        {/* Explanation */}
        <AnimatePresence>
          {showExplanation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`rounded-xl p-4 mb-6 border text-sm
                ${selected === q.correct ? 'bg-green-500/10 border-green-500/30 text-green-300' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}
            >
              <span className="font-bold mr-2">{selected === q.correct ? '✓ Correct!' : '✗ Wrong!'}</span>
              {q.explanation}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scores row */}
        <div className="flex justify-between items-center text-sm text-slate-400 mb-4">
          <span className="text-green-400 font-semibold">✓ {correct} Correct</span>
          <span className="text-red-400 font-semibold">✗ {wrong} Wrong</span>
        </div>

        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Button onClick={handleNext} variant="gradient" size="lg" className="w-full" icon={<ChevronRight />}>
              {current + 1 >= questions.length ? 'Finish Round' : 'Next Question'}
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
