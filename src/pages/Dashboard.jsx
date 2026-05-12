import { motion } from 'framer-motion';
import { Flame, Zap, Dumbbell } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { useGame } from '../context/GameStateContext.jsx';
import LevelBadge from '../components/ui/LevelBadge.jsx';
import QuestCard from '../components/ui/QuestCard.jsx';
import Button from '../components/ui/Button.jsx';
import { getXPProgress } from '../utils/xp.js';
import { LEVEL_TITLES } from '../constants/xp.js';
import { CHARACTER_CLASSES, CLASS_EMOJIS, CLASS_BG_GRADIENTS } from '../constants/classes.js';
import { getWeekDates } from '../utils/date.js';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getMotivationalMessage(streak) {
  if (streak === 0) return 'Start your journey today!';
  if (streak < 3) return 'Keep the momentum going!';
  if (streak < 7) return 'You\'re building a habit!';
  if (streak < 14) return 'On fire! Don\'t stop now!';
  if (streak < 30) return 'Absolute machine! Legend in the making!';
  return 'UNSTOPPABLE. You are LEGENDARY.';
}

export default function Dashboard({ onNavigate }) {
  const { profile, streak, workouts, quests } = useGame();

  const totalXP = profile?.totalXP || 0;
  const { level, percent, progress, needed } = getXPProgress(totalXP);
  const title = LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)];
  const characterClass = profile?.characterClassId
    ? CHARACTER_CLASSES.find((c) => c.id === profile.characterClassId)
    : null;
  const classEmoji = profile?.characterClassId ? CLASS_EMOJIS[profile.characterClassId] : '?';
  const currentStreak = streak?.currentStreak || 0;
  const bestStreak = streak?.longestStreak || 0;

  // Build weekly chart data
  const weekDates = getWeekDates();
  const chartData = DAY_LABELS.map((label, i) => {
    const dateStr = weekDates[i];
    const count = workouts.filter((w) => {
      const d = w.completedAt?.split('T')[0] || '';
      return d === dateStr;
    }).length;
    return { label, count };
  });

  const dailyQuests = quests?.daily || [];

  return (
    <div className="space-y-4">
      {/* Hero Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden p-5"
        style={{
          background: characterClass
            ? `linear-gradient(135deg, ${characterClass.color}33, #1a1a2e)`
            : 'linear-gradient(135deg, rgba(124,58,237,0.2), #1a1a2e)',
          border: '1px solid rgba(124,58,237,0.3)',
          boxShadow: '0 0 30px rgba(124,58,237,0.15)',
        }}
      >
        {/* Decorative glow */}
        <div
          className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20"
          style={{ background: characterClass?.color || '#7c3aed', filter: 'blur(40px)' }}
        />

        <div className="relative z-10">
          <div className="flex items-start gap-4 mb-4">
            {/* Class avatar */}
            <div className="flex-shrink-0">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                style={{
                  background: characterClass ? `${characterClass.color}22` : 'rgba(124,58,237,0.15)',
                  border: `2px solid ${characterClass?.color || '#7c3aed'}44`,
                }}
              >
                {classEmoji}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">
                {characterClass ? `${characterClass.name} — ${characterClass.subtitle}` : 'No Class Selected'}
              </p>
              <h2 className="text-xl font-black text-white leading-tight truncate">
                {profile?.username || 'Hero'}
              </h2>
              <p className="text-sm font-semibold" style={{ color: characterClass?.color || '#7c3aed' }}>
                {title}
              </p>
            </div>

            <LevelBadge level={level} size="md" />
          </div>

          {/* XP Bar */}
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Level {level}</span>
              <span>{progress.toLocaleString()} / {needed.toLocaleString()} XP</span>
              <span>Level {level + 1}</span>
            </div>
            <div className="w-full h-3 bg-black/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: characterClass
                    ? `linear-gradient(90deg, ${characterClass.color}, #a78bfa)`
                    : 'linear-gradient(90deg, #7c3aed, #a78bfa)',
                  boxShadow: '0 0 10px rgba(124,58,237,0.6)',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
              />
            </div>
            <p className="text-center text-xs text-gray-500 mt-1">
              {Math.round(percent)}% to next level
            </p>
          </div>
        </div>
      </motion.div>

      {/* Streak Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-surface rounded-2xl p-5 surface-border"
        style={{ borderColor: currentStreak > 0 ? 'rgba(245,158,11,0.3)' : undefined }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Flame
                size={24}
                className="animate-flame"
                style={{ color: currentStreak > 0 ? '#f59e0b' : '#4b5563' }}
              />
              <span
                className="text-4xl font-black"
                style={{ color: currentStreak > 0 ? '#f59e0b' : '#9ca3af' }}
              >
                {currentStreak}
              </span>
              <span className="text-gray-400 font-medium">day streak</span>
            </div>
            <p className="text-sm text-gray-400">Best: {bestStreak} days</p>
            <p className="text-sm font-semibold text-white mt-1">
              {getMotivationalMessage(currentStreak)}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Freeze Tokens</div>
            <div className="text-lg font-bold text-blue-light">{streak?.freezesAvailable || 0}</div>
          </div>
        </div>
      </motion.div>

      {/* Today's Quests */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-white">Today's Quests</h3>
          <button
            onClick={() => onNavigate('quests')}
            className="text-xs text-purple-light hover:text-purple transition-colors"
          >
            View all →
          </button>
        </div>
        <div className="space-y-2">
          {dailyQuests.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">No quests loaded</p>
          ) : (
            dailyQuests.map((quest) => <QuestCard key={quest.instanceId} quest={quest} />)
          )}
        </div>
      </motion.div>

      {/* Weekly Activity Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-surface rounded-2xl p-4 surface-border"
      >
        <h3 className="text-base font-bold text-white mb-3">This Week</h3>
        <ResponsiveContainer width="100%" height={100}>
          <BarChart data={chartData} barSize={20}>
            <XAxis
              dataKey="label"
              tick={{ fill: '#6b7280', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                background: '#1a1a2e',
                border: '1px solid rgba(124,58,237,0.3)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '12px',
              }}
              cursor={{ fill: 'rgba(124,58,237,0.1)' }}
            />
            <Bar dataKey="count" name="Workouts" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.count > 0 ? '#7c3aed' : '#16213e'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Start Workout CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Button
          variant="primary"
          onClick={() => onNavigate('workout')}
          className="w-full py-4 text-base flex items-center justify-center gap-2"
        >
          <Dumbbell size={20} />
          Start Workout
        </Button>
      </motion.div>
    </div>
  );
}
