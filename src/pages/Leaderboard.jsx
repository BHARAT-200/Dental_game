import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Home, Trophy } from 'lucide-react';
import Button from '../components/Button';
import { getLeaderboard, clearLeaderboard } from '../utils/storage';
import { formatTime } from '../utils/helpers';

export default function Leaderboard({ onHome }) {
  const [board, setBoard] = useState(getLeaderboard());

  const handleClear = () => {
    if (confirm('Clear all leaderboard entries?')) {
      clearLeaderboard();
      setBoard([]);
    }
  };

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen pt-20 pb-12 px-4"
    >
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-4xl font-black gradient-text">🏆 Leaderboard</h2>
            <p className="text-slate-400 text-sm">Top 10 local scores</p>
          </div>
          <Button onClick={onHome} variant="secondary" size="sm" icon={<Home size={14} />}>
            Home
          </Button>
        </div>

        {board.length === 0 ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass rounded-2xl p-12 text-center border border-white/10"
          >
            <Trophy size={48} className="text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No scores yet.</p>
            <p className="text-slate-600 text-sm mt-1">Complete a quiz to appear here!</p>
            <Button onClick={onHome} variant="gradient" size="md" className="mt-6">
              Play Now
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {board.map((entry, i) => (
              <motion.div
                key={i}
                initial={{ x: -40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.07 }}
                className={`glass rounded-xl p-4 flex items-center gap-4 border
                  ${i === 0 ? 'border-yellow-500/40 bg-yellow-500/5' :
                    i === 1 ? 'border-slate-400/40 bg-slate-400/5' :
                    i === 2 ? 'border-orange-600/40 bg-orange-600/5' :
                    'border-white/10'}`}
              >
                <div className="text-3xl w-10 text-center">
                  {medals[i] || `#${i + 1}`}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white truncate">{entry.name || 'Player'}</div>
                  <div className="text-xs text-slate-500">
                    {entry.accuracy}% accuracy · {entry.time ? formatTime(entry.time) : '--'} ·{' '}
                    {entry.date ? new Date(entry.date).toLocaleDateString() : ''}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black gradient-text">{entry.score}</div>
                  <div className="text-xs text-slate-500">pts</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {board.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 text-center"
          >
            <button
              onClick={handleClear}
              className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors mx-auto"
            >
              <Trash2 size={14} />
              Clear All Scores
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
