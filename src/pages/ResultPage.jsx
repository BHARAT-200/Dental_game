import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Home, Trophy, Share2 } from 'lucide-react';
import Button from '../components/Button';
import Confetti from '../components/Confetti';
import { getPerformanceBadge, formatTime } from '../utils/helpers';
import { addLeaderboardEntry, setBestScore, getSettings } from '../utils/storage';
import { playSound } from '../utils/sounds';

export default function ResultPage({ scores, roundResults, elapsedTime, onPlayAgain, onHome, onLeaderboard }) {
  const [confetti, setConfetti] = useState(false);
  const { settings } = { settings: getSettings() };

  const total = scores.total;
  const maxScore = 12 * 10 + 10 * 10 + 8 * 15 + 15 * 10 + 20 * 5; // rough max
  const accuracy = Math.round((total / maxScore) * 100);
  const badge = getPerformanceBadge(accuracy);

  useEffect(() => {
    setBestScore(total);
    const name = getSettings().playerName || 'Player';
    addLeaderboardEntry({ name, score: total, accuracy, time: elapsedTime });
    playSound('gameOver');
    setTimeout(() => setConfetti(true), 400);
  }, []);

  const handleShare = () => {
    const text = `I scored ${total} points in Dental Quiz Challenge with ${accuracy}% accuracy! ${badge.emoji} ${badge.label}`;
    if (navigator.share) {
      navigator.share({ title: 'Dental Quiz', text });
    } else {
      navigator.clipboard.writeText(text);
      alert('Score copied to clipboard!');
    }
  };

  const rounds = [
    { label: 'Crossword', emoji: '🔤', score: scores.round1, max: 120 },
    { label: 'This or That', emoji: '⚖️', score: scores.round2, max: 100 },
    { label: 'Riddles', emoji: '🧩', score: scores.round3, max: 120 },
    { label: 'MCQ', emoji: '📝', score: scores.round4, max: 150 },
    { label: 'Rapid Fire', emoji: '⚡', score: scores.round5, max: 100 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pt-20 pb-12 px-4 flex flex-col items-center"
    >
      <Confetti trigger={confetti} type="burst" />

      <div className="max-w-2xl w-full mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
          className="text-center mb-8"
        >
          <div className="text-8xl mb-4">{badge.emoji}</div>
          <h2 className={`text-4xl font-black mb-2 ${badge.color}`}>{badge.label}</h2>
          <p className="text-slate-400">You completed the Dental Quiz Challenge!</p>
        </motion.div>

        {/* Main score */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-3xl p-8 mb-6 border border-indigo-500/30 text-center relative overflow-hidden"
        >
          <motion.div
            className="absolute inset-0 opacity-10"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            style={{ background: 'conic-gradient(#6366F1, #8B5CF6, #06B6D4, #22C55E, #6366F1)' }}
          />
          <div className="relative z-10">
            <div className="text-slate-400 text-sm uppercase tracking-widest mb-2">Final Score</div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-7xl font-black gradient-text mb-4"
            >
              {total}
            </motion.div>
            <div className="grid grid-cols-3 gap-4">
              <Stat label="Accuracy" value={`${accuracy}%`} color="text-cyan-400" />
              <Stat label="Time" value={formatTime(elapsedTime)} color="text-yellow-400" />
              <Stat label="Best" value={total} color="text-green-400" />
            </div>
          </div>
        </motion.div>

        {/* Round breakdown */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="glass rounded-2xl p-6 mb-6 border border-white/10"
        >
          <h3 className="text-lg font-bold text-white mb-4">Round Breakdown</h3>
          <div className="space-y-3">
            {rounds.map((r, i) => (
              <motion.div
                key={i}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <span className="text-xl w-8">{r.emoji}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300">{r.label}</span>
                    <span className="text-white font-bold">{r.score} pts</span>
                  </div>
                  <div className="progress-bar h-2">
                    <motion.div
                      className="progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((r.score / r.max) * 100, 100)}%` }}
                      transition={{ delay: 1 + i * 0.1, duration: 0.8 }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          <Button onClick={onPlayAgain} variant="gradient" size="md" icon={<RotateCcw size={16} />} className="col-span-2">
            Play Again
          </Button>
          <Button onClick={onHome} variant="secondary" size="md" icon={<Home size={16} />}>
            Home
          </Button>
          <Button onClick={handleShare} variant="secondary" size="md" icon={<Share2 size={16} />}>
            Share
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="mt-4"
        >
          <Button onClick={onLeaderboard} variant="ghost" size="md" icon={<Trophy size={16} />} className="w-full">
            View Leaderboard
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div className="text-center">
      <div className={`text-2xl font-black ${color}`}>{value}</div>
      <div className="text-xs text-slate-500 mt-1">{label}</div>
    </div>
  );
}
