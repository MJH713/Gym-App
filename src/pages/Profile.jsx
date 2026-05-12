import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Dumbbell, Zap, Star, Flame, Scroll, Repeat, Edit3, Check,
  Download, RotateCcw, ChevronRight,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts';
import { useGame } from '../context/GameStateContext.jsx';
import StatCard from '../components/ui/StatCard.jsx';
import LevelBadge from '../components/ui/LevelBadge.jsx';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import { CHARACTER_CLASSES, CLASS_EMOJIS } from '../constants/classes.js';
import { LEVEL_TITLES } from '../constants/xp.js';
import { getLevelFromXP } from '../utils/xp.js';
import { getWeekKey, getWeekDates } from '../utils/date.js';
import { getWorkouts } from '../utils/storage.js';

const RARITY_COLORS_PIE = ['#ef4444', '#2563eb', '#10b981', '#f59e0b', '#7c3aed', '#ec4899', '#06b6d4'];

function buildWeeklyChartData(workouts) {
  // Last 8 weeks
  const weeks = [];
  const now = new Date();
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    const key = getWeekKey(d);
    const weekDates = getWeekDates(d);
    const count = workouts.filter((w) =>
      weekDates.includes(w.completedAt?.split('T')[0])
    ).length;
    weeks.push({ label: `W${key.split('W')[1]}`, count });
  }
  return weeks;
}

function buildMuscleGroupData(workouts) {
  const counts = {};
  for (const w of workouts) {
    for (const e of w.exercises || []) {
      for (const mg of e.muscleGroups || []) {
        counts[mg] = (counts[mg] || 0) + 1;
      }
    }
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([name, value]) => ({ name, value }));
}

export default function Profile() {
  const { profile, streak, workouts, quests, achievements, actions } = useGame();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile?.username || '');
  const [showReset, setShowReset] = useState(false);

  const totalXP = profile?.totalXP || 0;
  const level = getLevelFromXP(totalXP);
  const title = LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)];
  const currentStreak = streak?.currentStreak || 0;
  const bestStreak = streak?.longestStreak || 0;
  const totalWorkouts = profile?.totalWorkouts || 0;
  const totalReps = profile?.totalReps || 0;
  const classEmoji = profile?.characterClassId ? CLASS_EMOJIS[profile.characterClassId] : '?';
  const characterClass = profile?.characterClassId
    ? CHARACTER_CLASSES.find((c) => c.id === profile.characterClassId)
    : null;

  // Count completed quests
  const allQuests = [...(quests?.daily || []), ...(quests?.weekly || [])];
  const questsDone = (profile?.totalQuestsCompleted || 0) + allQuests.filter((q) => q.completed).length;

  const weeklyData = buildWeeklyChartData(workouts);
  const muscleData = buildMuscleGroupData(workouts);

  const saveName = () => {
    if (nameInput.trim()) actions.updateUsername(nameInput.trim());
    setEditingName(false);
  };

  const exportData = () => {
    const data = {
      profile,
      streak,
      workouts,
      quests,
      achievements,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gymquest-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Profile header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface rounded-2xl p-5 surface-border"
        style={{
          background: characterClass
            ? `linear-gradient(135deg, ${characterClass.color}22, #1a1a2e)`
            : 'linear-gradient(135deg, rgba(124,58,237,0.15), #1a1a2e)',
        }}
      >
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
            style={{
              background: characterClass ? `${characterClass.color}22` : 'rgba(124,58,237,0.15)',
              border: `2px solid ${characterClass?.color || '#7c3aed'}44`,
            }}
          >
            {classEmoji}
          </div>

          <div className="flex-1 min-w-0">
            {/* Username */}
            {editingName ? (
              <div className="flex items-center gap-2 mb-1">
                <input
                  autoFocus
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveName()}
                  className="bg-surface2 text-white font-bold rounded-lg px-2 py-1 text-base border border-purple/40 focus:outline-none w-full"
                  maxLength={24}
                />
                <button onClick={saveName} className="text-green-light">
                  <Check size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-black text-white truncate">{profile?.username || 'Hero'}</h2>
                <button
                  onClick={() => { setNameInput(profile?.username || ''); setEditingName(true); }}
                  className="text-gray-500 hover:text-gray-300 flex-shrink-0"
                >
                  <Edit3 size={14} />
                </button>
              </div>
            )}
            <p className="text-sm font-semibold" style={{ color: characterClass?.color || '#7c3aed' }}>
              {characterClass?.name || 'No Class'} — {title}
            </p>
          </div>

          <LevelBadge level={level} size="md" />
        </div>
      </motion.div>

      {/* Class selector */}
      <div>
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Character Class</h3>
        <div className="space-y-2">
          {CHARACTER_CLASSES.map((cls) => {
            const isSelected = profile?.characterClassId === cls.id;
            return (
              <motion.button
                key={cls.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => actions.selectClass(cls.id)}
                className="w-full rounded-xl p-4 flex items-center gap-4 text-left transition-all"
                style={{
                  background: isSelected ? `${cls.color}22` : '#1a1a2e',
                  border: `1px solid ${isSelected ? cls.color + '66' : 'rgba(124,58,237,0.2)'}`,
                  boxShadow: isSelected ? `0 0 20px ${cls.color}33` : 'none',
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: `${cls.color}22`, border: `1px solid ${cls.color}44` }}
                >
                  {CLASS_EMOJIS[cls.id]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white">{cls.name}</p>
                  <p className="text-xs text-gray-400">{cls.subtitle}</p>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {cls.statBoosts.map((b) => (
                      <span
                        key={b.stat}
                        className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                        style={{ background: `${cls.color}22`, color: cls.color }}
                      >
                        {b.stat} {b.value}
                      </span>
                    ))}
                  </div>
                </div>
                {isSelected && (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: cls.color }}
                  >
                    <Check size={14} className="text-white" />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Stats grid */}
      <div>
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Stats</h3>
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={Dumbbell} label="Total Workouts" value={totalWorkouts} color="#ef4444" />
          <StatCard icon={Zap} label="Total XP" value={totalXP.toLocaleString()} color="#7c3aed" />
          <StatCard icon={Star} label="Level" value={level} color="#f59e0b" />
          <StatCard icon={Flame} label="Best Streak" value={`${bestStreak}d`} color="#f59e0b" />
          <StatCard icon={Scroll} label="Quests Done" value={questsDone} color="#2563eb" />
          <StatCard icon={Repeat} label="Total Reps" value={totalReps.toLocaleString()} color="#10b981" />
        </div>
      </div>

      {/* Workout frequency chart */}
      <div className="bg-surface rounded-2xl p-4 surface-border">
        <h3 className="text-sm font-bold text-white mb-3">Workout Frequency (8 weeks)</h3>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={weeklyData} barSize={18}>
            <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
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
              {weeklyData.map((entry, index) => (
                <Cell key={index} fill={entry.count > 0 ? '#7c3aed' : '#16213e'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Muscle group chart */}
      {muscleData.length > 0 && (
        <div className="bg-surface rounded-2xl p-4 surface-border">
          <h3 className="text-sm font-bold text-white mb-3">Muscle Groups Trained</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={muscleData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {muscleData.map((entry, index) => (
                  <Cell key={index} fill={RARITY_COLORS_PIE[index % RARITY_COLORS_PIE.length]} />
                ))}
              </Pie>
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span style={{ color: '#9ca3af', fontSize: '11px' }}>{value}</span>}
              />
              <Tooltip
                contentStyle={{
                  background: '#1a1a2e',
                  border: '1px solid rgba(124,58,237,0.3)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Settings */}
      <div>
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Settings</h3>
        <div className="space-y-2">
          <Button
            variant="secondary"
            onClick={exportData}
            className="w-full flex items-center justify-between py-3"
          >
            <div className="flex items-center gap-2">
              <Download size={16} className="text-blue-light" />
              <span>Export Data</span>
            </div>
            <ChevronRight size={16} className="text-gray-500" />
          </Button>
          <Button
            variant="danger"
            onClick={() => setShowReset(true)}
            className="w-full flex items-center justify-between py-3 bg-red/10 text-red border border-red/30 hover:bg-red/20"
          >
            <div className="flex items-center gap-2">
              <RotateCcw size={16} />
              <span>Reset All Data</span>
            </div>
            <ChevronRight size={16} className="text-red/50" />
          </Button>
        </div>
      </div>

      {/* Reset confirm modal */}
      <Modal isOpen={showReset} onClose={() => setShowReset(false)} title="Reset All Data">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-red/10 flex items-center justify-center mx-auto border border-red/30">
            <RotateCcw size={28} className="text-red" />
          </div>
          <p className="text-white font-semibold">Are you sure?</p>
          <p className="text-gray-400 text-sm">
            This will permanently delete all your progress, workouts, achievements, and stats.
            This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowReset(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => { actions.resetAll(); setShowReset(false); }}
              className="flex-1"
            >
              Reset Everything
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
