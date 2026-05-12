import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  getProfile, setProfile,
  getStreak, setStreak,
  getWorkouts, appendWorkout,
  getQuests, setQuests,
  getAchievements, setAchievements,
  getXPLog, appendXPLog,
} from '../utils/storage.js';
import { calculateWorkoutXP, getLevelFromXP } from '../utils/xp.js';
import { updateStreak } from '../utils/streaks.js';
import { checkAchievements } from '../utils/achievements.js';
import { generateDailyQuests, generateWeeklyQuests, updateQuestProgress } from '../utils/quests.js';
import { getToday, getWeekKey } from '../utils/date.js';
import { CHARACTER_CLASSES } from '../constants/classes.js';
import { LEVEL_TITLES } from '../constants/xp.js';

function computeStats(workouts, profile, achievements, quests) {
  const totalWorkouts = workouts.length;
  const totalXP = profile?.totalXP || 0;
  const level = getLevelFromXP(totalXP);
  const currentStreak = profile?.currentStreak || 0;

  let totalReps = 0;
  let totalRunKm = 0;
  let maxWeightEverLifted = 0;
  let maxCardioMinutesInSession = 0;
  let maxMuscleGroupsInSession = 0;

  for (const w of workouts) {
    let cardioMins = 0;
    const muscleGroups = new Set();
    for (const e of w.exercises || []) {
      for (const mg of e.muscleGroups || []) muscleGroups.add(mg);
      if (e.category === 'strength') {
        for (const s of e.sets || []) {
          totalReps += s.reps || 0;
          if ((s.weight || 0) > maxWeightEverLifted) maxWeightEverLifted = s.weight || 0;
        }
      } else if (e.category === 'cardio') {
        cardioMins += e.durationMinutes || 0;
        if ((e.name || '').toLowerCase().includes('run') || (e.name || '').toLowerCase().includes('treadmill')) {
          totalRunKm += e.distanceKm || 0;
        }
      }
    }
    if (cardioMins > maxCardioMinutesInSession) maxCardioMinutesInSession = cardioMins;
    if (muscleGroups.size > maxMuscleGroupsInSession) maxMuscleGroupsInSession = muscleGroups.size;
  }

  const latestWorkout = workouts.length > 0 ? workouts[workouts.length - 1] : null;

  // Count completed quests
  let totalQuestsCompleted = 0;
  const allQ = quests || {};
  for (const q of [...(allQ.daily || []), ...(allQ.weekly || [])]) {
    if (q.completed) totalQuestsCompleted++;
  }
  // Also from profile
  totalQuestsCompleted += profile?.totalQuestsCompleted || 0;

  // Check if all weekly quests completed
  const allWeeklyQuestsCompleted = (allQ.weekly || []).length === 5 &&
    (allQ.weekly || []).every((q) => q.completed);

  const hasSelectedClass = !!profile?.characterClassId;

  return {
    totalWorkouts,
    totalXP,
    level,
    currentStreak,
    totalReps,
    totalRunKm,
    totalQuestsCompleted,
    latestWorkout,
    allWeeklyQuestsCompleted,
    hasSelectedClass,
    maxWeightEverLifted,
    maxCardioMinutesInSession,
    maxMuscleGroupsInSession,
  };
}

export default function useGameState() {
  const [profile, setProfileState] = useState(null);
  const [streak, setStreakState] = useState(null);
  const [workouts, setWorkoutsState] = useState([]);
  const [quests, setQuestsState] = useState(null);
  const [achievements, setAchievementsState] = useState({ unlocked: [] });
  const [xpLog, setXPLogState] = useState([]);
  const [toasts, setToasts] = useState([]);

  // Load all state from localStorage on mount
  useEffect(() => {
    const p = getProfile();
    const s = getStreak();
    const w = getWorkouts();
    const a = getAchievements();
    const xp = getXPLog();

    setProfileState(p);
    setStreakState(s);
    setWorkoutsState(w);
    setAchievementsState(a);
    setXPLogState(xp);

    // Load / refresh quests
    const today = getToday();
    const weekKey = getWeekKey(new Date());
    const storedQuests = getQuests();

    let resolvedQuests;
    if (!storedQuests) {
      resolvedQuests = {
        daily: generateDailyQuests(today),
        dailyDate: today,
        weekly: generateWeeklyQuests(weekKey),
        weekKey,
      };
    } else {
      let daily = storedQuests.daily;
      let dailyDate = storedQuests.dailyDate;
      let weekly = storedQuests.weekly;
      let currentWeekKey = storedQuests.weekKey;

      if (dailyDate !== today) {
        daily = generateDailyQuests(today);
        dailyDate = today;
      }
      if (currentWeekKey !== weekKey) {
        weekly = generateWeeklyQuests(weekKey);
        currentWeekKey = weekKey;
      }

      resolvedQuests = { daily, dailyDate, weekly, weekKey: currentWeekKey };
    }

    setQuestsState(resolvedQuests);
    setQuests(resolvedQuests);
  }, []);

  const addToast = useCallback((toast) => {
    const id = uuidv4();
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const refreshQuests = useCallback(() => {
    const today = getToday();
    const weekKey = getWeekKey(new Date());
    const storedQuests = getQuests();

    let daily = storedQuests?.daily || [];
    let dailyDate = storedQuests?.dailyDate;
    let weekly = storedQuests?.weekly || [];
    let currentWeekKey = storedQuests?.weekKey;

    let changed = false;
    if (dailyDate !== today) {
      daily = generateDailyQuests(today);
      dailyDate = today;
      changed = true;
    }
    if (currentWeekKey !== weekKey) {
      weekly = generateWeeklyQuests(weekKey);
      currentWeekKey = weekKey;
      changed = true;
    }

    if (changed) {
      const updated = { daily, dailyDate, weekly, weekKey: currentWeekKey };
      setQuestsState(updated);
      setQuests(updated);
    }
  }, []);

  const completeWorkout = useCallback((workoutData) => {
    const currentProfile = getProfile();
    const currentStreak = getStreak();
    const currentWorkouts = getWorkouts();
    const currentAchievements = getAchievements();

    // Get character class
    const characterClass = currentProfile?.characterClassId
      ? CHARACTER_CLASSES.find((c) => c.id === currentProfile.characterClassId)
      : null;

    // 1. Calculate XP
    const workoutWithMeta = {
      ...workoutData,
      id: uuidv4(),
      completedAt: new Date().toISOString(),
    };

    const xpEarned = calculateWorkoutXP(
      workoutWithMeta,
      characterClass,
      currentStreak.currentStreak
    );

    workoutWithMeta.xpEarned = xpEarned;

    // 2. Append workout
    appendWorkout(workoutWithMeta);
    const updatedWorkouts = [...currentWorkouts, workoutWithMeta];

    // 3. Update profile
    const oldTotalXP = currentProfile?.totalXP || 0;
    const newTotalXP = oldTotalXP + xpEarned;
    const oldLevel = getLevelFromXP(oldTotalXP);
    const newLevel = getLevelFromXP(newTotalXP);
    const leveledUp = newLevel > oldLevel;

    const updatedProfile = {
      ...currentProfile,
      totalXP: newTotalXP,
      level: newLevel,
      levelTitle: LEVEL_TITLES[Math.min(newLevel - 1, LEVEL_TITLES.length - 1)],
      totalWorkouts: (currentProfile?.totalWorkouts || 0) + 1,
      totalReps: (currentProfile?.totalReps || 0) + getTotalRepsFromWorkout(workoutWithMeta),
    };

    setProfile(updatedProfile);

    // 4. Update streak
    const workoutDate = workoutWithMeta.completedAt.split('T')[0];
    const updatedStreak = updateStreak(currentStreak, workoutDate);
    updatedProfile.currentStreak = updatedStreak.currentStreak;
    setProfile(updatedProfile);
    setStreak(updatedStreak);

    // 5. Update quest progress
    const storedQuests = getQuests();
    const today = getToday();
    const weekKey = getWeekKey(new Date());
    let currentQuests = storedQuests || {
      daily: generateDailyQuests(today),
      dailyDate: today,
      weekly: generateWeeklyQuests(weekKey),
      weekKey,
    };

    const questsBeforeUpdate = currentQuests;
    const updatedQuests = updateQuestProgress(currentQuests, workoutWithMeta);

    // Count newly completed quests
    const prevCompleted = new Set(
      [...(questsBeforeUpdate.daily || []), ...(questsBeforeUpdate.weekly || [])]
        .filter((q) => q.completed)
        .map((q) => q.instanceId)
    );
    const nowCompleted = [
      ...(updatedQuests.daily || []),
      ...(updatedQuests.weekly || []),
    ].filter((q) => q.completed && !prevCompleted.has(q.instanceId));

    const questsCompleted = nowCompleted;

    // Update stored quests with earned XP from quests
    let bonusQuestXP = 0;
    for (const q of questsCompleted) {
      bonusQuestXP += q.xpReward || 0;
    }

    // Apply quest XP bonus to profile
    if (bonusQuestXP > 0) {
      updatedProfile.totalXP = newTotalXP + bonusQuestXP;
      updatedProfile.level = getLevelFromXP(updatedProfile.totalXP);
      updatedProfile.levelTitle = LEVEL_TITLES[Math.min(updatedProfile.level - 1, LEVEL_TITLES.length - 1)];
      updatedProfile.totalQuestsCompleted =
        (currentProfile?.totalQuestsCompleted || 0) + questsCompleted.length;
      setProfile(updatedProfile);
    }

    setQuests(updatedQuests);

    // 6. Check achievements
    const stats = computeStats(updatedWorkouts, updatedProfile, currentAchievements, updatedQuests);
    const newAchievementIds = checkAchievements(stats, currentAchievements.unlocked || []);

    const newAchievements = newAchievementIds.map((id) => ({
      id,
      unlockedAt: new Date().toISOString(),
    }));

    const updatedAchievements = {
      unlocked: [
        ...(currentAchievements.unlocked || []),
        ...newAchievements,
      ],
    };
    setAchievements(updatedAchievements);

    // 7. Append XP log
    const logEntry = {
      id: uuidv4(),
      date: workoutDate,
      workoutId: workoutWithMeta.id,
      xpEarned,
      bonusQuestXP,
      level: newLevel,
    };
    appendXPLog(logEntry);

    // Update react state
    setProfileState(updatedProfile);
    setStreakState(updatedStreak);
    setWorkoutsState(updatedWorkouts);
    setQuestsState(updatedQuests);
    setAchievementsState(updatedAchievements);
    setXPLogState(getXPLog());

    // 8. Fire toasts
    addToast({ type: 'xp', message: `+${xpEarned} XP earned!`, icon: 'Sparkles' });
    if (leveledUp) {
      addToast({
        type: 'levelup',
        message: `Level Up! You are now Level ${newLevel}!`,
        icon: 'Star',
      });
    }
    for (const ach of newAchievements) {
      addToast({
        type: 'achievement',
        message: `Achievement: ${ach.id}`,
        icon: 'Trophy',
        achievementId: ach.id,
      });
    }
    for (const q of questsCompleted) {
      addToast({
        type: 'quest',
        message: `Quest Complete: ${q.title} (+${q.xpReward} XP)`,
        icon: 'CheckCircle',
      });
    }

    return {
      xpEarned: xpEarned + bonusQuestXP,
      workoutXP: xpEarned,
      questBonusXP: bonusQuestXP,
      leveledUp,
      oldLevel,
      newLevel,
      newAchievements,
      questsCompleted,
    };
  }, [addToast]);

  const selectClass = useCallback((classId) => {
    const currentProfile = getProfile();
    const updatedProfile = { ...currentProfile, characterClassId: classId };
    setProfile(updatedProfile);
    setProfileState(updatedProfile);

    // Check class-chosen achievement
    const currentAchievements = getAchievements();
    if (!currentAchievements.unlocked.find((a) => (a.id || a) === 'class-chosen')) {
      const updated = {
        unlocked: [
          ...currentAchievements.unlocked,
          { id: 'class-chosen', unlockedAt: new Date().toISOString() },
        ],
      };
      setAchievements(updated);
      setAchievementsState(updated);
      addToast({ type: 'achievement', message: 'Achievement: Chosen One!', icon: 'UserCheck' });
    }
  }, [addToast]);

  const updateUsername = useCallback((username) => {
    const currentProfile = getProfile();
    const updatedProfile = { ...currentProfile, username };
    setProfile(updatedProfile);
    setProfileState(updatedProfile);
  }, []);

  const createProfile = useCallback((username, classId) => {
    const newProfile = {
      id: uuidv4(),
      username,
      characterClassId: classId,
      totalXP: 0,
      level: 1,
      levelTitle: LEVEL_TITLES[0],
      totalWorkouts: 0,
      totalReps: 0,
      totalQuestsCompleted: 0,
      createdAt: new Date().toISOString(),
    };
    setProfile(newProfile);
    setProfileState(newProfile);

    // Give class-chosen achievement
    const ach = { unlocked: [{ id: 'class-chosen', unlockedAt: new Date().toISOString() }] };
    setAchievements(ach);
    setAchievementsState(ach);
  }, []);

  const resetAll = useCallback(() => {
    localStorage.clear();
    setProfileState(null);
    setStreakState({ currentStreak: 0, longestStreak: 0, lastWorkoutDate: null, freezesAvailable: 1 });
    setWorkoutsState([]);
    setQuestsState(null);
    setAchievementsState({ unlocked: [] });
    setXPLogState([]);
    setToasts([]);
  }, []);

  return {
    profile,
    streak,
    workouts,
    quests,
    achievements,
    xpLog,
    toasts,
    actions: {
      completeWorkout,
      selectClass,
      updateUsername,
      createProfile,
      resetAll,
      refreshQuests,
      addToast,
      removeToast,
    },
  };
}

function getTotalRepsFromWorkout(workout) {
  let total = 0;
  for (const e of workout.exercises || []) {
    if (e.category === 'strength') {
      for (const s of e.sets || []) {
        total += s.reps || 0;
      }
    }
  }
  return total;
}
