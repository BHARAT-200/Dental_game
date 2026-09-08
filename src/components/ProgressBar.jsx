import { motion } from 'framer-motion';

const ROUNDS = [
  { num: 1, label: 'Identify Images', emoji: '🖼️' },
  { num: 2, label: 'This or That', emoji: '⚖️' },
  { num: 3, label: 'Riddles', emoji: '🧩' },
  { num: 4, label: 'MCQ', emoji: '📝' },
  { num: 5, label: 'Rapid Fire', emoji: '⚡' },
];

export default function ProgressBar({ currentRound }) {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute left-0 right-0 top-5 h-0.5 bg-white/10 z-0" />
        <motion.div
          className="absolute left-0 top-5 h-0.5 z-0"
          style={{ background: 'linear-gradient(90deg, #6366F1, #8B5CF6)' }}
          initial={{ width: '0%' }}
          animate={{ width: `${((currentRound - 1) / 4) * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />

        {ROUNDS.map((r) => {
          const done = currentRound > r.num;
          const active = currentRound === r.num;
          return (
            <div key={r.num} className="flex flex-col items-center z-10 gap-1">
              <motion.div
                animate={active ? { scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold border-2 transition-all duration-300
                  ${done ? 'bg-green-500 border-green-500 text-white' : 
                    active ? 'border-indigo-500 bg-indigo-500/20 text-white neon-glow' : 
                    'border-white/20 bg-white/5 text-slate-500'}`}
              >
                {done ? '✓' : r.emoji}
              </motion.div>
              <span className={`text-xs font-medium hidden sm:block ${active ? 'text-indigo-400' : done ? 'text-green-400' : 'text-slate-600'}`}>
                {r.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
