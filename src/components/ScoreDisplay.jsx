import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function ScoreDisplay({ score, label = 'Score', highlight = false }) {
  const [displayScore, setDisplayScore] = useState(score);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (score !== displayScore) {
      setFlash(true);
      setDisplayScore(score);
      const t = setTimeout(() => setFlash(false), 600);
      return () => clearTimeout(t);
    }
  }, [score]);

  return (
    <motion.div
      animate={flash ? { scale: [1, 1.2, 1] } : {}}
      transition={{ duration: 0.3 }}
      className={`glass rounded-xl px-4 py-2 text-center ${highlight ? 'border border-indigo-500/50 neon-glow' : ''}`}
    >
      <div className="text-xs text-slate-400 uppercase tracking-wider">{label}</div>
      <div className={`text-2xl font-bold ${highlight ? 'gradient-text' : 'text-white'}`}>
        {displayScore}
      </div>
    </motion.div>
  );
}
