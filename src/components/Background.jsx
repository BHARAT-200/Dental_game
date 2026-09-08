import { motion } from 'framer-motion';

// Simplified background for better performance
export default function Background() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Subtle gradient overlay */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(circle at 20% 20%, rgba(99,102,241,0.15), transparent 50%), radial-gradient(circle at 80% 80%, rgba(139,92,246,0.15), transparent 50%)',
        }}
      />

      {/* Minimal animated accent */}
      <motion.div
        className="absolute rounded-full opacity-10"
        style={{ 
          width: 400, 
          height: 400, 
          background: 'radial-gradient(circle, #6366F1, transparent)', 
          top: '-10%', 
          left: '-10%',
          filter: 'blur(60px)'
        }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Grid pattern - static, no animation */}
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
