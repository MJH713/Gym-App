import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameStateContext.jsx';
import AchievementCard from '../components/ui/AchievementCard.jsx';
import Modal from '../components/ui/Modal.jsx';
import { ACHIEVEMENTS, RARITY_COLORS } from '../constants/achievements.js';
import * as Icons from 'lucide-react';

const FILTERS = ['All', 'Common', 'Rare', 'Epic', 'Legendary'];

export default function Achievements() {
  const { achievements } = useGame();
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedAch, setSelectedAch] = useState(null);

  const unlocked = achievements?.unlocked || [];
  const unlockedMap = {};
  for (const a of unlocked) {
    unlockedMap[a.id || a] = a.unlockedAt || true;
  }

  const filtered = ACHIEVEMENTS.filter((a) =>
    activeFilter === 'All' || a.rarity === activeFilter.toLowerCase()
  );

  const totalUnlocked = unlocked.length;

  const selectedData = selectedAch
    ? ACHIEVEMENTS.find((a) => a.id === selectedAch)
    : null;
  const isSelectedUnlocked = selectedAch ? !!unlockedMap[selectedAch] : false;
  const selectedUnlockedAt = selectedAch ? unlockedMap[selectedAch] : null;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-black text-white">Achievements</h2>
        <p className="text-sm text-gray-400 mt-0.5">
          <span className="text-purple-light font-bold">{totalUnlocked}</span> / {ACHIEVEMENTS.length} unlocked
        </p>
      </div>

      {/* Overall progress bar */}
      <div className="bg-surface rounded-xl p-4 surface-border">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>Total Progress</span>
          <span>{Math.round((totalUnlocked / ACHIEVEMENTS.length) * 100)}%</span>
        </div>
        <div className="w-full h-2 bg-surface2 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-purple to-gold"
            animate={{ width: `${(totalUnlocked / ACHIEVEMENTS.length) * 100}%` }}
            transition={{ duration: 0.8 }}
            style={{ boxShadow: '0 0 8px rgba(124,58,237,0.6)' }}
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-full transition-all"
            style={{
              background: activeFilter === f ? '#7c3aed' : '#1a1a2e',
              color: activeFilter === f ? 'white' : '#6b7280',
              border: `1px solid ${activeFilter === f ? '#7c3aed' : 'rgba(124,58,237,0.2)'}`,
              boxShadow: activeFilter === f ? '0 0 12px rgba(124,58,237,0.4)' : 'none',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Achievement grid */}
      <div className="grid grid-cols-2 gap-3">
        {filtered.map((ach, i) => {
          const isUnlocked = !!unlockedMap[ach.id];
          const unlockedAt = typeof unlockedMap[ach.id] === 'string' ? unlockedMap[ach.id] : null;
          return (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <AchievementCard
                achievement={ach}
                isUnlocked={isUnlocked}
                unlockedAt={unlockedAt}
                onClick={() => setSelectedAch(ach.id)}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedAch}
        onClose={() => setSelectedAch(null)}
        title={isSelectedUnlocked ? selectedData?.name || '' : '???'}
      >
        {selectedData && (
          <div className="text-center space-y-4">
            {/* Icon */}
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto"
              style={{
                background: isSelectedUnlocked
                  ? `${RARITY_COLORS[selectedData.rarity]}22`
                  : 'rgba(255,255,255,0.03)',
                border: `2px solid ${isSelectedUnlocked ? RARITY_COLORS[selectedData.rarity] + '66' : 'rgba(255,255,255,0.1)'}`,
                boxShadow: isSelectedUnlocked ? `0 0 24px ${RARITY_COLORS[selectedData.rarity]}44` : 'none',
              }}
            >
              {isSelectedUnlocked ? (
                (() => {
                  const IconComp = Icons[selectedData.icon] || Icons.Star;
                  return <IconComp size={36} style={{ color: RARITY_COLORS[selectedData.rarity] }} />;
                })()
              ) : (
                <Icons.Lock size={36} className="text-gray-700" />
              )}
            </div>

            {/* Rarity */}
            <span
              className="inline-block text-xs font-bold px-3 py-1 rounded-full"
              style={{
                background: `${RARITY_COLORS[selectedData.rarity]}22`,
                color: RARITY_COLORS[selectedData.rarity],
                border: `1px solid ${RARITY_COLORS[selectedData.rarity]}44`,
              }}
            >
              {selectedData.rarity.toUpperCase()}
            </span>

            {/* Name & description */}
            {isSelectedUnlocked ? (
              <>
                <p className="text-white font-bold text-lg">{selectedData.name}</p>
                <p className="text-gray-400 text-sm">{selectedData.description}</p>
                <p className="text-xs text-gray-500 bg-surface2 rounded-lg px-3 py-2">
                  {selectedData.conditionLabel}
                </p>
                {selectedUnlockedAt && (
                  <p className="text-xs text-gray-500">
                    Unlocked {new Date(selectedUnlockedAt).toLocaleDateString()}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="text-gray-500 font-bold text-lg">Locked Achievement</p>
                <p className="text-gray-600 text-sm">Keep working out to unlock this achievement!</p>
                <p className="text-xs text-gray-600 bg-surface2 rounded-lg px-3 py-2">
                  Hint: {selectedData.conditionLabel}
                </p>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
