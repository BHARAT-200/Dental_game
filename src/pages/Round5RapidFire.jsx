import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Send } from 'lucide-react';
import ProgressBar from '../components/ProgressBar';
import ScoreDisplay from '../components/ScoreDisplay';
import Button from '../components/Button';
import Confetti from '../components/Confetti';
import { playSound } from '../utils/sounds';
import { answersMatch } from '../utils/helpers';

export default function Round5RapidFire({ currentRound = 5, questions, onComplete, totalScore, onQuestionAnswered }) {
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit || 10);
  const [roundScore, setRoundScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [finished, setFinished] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [streak, setStreak] = useState(0);
  const [timeUpAnim, setTimeUpAnim] = useState(false);

  const inputRef = useRef(null);
  const timerRef = useRef(null);

  const q = questions[current];
  const maxTime = q?.timeLimit || 10;

  const advance = useCallback(() => {
    clearInterval(timerRef.current);
    if (current + 1 >= questions.length) {
      setFinished(true);
      playSound('complete');
      return;
    }
    setTimeout(() => {
      setCurrent(c => c + 1);
      setInput('');
      setAnswered(false);
      setIsCorrect(null);
      setTimeUpAnim(false);
    }, 900);
  }, [current, questions.length]);

  // Start / reset timer
  useEffect(() => {
    if (answered) return;
    setTimeLeft(q?.timeLimit || 10);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setTimeUpAnim(true);
          setAnswered(true);
          setIsCorrect(false);
          setStreak(0);
          playSound('wrong');
          setTimeout(advance, 1200);
          return 0;
        }
        if (t <= 3) playSound('tick');
        return t - 1;
      });
    }, 1000);
    inputRef.current?.focus();
    return () => clearInterval(timerRef.current);
  }, [current, q, answered, advance]);

  const handleSubmit = () => {
    if (answered || !input.trim()) return;
    clearInterval(timerRef.current);
    const ok = answersMatch(input, q.answer);
    setIsCorrect(ok);
    setAnswered(true);
    if (ok) {
      setRoundScore(s => s + 5);
      setCorrect(c => c + 1);
      setStreak(s => s + 1);
      playSound('correct');
      setConfetti(true);
      setTimeout(() => setConfetti(false), 100);
    } else {
      setStreak(0);
      playSound('wrong');
    }
    setTimeout(advance, 900);
  };

  useEffect(() => {
    if (finished) {
      setTimeout(() => onComplete(roundScore), 1500);
    }
  }, [finished, roundScore, onComplete]);

  if (finished) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen pt-20 flex items-center justify-center px-4">
        <Confetti trigger type="burst" />
        <div className="glass rounded-3xl p-10 text-center max-w-sm border border-yellow-500/40">
          <div className="text-6xl mb-4">⚡</div>
          <h3 className="text-3xl font-black gradient-text mb-2">Round 5 Done!</h3>
          <p className="text-slate-400 mb-1">{correct}/{questions.length} correct</p>
          <div className="text-4xl font-black text-white mt-3">+{roundScore} pts</div>
        </div>
      </motion.div>
    );
  }

  const timerPercent = (timeLeft / maxTime) * 100;
  const timerColor = timeLeft <= 3 ? '#EF4444' : timeLeft <= 5 ? '#F59E0B' : '#22C55E';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pt-20 pb-12 px-4">
      <Confetti trigger={confetti} type="standard" />
      <div className="max-w-xl mx-auto">
        <ProgressBar currentRound={5} />

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-black gradient-text">⚡ Round 5</h2>
            <p className="text-slate-400 text-sm">Rapid Fire — {current + 1}/{questions.length}</p>
          </div>
          <div className="flex gap-3">
            <ScoreDisplay score={roundScore} label="Round" />
            <ScoreDisplay score={totalScore} label="Total" highlight />
          </div>
        </div>

        {/* Overall progress */}
        <div className="progress-bar mb-3">
          <motion.div className="progress-fill" animate={{ width: `${(current / questions.length) * 100}%` }} />
        </div>

        {/* Streak */}
        {streak >= 3 && (
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="text-center text-yellow-400 text-sm font-bold mb-3"
          >
            🔥 {streak} answer streak!
          </motion.div>
        )}

        {/* Timer */}
        <div className="flex justify-center mb-6">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
              <motion.circle
                cx="50" cy="50" r="45" fill="none"
                stroke={timerColor}
                strokeWidth="8"
                strokeLinecap="round"
                className="timer-circle"
                animate={{ strokeDashoffset: 283 - (283 * timerPercent) / 100 }}
                transition={{ duration: 0.5, ease: 'linear' }}
                style={{ strokeDasharray: 283 }}
              />
            </svg>
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={timeLeft <= 3 ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.5, repeat: timeLeft <= 3 ? Infinity : 0 }}
            >
              <span className="text-2xl font-black" style={{ color: timerColor }}>{timeLeft}</span>
            </motion.div>
          </div>
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          {!timeUpAnim ? (
            <motion.div
              key={current}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="glass rounded-2xl p-8 mb-6 border border-yellow-500/20 relative overflow-hidden"
            >
              <motion.div className="absolute top-0 left-0 right-0 h-1"
                style={{ background: `linear-gradient(90deg, ${timerColor}, #8B5CF6)` }}
                animate={{ scaleX: timerPercent / 100 }}
                style={{ transformOrigin: 'left', background: 'linear-gradient(90deg, #F59E0B, #EF4444)' }}
              />
              <div className="flex items-center gap-2 mb-2">
                <Zap size={16} className="text-yellow-400" />
                <span className="text-xs text-yellow-400 font-semibold uppercase tracking-widest">Rapid Fire</span>
              </div>
              <p className="text-xl font-bold text-white">{q?.question}</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass rounded-2xl p-8 mb-6 border border-red-500/40 text-center"
            >
              <div className="text-4xl mb-2">⏰</div>
              <div className="text-xl font-bold text-red-400">Time's Up!</div>
              <div className="text-sm text-slate-400 mt-1">Answer: <span className="text-cyan-400 font-bold">{q?.answer}</span></div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input */}
        {!answered && (
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="Quick! Type your answer…"
              className="flex-1 rounded-xl px-4 py-3 text-sm outline-none"
            />
            <Button onClick={handleSubmit} variant="primary" size="md" icon={<Send size={14} />} disabled={!input.trim()}>
              Go!
            </Button>
          </div>
        )}

        {/* Result flash */}
        <AnimatePresence>
          {answered && !timeUpAnim && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={`rounded-xl p-4 text-center font-bold
                ${isCorrect ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}
            >
              {isCorrect ? `✅ Correct! +5 pts` : `❌ Answer: ${q?.answer}`}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <div className="flex justify-between mt-4 text-sm text-slate-400">
          <span className="text-green-400 font-semibold">✓ {correct}</span>
          <span>{current}/{questions.length} done</span>
          <span className="text-yellow-400">⚡ {roundScore} pts</span>
        </div>
      </div>
    </motion.div>
  );
}
