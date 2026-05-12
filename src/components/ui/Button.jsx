import { motion } from 'framer-motion';

const VARIANTS = {
  primary: 'bg-gradient-to-r from-purple to-purple-dark text-white font-bold shadow-lg hover:shadow-purple/40 disabled:opacity-50',
  secondary: 'bg-surface text-white font-semibold surface-border hover:bg-surface2 disabled:opacity-50',
  danger: 'bg-red text-white font-bold hover:bg-red-dark disabled:opacity-50',
  ghost: 'bg-transparent text-gray-400 hover:text-white hover:bg-surface disabled:opacity-50',
  gold: 'bg-gradient-to-r from-gold to-gold-dark text-black font-bold shadow-lg hover:shadow-gold/40 disabled:opacity-50',
};

export default function Button({
  variant = 'primary',
  onClick,
  children,
  disabled = false,
  className = '',
  type = 'button',
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      className={`px-4 py-2.5 rounded-xl transition-all duration-200 text-sm ${VARIANTS[variant] || VARIANTS.primary} ${className}`}
    >
      {children}
    </motion.button>
  );
}
