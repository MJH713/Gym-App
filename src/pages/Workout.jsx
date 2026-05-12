import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dumbbell, Heart, Activity, Plus, Minus, Trash2, Play,
  CheckCircle, ChevronDown, Search, Clock, Timer, ArrowLeft,
  Zap, Star, Trophy,
} from 'lucide-react';
import { useGame } from '../context/GameStateContext.jsx';
import { EXERCISES } from '../constants/exercises.js';
import Button from '../components/ui/Button.jsx';
import LevelBadge from '../components/ui/LevelBadge.jsx';
import { getLevelFromXP } from '../utils/xp.js';
import { ACHIEVEMENTS } from '../constants/achievements.js';

const WORKOUT_TYPES = [
  { id: 'strength', label: 'Strength', icon: Dumbbell, color: '#ef4444', desc: 'Build muscle & power' },
  { id: 'cardio', label: 'Cardio', icon: Heart, color: '#2563eb', desc: 'Burn calories & endurance' },
  { id: 'flexibility', label: 'Flexibility', icon: Activity, color: '#10b981', desc: 'Mobility & recovery' },
];

function RestTimer({ onDone }) {
  const [seconds, setSeconds] = useState(30);

  useEffect(() => {
    if (seconds <= 0) { onDone(); return; }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds, onDone]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center"
    >
      <div className="bg-surface rounded-2xl p-8 text-center surface-border max-w-xs w-full mx-4">
        <p className="text-gray-400 text-sm font-medium mb-2">REST TIME</p>
        <div
          className="text-7xl font-black mb-4"
          style={{ color: seconds <= 10 ? '#ef4444' : '#10b981' }}
        >
          {seconds}
        </div>
        <p className="text-gray-400 mb-4">Catch your breath...</p>
        <Button variant="secondary" onClick={onDone} className="w-full">
          Skip Rest
        </Button>
      </div>
    </motion.div>
  );
}

function ExerciseBlock({ exercise, exData, onChange, onRemove, workoutType }) {
  const [showRest, setShowRest] = useState(false);

  const addSet = () => {
    const newSet = workoutType === 'strength'
      ? { reps: 10, weight: 0 }
      : { durationMinutes: 10, distanceKm: 0 };
    onChange({ ...exData, sets: [...(exData.sets || []), newSet] });
    setShowRest(true);
  };

  const removeSet = (idx) => {
    const sets = [...(exData.sets || [])];
    sets.splice(idx, 1);
    onChange({ ...exData, sets });
  };

  const updateSet = (idx, field, value) => {
    const sets = [...(exData.sets || [])];
    sets[idx] = { ...sets[idx], [field]: parseFloat(value) || 0 };
    onChange({ ...exData, sets });
  };

  const updateField = (field, value) => {
    onChange({ ...exData, [field]: parseFloat(value) || 0 });
  };

  return (
    <>
      {showRest && <RestTimer onDone={() => setShowRest(false)} />}
      <motion.div
        layout
        className="bg-surface rounded-xl p-4 surface-border"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-bold text-white">{exercise.name}</p>
            <p className="text-xs text-gray-500">{exercise.muscleGroups.join(', ')}</p>
          </div>
          <button
            onClick={onRemove}
            className="w-8 h-8 rounded-lg bg-red/10 flex items-center justify-center text-red hover:bg-red/20 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {(workoutType === 'cardio' || workoutType === 'flexibility') ? (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Duration (min)</label>
              <input
                type="number"
                min="0"
                value={exData.durationMinutes || ''}
                onChange={(e) => updateField('durationMinutes', e.target.value)}
                className="w-full bg-surface2 rounded-lg px-3 py-2 text-white text-sm border border-purple/20 focus:border-purple focus:outline-none"
                placeholder="0"
              />
            </div>
            {workoutType === 'cardio' && (
              <div>
                <label className="text-xs text-gray-400 block mb-1">Distance (km)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={exData.distanceKm || ''}
                  onChange={(e) => updateField('distanceKm', e.target.value)}
                  className="w-full bg-surface2 rounded-lg px-3 py-2 text-white text-sm border border-purple/20 focus:border-purple focus:outline-none"
                  placeholder="0"
                />
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Strength sets */}
            {(exData.sets || []).map((set, idx) => (
              <div key={idx} className="flex items-center gap-2 mb-2">
                <span className="text-xs text-gray-500 w-6 text-center font-bold">{idx + 1}</span>
                <div className="flex-1">
                  <label className="text-xs text-gray-500 block">Reps</label>
                  <input
                    type="number"
                    min="0"
                    value={set.reps || ''}
                    onChange={(e) => updateSet(idx, 'reps', e.target.value)}
                    className="w-full bg-surface2 rounded-lg px-2 py-1.5 text-white text-sm border border-purple/20 focus:border-purple focus:outline-none"
                    placeholder="0"
                  />
                </div>
                {!exercise.isBodyweight && (
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 block">Weight (kg)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={set.weight || ''}
                      onChange={(e) => updateSet(idx, 'weight', e.target.value)}
                      className="w-full bg-surface2 rounded-lg px-2 py-1.5 text-white text-sm border border-purple/20 focus:border-purple focus:outline-none"
                      placeholder="0"
                    />
                  </div>
                )}
                <button
                  onClick={() => removeSet(idx)}
                  className="w-7 h-7 rounded-lg bg-surface2 flex items-center justify-center text-gray-500 hover:text-red transition-colors mt-4"
                >
                  <Minus size={12} />
                </button>
              </div>
            ))}
            <Button
              variant="ghost"
              onClick={addSet}
              className="w-full mt-1 text-xs py-2 text-purple-light border border-purple/20 hover:bg-purple/10"
            >
              <Plus size={14} className="inline mr-1" />
              Add Set
            </Button>
          </>
        )}
      </motion.div>
    </>
  );
}

export default function Workout({ onNavigate }) {
  const { actions, profile, workouts, achievements } = useGame();
  const [phase, setPhase] = useState('idle');
  const [workoutType, setWorkoutType] = useState(null);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [exerciseData, setExerciseData] = useState({});
  const [searchText, setSearchText] = useState('');
  const [startedAt, setStartedAt] = useState(null);
  const [summary, setSummary] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (phase === 'active') {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const filteredExercises = EXERCISES.filter((e) => {
    const matchesType = !workoutType || e.category === workoutType;
    const matchesSearch = e.name.toLowerCase().includes(searchText.toLowerCase());
    return matchesType && matchesSearch;
  });

  const toggleExercise = (exercise) => {
    if (selectedExercises.find((e) => e.id === exercise.id)) {
      setSelectedExercises((prev) => prev.filter((e) => e.id !== exercise.id));
      const nd = { ...exerciseData };
      delete nd[exercise.id];
      setExerciseData(nd);
    } else {
      setSelectedExercises((prev) => [...prev, exercise]);
      const defaultData =
        exercise.category === 'strength'
          ? { sets: [{ reps: 10, weight: exercise.isBodyweight ? 0 : 20 }] }
          : { durationMinutes: 20, distanceKm: 0 };
      setExerciseData((prev) => ({ ...prev, [exercise.id]: defaultData }));
    }
  };

  const beginWorkout = () => {
    if (selectedExercises.length === 0) return;
    setStartedAt(new Date().toISOString());
    setElapsed(0);
    setPhase('active');
  };

  const finishWorkout = () => {
    const exercises = selectedExercises.map((ex) => ({
      exerciseId: ex.id,
      name: ex.name,
      category: ex.category,
      muscleGroups: ex.muscleGroups,
      isBodyweight: ex.isBodyweight,
      ...(ex.category === 'strength'
        ? { sets: exerciseData[ex.id]?.sets || [] }
        : {
            durationMinutes: exerciseData[ex.id]?.durationMinutes || 0,
            distanceKm: exerciseData[ex.id]?.distanceKm || 0,
            sets: [],
          }),
    }));

    const workoutData = {
      type: workoutType,
      exercises,
      startedAt,
      durationSeconds: elapsed,
    };

    const result = actions.completeWorkout(workoutData);
    setSummary(result);
    setPhase('summary');
  };

  const resetWorkout = () => {
    setPhase('idle');
    setWorkoutType(null);
    setSelectedExercises([]);
    setExerciseData({});
    setSearchText('');
    setStartedAt(null);
    setSummary(null);
    setElapsed(0);
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const unlockedSet = new Set((achievements?.unlocked || []).map((a) => a.id || a));

  // Idle — workout history
  if (phase === 'idle') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-white">Workout</h2>
          <Button variant="primary" onClick={() => setPhase('setup')} className="flex items-center gap-2">
            <Plus size={16} />
            New
          </Button>
        </div>

        {/* History */}
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Recent Workouts</h3>
          {workouts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-surface rounded-2xl p-8 text-center surface-border"
            >
              <Dumbbell size={40} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">No workouts yet</p>
              <p className="text-gray-600 text-sm mt-1">Complete your first workout to start earning XP!</p>
              <Button variant="primary" onClick={() => setPhase('setup')} className="mt-4">
                Start First Workout
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {[...workouts].reverse().slice(0, 10).map((w) => {
                const typeIcon = w.type === 'cardio' ? Heart : w.type === 'flexibility' ? Activity : Dumbbell;
                const TypeIcon = typeIcon;
                const typeColors = { strength: '#ef4444', cardio: '#2563eb', flexibility: '#10b981' };
                const color = typeColors[w.type] || '#7c3aed';
                return (
                  <motion.div
                    key={w.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-surface rounded-xl p-4 surface-border flex items-center gap-4"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
                      style={{ background: `${color}22`, border: `1px solid ${color}44` }}
                    >
                      <TypeIcon size={18} style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white capitalize">{w.type} Workout</p>
                      <p className="text-xs text-gray-400">
                        {w.exercises?.length || 0} exercises •{' '}
                        {new Date(w.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-purple-light text-sm">+{w.xpEarned} XP</p>
                      {w.durationSeconds && (
                        <p className="text-xs text-gray-500">{formatTime(w.durationSeconds)}</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Setup
  if (phase === 'setup') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={resetWorkout}
            className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center text-gray-400 hover:text-white surface-border"
          >
            <ArrowLeft size={18} />
          </button>
          <h2 className="text-xl font-black text-white">Setup Workout</h2>
        </div>

        {/* Workout type */}
        <div>
          <p className="text-sm font-semibold text-gray-400 mb-2">Choose Type</p>
          <div className="grid grid-cols-3 gap-2">
            {WORKOUT_TYPES.map(({ id, label, icon: Icon, color, desc }) => (
              <motion.button
                key={id}
                whileTap={{ scale: 0.96 }}
                onClick={() => { setWorkoutType(id); setSelectedExercises([]); setExerciseData({}); }}
                className="rounded-xl p-3 flex flex-col items-center gap-1 transition-all"
                style={{
                  background: workoutType === id ? `${color}22` : '#1a1a2e',
                  border: `1px solid ${workoutType === id ? color : 'rgba(124,58,237,0.2)'}`,
                  boxShadow: workoutType === id ? `0 0 16px ${color}33` : 'none',
                }}
              >
                <Icon size={22} style={{ color: workoutType === id ? color : '#6b7280' }} />
                <span className="text-xs font-bold" style={{ color: workoutType === id ? 'white' : '#6b7280' }}>
                  {label}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Exercise picker */}
        <div>
          <p className="text-sm font-semibold text-gray-400 mb-2">Add Exercises</p>
          <div className="relative mb-3">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search exercises..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full bg-surface rounded-xl pl-9 pr-3 py-2.5 text-white text-sm border border-purple/20 focus:border-purple focus:outline-none"
            />
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
            {filteredExercises.map((ex) => {
              const isSelected = selectedExercises.some((s) => s.id === ex.id);
              return (
                <motion.button
                  key={ex.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleExercise(ex)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all"
                  style={{
                    background: isSelected ? 'rgba(124,58,237,0.2)' : 'transparent',
                    border: `1px solid ${isSelected ? 'rgba(124,58,237,0.4)' : 'transparent'}`,
                  }}
                >
                  <div
                    className="w-5 h-5 rounded flex-shrink-0 flex items-center justify-center"
                    style={{
                      background: isSelected ? '#7c3aed' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${isSelected ? '#7c3aed' : 'rgba(255,255,255,0.1)'}`,
                    }}
                  >
                    {isSelected && <CheckCircle size={12} className="text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{ex.name}</p>
                    <p className="text-xs text-gray-500">{ex.muscleGroups.join(', ')}</p>
                  </div>
                  {ex.isBodyweight && (
                    <span className="text-xs text-green-light bg-green/10 px-1.5 py-0.5 rounded-full flex-shrink-0">BW</span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Selected exercises */}
        {selectedExercises.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-400 mb-2">
              Selected ({selectedExercises.length})
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedExercises.map((ex) => (
                <span
                  key={ex.id}
                  className="text-xs bg-purple/20 text-purple-light border border-purple/30 px-2 py-1 rounded-full flex items-center gap-1"
                >
                  {ex.name}
                  <button
                    onClick={() => toggleExercise(ex)}
                    className="text-purple-light hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <Button
          variant="primary"
          onClick={beginWorkout}
          disabled={selectedExercises.length === 0 || !workoutType}
          className="w-full py-4 text-base flex items-center justify-center gap-2"
        >
          <Play size={18} />
          Begin Workout
        </Button>
      </div>
    );
  }

  // Active
  if (phase === 'active') {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-white capitalize">{workoutType} Workout</h2>
            <div className="flex items-center gap-1.5 text-gray-400 text-sm mt-0.5">
              <Clock size={14} />
              <span>{formatTime(elapsed)}</span>
            </div>
          </div>
          <Button variant="danger" onClick={finishWorkout} className="flex items-center gap-2">
            <CheckCircle size={16} />
            Finish
          </Button>
        </div>

        {/* Exercise blocks */}
        <AnimatePresence mode="popLayout">
          {selectedExercises.map((ex) => (
            <ExerciseBlock
              key={ex.id}
              exercise={ex}
              exData={exerciseData[ex.id] || {}}
              workoutType={workoutType}
              onChange={(data) => setExerciseData((prev) => ({ ...prev, [ex.id]: data }))}
              onRemove={() => toggleExercise(ex)}
            />
          ))}
        </AnimatePresence>

        <Button
          variant="primary"
          onClick={finishWorkout}
          className="w-full py-4 text-base flex items-center justify-center gap-2"
        >
          <CheckCircle size={18} />
          Complete Workout
        </Button>
      </div>
    );
  }

  // Summary
  if (phase === 'summary' && summary) {
    const { xpEarned, workoutXP, questBonusXP, leveledUp, newLevel, newAchievements, questsCompleted } = summary;

    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-black text-white text-center">Workout Complete!</h2>

        {/* XP card */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring' }}
          className="bg-surface rounded-2xl p-6 text-center surface-border glow-purple"
        >
          <p className="text-gray-400 text-sm mb-2">XP Earned</p>
          <motion.p
            className="text-6xl font-black text-gradient mb-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', damping: 12 }}
          >
            +{xpEarned}
          </motion.p>
          {questBonusXP > 0 && (
            <p className="text-sm text-gold">
              Includes +{questBonusXP} XP from quests!
            </p>
          )}
        </motion.div>

        {/* Level up */}
        {leveledUp && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="bg-surface rounded-2xl p-5 text-center glow-gold"
            style={{ border: '1px solid rgba(245,158,11,0.5)' }}
          >
            <Star size={32} className="text-gold mx-auto mb-2" />
            <p className="text-gold font-black text-xl">LEVEL UP!</p>
            <p className="text-white font-bold mt-1">You reached Level {newLevel}!</p>
          </motion.div>
        )}

        {/* New achievements */}
        {newAchievements && newAchievements.length > 0 && (
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
              Achievements Unlocked!
            </p>
            {newAchievements.map((ach) => {
              const achData = ACHIEVEMENTS.find((a) => a.id === ach.id);
              return (
                <motion.div
                  key={ach.id}
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="bg-surface rounded-xl p-3 flex items-center gap-3 surface-border glow-gold mb-2"
                  style={{ borderColor: 'rgba(245,158,11,0.4)' }}
                >
                  <Trophy size={20} className="text-gold flex-shrink-0" />
                  <div>
                    <p className="font-bold text-white">{achData?.name || ach.id}</p>
                    <p className="text-xs text-gray-400">{achData?.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Quests completed */}
        {questsCompleted && questsCompleted.length > 0 && (
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
              Quests Completed!
            </p>
            {questsCompleted.map((q) => (
              <div
                key={q.instanceId}
                className="bg-surface rounded-xl p-3 flex items-center gap-3 mb-2"
                style={{ border: '1px solid rgba(245,158,11,0.3)' }}
              >
                <CheckCircle size={18} className="text-gold flex-shrink-0" />
                <p className="text-white font-medium text-sm flex-1">{q.title}</p>
                <span className="text-gold text-sm font-bold">+{q.xpReward} XP</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="secondary" onClick={resetWorkout} className="flex-1">
            New Workout
          </Button>
          <Button variant="primary" onClick={() => onNavigate('dashboard')} className="flex-1">
            Dashboard
          </Button>
        </div>
      </motion.div>
    );
  }

  return null;
}
