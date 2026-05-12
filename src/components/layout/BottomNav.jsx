import { motion } from 'framer-motion';
import { Home, Dumbbell, Scroll, Trophy, User } from 'lucide-react';

const TABS = [
  { id: 'dashboard', label: 'Home', Icon: Home },
  { id: 'workout', label: 'Workout', Icon: Dumbbell },
  { id: 'quests', label: 'Quests', Icon: Scroll },
  { id: 'achievements', label: 'Awards', Icon: Trophy },
  { id: 'profile', label: 'Profile', Icon: User },
];

export default function BottomNav({ activePage, onNavigate }) {
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-30"
      style={{
        background: 'rgba(26,26,46,0.95)',
        borderTop: '1px solid rgba(124,58,237,0.2)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="flex items-center justify-around px-2 py-2 pb-safe">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = activePage === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200 relative"
              style={{ minWidth: '56px' }}
            >
              {isActive && (
                <motion.div
                  layoutId="navIndicator"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                />
              )}
              <motion.div
                animate={isActive ? { scale: 1.15, y: -1 } : { scale: 1, y: 0 }}
                transition={{ type: 'spring', damping: 20 }}
              >
                <Icon
                  size={20}
                  style={{
                    color: isActive ? '#a78bfa' : '#4b5563',
                    filter: isActive ? '0 0 8px rgba(167,139,250,0.6)' : 'none',
                  }}
                />
              </motion.div>
              <span
                className="text-xs font-medium relative z-10"
                style={{ color: isActive ? '#a78bfa' : '#4b5563' }}
              >
                {label}
              </span>
              {isActive && (
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full"
                  style={{ background: '#7c3aed', boxShadow: '0 0 8px rgba(124,58,237,0.8)' }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
