import { motion } from 'framer-motion';

export default function LevelBadge({ level = 1, isLevelUp = false, size = 'md' }) {
  const sizes = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-14 h-14 text-lg',
    lg: 'w-20 h-20 text-2xl',
  };

  return (
    <motion.div
      className={`relative flex items-center justify-center ${sizes[size]} font-black text-white`}
      animate={isLevelUp ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] } : {}}
      transition={{ duration: 0.6 }}
    >
      {/* Hexagonal background using CSS clip-path */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-purple to-purple-dark"
        style={{
          clipPath: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)',
          boxShadow: '0 0 20px rgba(124,58,237,0.6)',
        }}
      />
      <div
        className="absolute inset-0.5 bg-surface"
        style={{
          clipPath: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)',
        }}
      />
      <span className="relative z-10 text-gradient">{level}</span>
      {isLevelUp && (
        <motion.div
          className="absolute -top-1 -right-1 w-4 h-4 bg-gold rounded-full flex items-center justify-center text-black text-xs font-black"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          !
        </motion.div>
      )}
    </motion.div>
  );
}
