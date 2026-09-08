import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, ChevronRight, Send } from 'lucide-react';
import ProgressBar from '../components/ProgressBar';
import ScoreDisplay from '../components/ScoreDisplay';
import Button from '../components/Button';
import Confetti from '../components/Confetti';
import { playSound } from '../utils/sounds';
import { answersMatch } from '../utils/helpers';

export default function Round3Riddles({ currentRound = 3, riddles, onComplete, totalScore, onQuestionAnswered }) {
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [roundScore, setRoundScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [confetti, setConfetti] = useState(false);
  const [finished, setFinished] = useState(false);

  const q = riddles[current];

  const handleSubmit = () => {
    if (!input.trim() || submitted) return;
    const ok = answersMatch(input, q.answer);
    setIsCorrect(ok);
    setSubmitted(true);
    if (ok) {
      setRoundScore(s => s + 15);
      setCorrect(c => c + 1);
      playSound('correct');
      setConfetti(true);
      setTimeout(() => setConfetti(false), 100);
    } else {
      playSound('wrong');
    }
  };

  const handleNext = () => {
    if (current + 1 >= riddles.length) {
      setFinished(true);
      playSound('complete');
      setTimeout(() => onComplete(roundScore), 1500);
      return;
    }
    setCurrent(c => c + 1);
    setInput('');
    setSubmitted(false);
    setIsCorrect(null);
    setShowHint(false);
  };

  if (finished) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen pt-20 flex items-center justify-center px-4">
        <Confetti trigger type="cannon" />
        <div className="glass rounded-3xl p-10 text-center max-w-sm border border-cyan-500/40">
          <div className="text-6xl mb-4">🧩</div>
          <h3 className="text-3xl font-black gradient-text mb-2">Round 3 Done!</h3>
          <p className="text-slate-400 mb-1">{correct}/{riddles.length} solved</p>
          <div className="text-4xl font-black text-white mt-3">+{roundScore} pts</div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pt-20 pb-12 px-4">
      <Confetti trigger={confetti} type="standard" />
      <div className="max-w-xl mx-auto">
        <ProgressBar currentRound={currentRound} />

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-black gradient-text">🧩 Round 3</h2>
            <p className="text-slate-400 text-sm">Riddles — {current + 1}/{riddles.length}</p>
          </div>
          <div className="flex gap-3">
            <ScoreDisplay score={roundScore} label="Round" />
            <ScoreDisplay score={totalScore} label="Total" highlight />
          </div>
        </div>

        <div className="progress-bar mb-8">
          <motion.div className="progress-fill" animate={{ width: `${(current / riddles.length) * 100}%` }} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6"
          >
            {/* Riddle Card */}
            <div className="glass rounded-2xl p-8 border border-cyan-500/20 mb-4 text-center relative overflow-hidden">
              <motion.div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ background: 'linear-gradient(90deg, #06B6D4, #8B5CF6)' }}
              />
              <div className="text-4xl mb-4">🧩</div>
              <div className="text-xs text-cyan-400 uppercase tracking-widest font-semibold mb-3">Riddle {current + 1}</div>
              <p className="text-lg text-slate-200 leading-relaxed italic">"{q.riddle}"</p>
            </div>

            {/* Hint */}
            {q.hint && (
              <div className="mb-4">
                <button
                  onClick={() => { setShowHint(h => !h); playSound('click'); }}
                  className="flex items-center gap-2 text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
                >
                  <Lightbulb size={14} />
                  {showHint ? 'Hide Hint' : 'Show Hint'}
                </button>
                <AnimatePresence>
                  {showHint && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-2 glass rounded-xl p-3 text-sm text-yellow-300 border border-yellow-500/20"
                    >
                      💡 {q.hint}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Input */}
            {!submitted && (
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder="Type your answer…"
                  className="flex-1 rounded-xl px-4 py-3 text-sm outline-none"
                />
                <Button onClick={handleSubmit} variant="primary" size="md" icon={<Send size={14} />} disabled={!input.trim()}>
                  Submit
                </Button>
              </div>
            )}

            {/* Result */}
            <AnimatePresence>
              {submitted && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`rounded-2xl p-6 text-center border ${isCorrect ? 'bg-green-500/10 border-green-500/40' : 'bg-red-500/10 border-red-500/40'}`}
                >
                  <div className="text-4xl mb-2">{isCorrect ? '🎉' : '😬'}</div>
                  <div className={`text-xl font-bold mb-1 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                    {isCorrect ? 'Brilliant!' : 'Not quite!'}
                  </div>
                  {!isCorrect && (
                    <div className="text-sm text-slate-300 mb-2">
                      Answer: <span className="font-bold text-cyan-400">{q.answer}</span>
                    </div>
                  )}
                  {isCorrect && <div className="text-green-400 font-bold">+15 pts</div>}
                  <Button onClick={handleNext} variant="gradient" size="md" className="mt-4 w-full" icon={<ChevronRight />}>
                    {current + 1 >= riddles.length ? 'Finish Round' : 'Next Riddle'}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
