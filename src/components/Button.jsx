import { motion } from 'framer-motion';
import { createRipple } from '../utils/helpers';
import { playSound } from '../utils/sounds';

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  icon,
  sound = 'click',
  ...props
}) {
  const base = 'relative overflow-hidden rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer select-none';

  const variants = {
    primary: 'btn-primary text-white',
    secondary: 'glass glass-hover text-white border border-white/10',
    success: 'bg-green-500 hover:bg-green-600 text-white',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    ghost: 'text-slate-300 hover:text-white hover:bg-white/5',
    gradient: 'shimmer-btn text-white',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl',
  };

  const handleClick = (e) => {
    if (disabled) return;
    createRipple(e);
    playSound(sound);
    onClick?.(e);
  };

  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.03, y: -1 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      onClick={handleClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      {...props}
    >
      {icon && <span>{icon}</span>}
      {children}
    </motion.button>
  );
}
