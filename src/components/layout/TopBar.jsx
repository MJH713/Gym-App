import { Flame } from 'lucide-react';
import XPBar from '../ui/XPBar.jsx';

export default function TopBar({ profile, streak }) {
  const currentStreak = streak?.currentStreak || 0;

  return (
    <header
      className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-30 px-4 pt-3 pb-2"
      style={{
        background: 'rgba(15,15,26,0.95)',
        borderBottom: '1px solid rgba(124,58,237,0.15)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-black text-gradient tracking-tight">GymQuest</h1>
        <div className="flex items-center gap-1.5">
          <Flame
            size={18}
            className="animate-flame"
            style={{ color: currentStreak > 0 ? '#f59e0b' : '#4b5563' }}
          />
          <span
            className="text-sm font-bold"
            style={{ color: currentStreak > 0 ? '#f59e0b' : '#4b5563' }}
          >
            {currentStreak}
          </span>
        </div>
      </div>
      <XPBar totalXP={profile?.totalXP || 0} />
    </header>
  );
}
