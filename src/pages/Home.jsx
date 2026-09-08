import { motion } from 'framer-motion';
import { Shuffle, PenLine, ChevronRight, Zap, Star } from 'lucide-react';
import { playSound } from '../utils/sounds';
import { getBestScore } from '../utils/storage';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { y: 40, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
};

export default function Home({ onRandom, onCustom }) {
  const best = getBestScore();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="min-h-screen pt-20 pb-12 px-4 flex flex-col items-center justify-center"
    >
      {/* Hero */}
      <motion.div variants={itemVariants} className="text-center mb-12">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="text-7xl mb-6 inline-block"
        >
          🦷
        </motion.div>
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-4 leading-tight">
          <span className="gradient-text">Ultimate</span>
          <br />
          <span className="text-white">Dental Quiz</span>
        </h1>
        <p className="text-slate-400 text-lg sm:text-xl max-w-md mx-auto">
          Complete all 5 rounds and prove your dental knowledge.
        </p>

        {best > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8, type: 'spring' }}
            className="inline-flex items-center gap-2 mt-4 glass rounded-full px-4 py-2 text-sm"
          >
            <Star size={14} className="text-yellow-400" />
            <span className="text-slate-300">Best Score:</span>
            <span className="font-bold text-yellow-400">{best}</span>
          </motion.div>
        )}
      </motion.div>

      {/* Game Mode Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl mb-10"
      >
        <GameCard
          emoji="🎲"
          title="Random Game"
          desc="Fresh dental questions auto-generated every round. Jump straight in!"
          color="from-indigo-500/20 to-purple-600/20"
          border="border-indigo-500/30"
          glow="hover:shadow-indigo-500/20"
          badgeText="Quick Play"
          badgeColor="bg-indigo-500/20 text-indigo-300"
          onClick={() => { playSound('start'); onRandom(); }}
          icon={<Shuffle size={20} />}
        />
        <GameCard
          emoji="✏️"
          title="Custom Game"
          desc="Build your own question set for each round before starting."
          color="from-purple-500/20 to-cyan-600/20"
          border="border-purple-500/30"
          glow="hover:shadow-purple-500/20"
          badgeText="Customize"
          badgeColor="bg-purple-500/20 text-purple-300"
          onClick={() => { playSound('click'); onCustom(); }}
          icon={<PenLine size={20} />}
        />
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-3 mb-10">
        {['5 Unique Rounds', 'Image ID', 'MCQs', 'Riddles', 'Rapid Fire'].map(f => (
          <span key={f} className="glass rounded-full px-3 py-1 text-xs text-slate-400 flex items-center gap-1">
            <Zap size={10} className="text-indigo-400" /> {f}
          </span>
        ))}
      </motion.div>

      {/* Round Pills */}
      <motion.div variants={itemVariants} className="mt-10 grid grid-cols-5 gap-2 w-full max-w-xl">
        {[
          { emoji: '🖼️', label: 'Round 1', sub: 'Identify' },
          { emoji: '📝', label: 'Round 2', sub: 'Function' },
          { emoji: '⚖️', label: 'Round 3', sub: 'This/That' },
          { emoji: '🧩', label: 'Round 4', sub: 'Riddle' },
          { emoji: '⚡', label: 'Round 5', sub: 'Rapid Fire' },
        ].map((r, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05, y: -3 }}
            className="glass rounded-xl p-3 text-center"
          >
            <div className="text-2xl mb-1">{r.emoji}</div>
            <div className="text-xs font-semibold text-white">{r.label}</div>
            <div className="text-xs text-slate-500">{r.sub}</div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

function GameCard({ emoji, title, desc, color, border, glow, badgeText, badgeColor, onClick, icon }) {
  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative text-left p-6 rounded-2xl glass border ${border} bg-gradient-to-br ${color} hover:shadow-2xl ${glow} transition-all duration-300 group w-full`}
    >
      <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 ${badgeColor}`}>
        {badgeText}
      </div>
      <div className="text-5xl mb-3">{emoji}</div>
      <h3 className="text-xl font-bold text-white mb-2 group-hover:gradient-text transition-all">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
      <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-indigo-400 group-hover:text-white transition-colors">
        {icon}
        <span>Start Now</span>
        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
      </div>
    </motion.button>
  );
}
