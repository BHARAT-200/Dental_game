import { useEffect } from 'react';
import confetti from 'canvas-confetti';

export default function Confetti({ trigger = true, type = 'standard' }) {
  useEffect(() => {
    if (!trigger) return;

    if (type === 'standard') {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#6366F1', '#8B5CF6', '#06B6D4', '#22C55E', '#F59E0B'],
      });
    } else if (type === 'burst') {
      const end = Date.now() + 3000;
      const interval = setInterval(() => {
        if (Date.now() > end) { clearInterval(interval); return; }
        confetti({ particleCount: 30, spread: 120, origin: { x: Math.random(), y: Math.random() - 0.2 }, colors: ['#6366F1', '#8B5CF6', '#06B6D4', '#22C55E', '#F59E0B', '#EF4444'] });
      }, 200);
      return () => clearInterval(interval);
    } else if (type === 'cannon') {
      [0.2, 0.8].forEach(x => {
        confetti({ particleCount: 80, angle: x < 0.5 ? 60 : 120, spread: 55, origin: { x, y: 0.7 }, colors: ['#6366F1', '#8B5CF6', '#06B6D4', '#22C55E', '#F59E0B'] });
      });
    }
  }, [trigger, type]);

  return null;
}
