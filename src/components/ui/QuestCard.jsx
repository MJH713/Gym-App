import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';

export default function QuestCard({ quest }) {
  const IconComponent = Icons[quest.icon] || Icons.Target;
  const percent = quest.goal > 0 ? Math.min(100, (quest.progress / quest.goal) * 100) : 0;
  const isComplete = quest.completed;

  return (
    <motion.div
      className="bg-surface rounded-xl p-4 surface-border"
      style={{
        borderColor: isComplete ? 'rgba(245,158,11,0.4)' : 'rgba(124,58,237,0.2)',
        boxShadow: isComplete ? '0 0 12px rgba(245,158,11,0.2)' : 'none',
      }}
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center"
          style={{
            backgroundColor: isComplete ? 'rgba(245,158,11,0.2)' : 'rgba(124,58,237,0.15)',
            border: `1px solid ${isComplete ? 'rgba(245,158,11,0.4)' : 'rgba(124,58,237,0.3)'}`,
          }}
        >
          {isComplete ? (
            <Icons.CheckCircle size={20} className="text-gold" />
          ) : (
            <IconComponent size={20} className="text-purple-light" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-bold text-sm text-white truncate">{quest.title}</p>
            <div className="flex items-center gap-1 flex-shrink-0">
              {isComplete && (
                <span className="text-xs font-bold text-gold bg-gold/10 px-2 py-0.5 rounded-full border border-gold/30">
                  DONE
                </span>
              )}
              <span className="text-xs font-bold text-purple-light bg-purple/10 px-2 py-0.5 rounded-full border border-purple/20">
                +{quest.xpReward}XP
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{quest.description}</p>

          {/* Progress bar */}
          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{quest.progress} / {quest.goal}</span>
              <span>{Math.round(percent)}%</span>
            </div>
            <div className="w-full h-1.5 bg-surface2 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: isComplete
                    ? 'linear-gradient(90deg, #f59e0b, #fcd34d)'
                    : 'linear-gradient(90deg, #7c3aed, #a78bfa)',
                  boxShadow: isComplete ? '0 0 6px rgba(245,158,11,0.5)' : '0 0 6px rgba(124,58,237,0.5)',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
