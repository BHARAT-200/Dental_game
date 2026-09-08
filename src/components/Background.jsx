import { motion } from 'framer-motion';
import { useMemo } from 'react';

// Generate particle positions once, not on every render
const generateParticles = () => {
  return Array.from({ length: 12 }, (_, i) => ({
    id: i,
    width: Math.random() * 4 + 1,
    height: Math.random() * 4 + 1,
    left: Math.random() * 100,
    top: Math.random() * 100,
    color: ['#6366F1', '#8B5CF6', '#06B6D4', '#22C55E'][Math.floor(Math.random() * 4)],
    opacity: Math.random() * 0.4 + 0.1,
    duration: Math.random() * 5 + 3,
    delay: Math.random() * 5,
  }));
};

export default function Background() {
  // Memoize particles to prevent recreation on every render
  const particles = useMemo(() => generateParticles(), []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Animated blobs - reduced blur for performance */}
      <motion.div
        className="absolute rounded-full opacity-20 blur-2xl"
        style={{ width: 600, height: 600, background: 'radial-gradient(circle, #6366F1, transparent)', top: '-10%', left: '-10%' }}
        animate={{ x: [0, 60, 0], y: [0, 40, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full opacity-15 blur-2xl"
        style={{ width: 500, height: 500, background: 'radial-gradient(circle, #8B5CF6, transparent)', bottom: '-5%', right: '-5%' }}
        animate={{ x: [0, -50, 0], y: [0, -30, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      {/* Particles - reduced from 25 to 12 for performance */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.width,
            height: p.height,
            left: `${p.left}%`,
            top: `${p.top}%`,
            background: p.color,
            opacity: p.opacity,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [p.opacity * 0.5, p.opacity, p.opacity * 0.5],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px), 
                           linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
}
