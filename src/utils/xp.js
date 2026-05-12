import {
  XP_PER_REP_BODYWEIGHT,
  COMPLETION_BONUS,
  VARIETY_BONUS_PER_MUSCLE_GROUP,
  MAX_VARIETY_BONUS,
  STREAK_BONUS_PER_DAY,
  MAX_STREAK_BONUS_DAYS,
  CARDIO_XP_PER_MINUTE,
  CARDIO_XP_PER_KM,
  FLEX_XP_PER_MINUTE,
} from '../constants/xp.js';

export function getLevelFromXP(totalXP) {
  let level = 1;
  while (500 * level * level <= totalXP) level++;
  return level - 1;
}

export function getXPProgress(totalXP) {
  const level = getLevelFromXP(totalXP);
  const currentLevelXP = 500 * level * level;
  const nextLevelXP = 500 * (level + 1) * (level + 1);
  const needed = nextLevelXP - currentLevelXP;
  const progress = totalXP - currentLevelXP;
  return {
    level,
    progress,
    needed,
    percent: Math.min(100, (progress / needed) * 100),
  };
}

export function calculateWorkoutXP(workout, characterClass, currentStreak) {
  let baseXP = 0;
  const muscleGroupsSeen = new Set();

  for (const exercise of workout.exercises || []) {
    if (exercise.category === 'cardio') {
      const mins = exercise.durationMinutes || 0;
      const km = exercise.distanceKm || 0;
      baseXP += mins * CARDIO_XP_PER_MINUTE + km * CARDIO_XP_PER_KM;
    } else if (exercise.category === 'flexibility') {
      const mins = exercise.durationMinutes || 0;
      baseXP += mins * FLEX_XP_PER_MINUTE;
    } else {
      // strength
      for (const set of exercise.sets || []) {
        if (exercise.isBodyweight) {
          baseXP += (set.reps || 0) * XP_PER_REP_BODYWEIGHT;
        } else {
          const weight = Math.max(set.weight || 0, 1);
          baseXP += (set.reps || 0) * weight * 0.1;
        }
      }
    }

    // Collect muscle groups for variety bonus
    for (const mg of exercise.muscleGroups || []) {
      muscleGroupsSeen.add(mg);
    }
  }

  // Class multiplier
  let multiplier = 1;
  if (characterClass) {
    const workoutCategory = workout.type;
    if (characterClass.xpMultiplierCategory === workoutCategory) {
      multiplier = characterClass.multiplier || 1.25;
    }
  }

  baseXP = Math.round(baseXP * multiplier);

  // Completion bonus
  baseXP += COMPLETION_BONUS;

  // Variety bonus
  const varietyBonus = Math.min(
    muscleGroupsSeen.size * VARIETY_BONUS_PER_MUSCLE_GROUP,
    MAX_VARIETY_BONUS
  );
  baseXP += varietyBonus;

  // Streak bonus
  const streakDays = Math.min(currentStreak || 0, MAX_STREAK_BONUS_DAYS);
  const streakBonus = streakDays * STREAK_BONUS_PER_DAY;
  baseXP += streakBonus;

  return Math.round(baseXP);
}
