import { motion } from 'framer-motion';
import { getXPProgress } from '../../utils/xp.js';
import { LEVEL_TITLES } from '../../constants/xp.js';

export default function XPBar({ totalXP = 0 }) {
  const { level, progress, needed, percent } = getXPProgress(totalXP);
  const title = LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)];

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-bold text-purple-light">Lv.{level}</span>
        <span className="text-xs text-gray-400">{progress.toLocaleString()} / {needed.toLocaleString()} XP</span>
        <span className="text-xs font-bold text-purple-light">Lv.{level + 1}</span>
      </div>
      <div className="w-full h-2 bg-surface2 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-purple to-purple-light"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ boxShadow: '0 0 8px rgba(124,58,237,0.7)' }}
        />
      </div>
      <p className="text-center text-xs text-gray-500 mt-1">{title}</p>
    </div>
  );
}
