import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { RARITY_COLORS, RARITY_GLOW } from '../../constants/achievements.js';

export default function AchievementCard({ achievement, isUnlocked, unlockedAt, onClick }) {
  const color = RARITY_COLORS[achievement.rarity] || '#9ca3af';
  const glow = RARITY_GLOW[achievement.rarity] || 'rgba(156,163,175,0.3)';
  const IconComponent = Icons[achievement.icon] || Icons.Star;

  const rarityLabel = achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1);

  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="relative rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer select-none"
      style={{
        backgroundColor: isUnlocked ? '#1a1a2e' : '#0f0f1a',
        border: `1px solid ${isUnlocked ? color : 'rgba(255,255,255,0.05)'}`,
        boxShadow: isUnlocked ? `0 0 16px ${glow}` : 'none',
      }}
    >
      {/* Rarity badge */}
      {isUnlocked && (
        <div
          className="absolute top-2 right-2 text-xs font-bold px-1.5 py-0.5 rounded-full"
          style={{ backgroundColor: `${color}33`, color }}
        >
          {rarityLabel}
        </div>
      )}

      {/* Icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{
          backgroundColor: isUnlocked ? `${color}22` : 'rgba(255,255,255,0.03)',
          border: `1px solid ${isUnlocked ? color + '55' : 'rgba(255,255,255,0.05)'}`,
        }}
      >
        {isUnlocked ? (
          <IconComponent size={24} style={{ color }} />
        ) : (
          <Icons.Lock size={24} className="text-gray-700" />
        )}
      </div>

      {/* Name */}
      <p
        className="text-sm font-bold text-center leading-tight"
        style={{ color: isUnlocked ? 'white' : '#4b5563' }}
      >
        {isUnlocked ? achievement.name : '???'}
      </p>

      {/* Description or locked hint */}
      <p className="text-xs text-center leading-tight" style={{ color: isUnlocked ? '#9ca3af' : '#374151' }}>
        {isUnlocked ? achievement.conditionLabel : achievement.conditionLabel}
      </p>

      {unlockedAt && (
        <p className="text-xs" style={{ color: `${color}99` }}>
          {new Date(unlockedAt).toLocaleDateString()}
        </p>
      )}
    </motion.div>
  );
}
