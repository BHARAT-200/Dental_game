import { motion } from 'framer-motion';
import { Volume2, VolumeX, Home, Maximize } from 'lucide-react';
import { playSound } from '../utils/sounds';

export default function Navbar({ settings, updateSettings, scores, onHome }) {
  const toggleSound = () => {
    playSound('click');
    updateSettings({ soundEnabled: !settings.soundEnabled });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={onHome}
          className="flex items-center gap-2 group"
        >
          <span className="text-2xl">🦷</span>
          <span className="font-bold text-sm gradient-text hidden sm:block">Dental Quiz</span>
        </button>

        {/* Score display (only during game) */}
        {scores && scores.total > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="glass rounded-full px-4 py-1 text-sm font-bold"
          >
            <span className="text-slate-400 mr-1">Score:</span>
            <span className="gradient-text">{scores.total}</span>
          </motion.div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-1">
          <NavBtn onClick={onHome} title="Home">
            <Home size={16} />
          </NavBtn>
          <NavBtn onClick={toggleSound} title={settings.soundEnabled ? 'Mute' : 'Unmute'}>
            {settings.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </NavBtn>
          <NavBtn onClick={toggleFullscreen} title="Fullscreen">
            <Maximize size={16} />
          </NavBtn>
        </div>
      </div>
    </motion.nav>
  );
}

function NavBtn({ onClick, title, children }) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      title={title}
      className="w-8 h-8 rounded-lg glass glass-hover flex items-center justify-center text-slate-400 hover:text-white transition-colors"
    >
      {children}
    </motion.button>
  );
}
