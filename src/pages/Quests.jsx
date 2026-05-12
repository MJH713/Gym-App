import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Flame, CalendarCheck } from 'lucide-react';
import { useGame } from '../context/GameStateContext.jsx';
import QuestCard from '../components/ui/QuestCard.jsx';

function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const target = new Date(targetDate);
      const diff = target - now;
      if (diff <= 0) { setTimeLeft('00:00:00'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

function getMidnight() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

function getSundayMidnight() {
  const d = new Date();
  const day = d.getDay();
  const diff = 7 - day;
  d.setDate(d.getDate() + (diff === 7 ? 0 : diff));
  d.setHours(23, 59, 59, 999);
  return d;
}

export default function Quests() {
  const { quests } = useGame();
  const dailyCountdown = useCountdown(getMidnight());
  const weeklyCountdown = useCountdown(getSundayMidnight());

  const dailyQuests = quests?.daily || [];
  const weeklyQuests = quests?.weekly || [];

  const dailyCompleted = dailyQuests.filter((q) => q.completed).length;
  const weeklyCompleted = weeklyQuests.filter((q) => q.completed).length;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-white">Quests</h2>

      {/* Daily quests */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Flame size={16} className="text-gold" />
              Daily Quests
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">{dailyCompleted}/{dailyQuests.length} completed</p>
          </div>
          <div className="flex items-center gap-1.5 bg-surface px-3 py-1.5 rounded-lg surface-border">
            <Clock size={12} className="text-purple-light" />
            <span className="text-xs font-mono font-bold text-purple-light">{dailyCountdown}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden mb-3">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-gold to-gold-light"
            animate={{ width: `${dailyQuests.length > 0 ? (dailyCompleted / dailyQuests.length) * 100 : 0}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>

        <div className="space-y-2">
          {dailyQuests.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">Quests loading...</p>
          ) : (
            dailyQuests.map((quest) => (
              <motion.div
                key={quest.instanceId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <QuestCard quest={quest} />
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* Weekly quests */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CalendarCheck size={16} className="text-blue-light" />
              Weekly Quests
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">{weeklyCompleted}/{weeklyQuests.length} completed</p>
          </div>
          <div className="flex items-center gap-1.5 bg-surface px-3 py-1.5 rounded-lg surface-border">
            <Clock size={12} className="text-blue-light" />
            <span className="text-xs font-mono font-bold text-blue-light">{weeklyCountdown}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden mb-3">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-blue to-blue-light"
            animate={{ width: `${weeklyQuests.length > 0 ? (weeklyCompleted / weeklyQuests.length) * 100 : 0}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>

        <div className="space-y-2">
          {weeklyQuests.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">Quests loading...</p>
          ) : (
            weeklyQuests.map((quest) => (
              <motion.div
                key={quest.instanceId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <QuestCard quest={quest} />
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* Weekly sweep notice */}
      {weeklyCompleted === weeklyQuests.length && weeklyQuests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-surface rounded-2xl p-5 text-center glow-gold"
          style={{ border: '1px solid rgba(245,158,11,0.5)' }}
        >
          <p className="text-2xl mb-2">🏆</p>
          <p className="font-black text-gold text-lg">WEEKLY SWEEP!</p>
          <p className="text-gray-400 text-sm mt-1">You completed all weekly quests!</p>
        </motion.div>
      )}
    </div>
  );
}
