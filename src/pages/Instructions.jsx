import { motion } from 'framer-motion';
import Button from '../components/Button';

export default function Instructions({ onStart, enabledRounds }) {
  // Filter rounds to only show enabled ones
  const allRounds = [
    { key: 'round1', emoji: '🖼️', title: 'Round 1 – Identify Instrument', desc: 'Identify dental instruments from images or emoji clues. +10 pts per correct answer.', color: 'border-indigo-500/30' },
    { key: 'round2', emoji: '📝', title: 'Round 2 – Identify Through Function', desc: 'Answer multiple-choice questions about dental instruments and their functions. +10 pts each.', color: 'border-purple-500/30' },
    { key: 'round3', emoji: '⚖️', title: 'Round 3 – This or That', desc: 'Pick the correct option from two dental choices. +10 pts each.', color: 'border-cyan-500/30' },
    { key: 'round4', emoji: '🧩', title: 'Round 4 – Riddle', desc: 'Solve dental science riddles with hints available. +15 pts each.', color: 'border-green-500/30' },
    { key: 'round5', emoji: '⚡', title: 'Round 5 – Rapid Fire', desc: 'Quick-fire dental questions against the clock. +5 pts each.', color: 'border-yellow-500/30' },
  ];

  const rounds = enabledRounds 
    ? allRounds.filter(r => enabledRounds[r.key])
    : allRounds;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      className="min-h-screen pt-20 pb-12 px-4 flex flex-col items-center justify-center max-w-2xl mx-auto"
    >
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }}>
        <h2 className="text-4xl font-black text-center mb-2 gradient-text">How to Play</h2>
        <p className="text-slate-400 text-center mb-8">Complete all 5 rounds to become the Dental Quiz Champion!</p>
      </motion.div>

      <div className="w-full space-y-3 mb-8">
        {rounds.map((r, i) => (
          <motion.div
            key={i}
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.15 * i }}
            className={`glass rounded-xl p-4 border ${r.color} flex items-start gap-4`}
          >
            <span className="text-3xl">{r.emoji}</span>
            <div>
              <div className="font-bold text-white">{r.title}</div>
              <div className="text-sm text-slate-400">{r.desc}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="glass rounded-xl p-4 w-full mb-8 border border-yellow-500/20"
      >
        <div className="text-center text-sm text-slate-300 font-medium mb-2">🏆 Performance Badges</div>
        <div className="flex justify-around text-sm">
          <span>🥉 Beginner</span>
          <span>🥈 Smart</span>
          <span>🥇 Expert</span>
          <span>👑 Quiz Master</span>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
        <Button onClick={onStart} variant="gradient" size="xl" sound="start">
          🚀 Begin Challenge
        </Button>
      </motion.div>
    </motion.div>
  );
}
