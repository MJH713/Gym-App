import { ACHIEVEMENTS } from '../constants/achievements.js';

export function checkAchievements(stats, currentUnlocked) {
  const newlyUnlocked = [];
  const {
    totalWorkouts = 0,
    totalXP = 0,
    level = 1,
    currentStreak = 0,
    totalReps = 0,
    totalRunKm = 0,
    totalQuestsCompleted = 0,
    latestWorkout = null,
    allWeeklyQuestsCompleted = false,
    hasSelectedClass = false,
    maxWeightEverLifted = 0,
    maxCardioMinutesInSession = 0,
    maxMuscleGroupsInSession = 0,
  } = stats;

  const unlocked = new Set(currentUnlocked);

  const check = (id, condition) => {
    if (condition && !unlocked.has(id)) {
      newlyUnlocked.push(id);
      unlocked.add(id);
    }
  };

  check('first-blood', totalWorkouts >= 1);
  check('double-digits', totalWorkouts >= 10);
  check('century', totalWorkouts >= 100);
  check('week-warrior', currentStreak >= 7);
  check('month-grind', currentStreak >= 30);
  check('iron-will', currentStreak >= 100);
  check('rep-machine', totalReps >= 1000);
  check('heavy-lifter', maxWeightEverLifted >= 100);
  check('cardio-bunny', maxCardioMinutesInSession >= 60);
  check('marathon-mind', totalRunKm >= 42);
  check('level-5', level >= 5);
  check('level-10', level >= 10);
  check('xp-hoarder', totalXP >= 10000);
  check('quest-starter', totalQuestsCompleted >= 1);
  check('quest-machine', totalQuestsCompleted >= 50);
  check('variety-pack', maxMuscleGroupsInSession >= 5);
  check('class-chosen', hasSelectedClass);
  check('weekly-sweep', allWeeklyQuestsCompleted);

  // Time-based achievements from latest workout
  if (latestWorkout && latestWorkout.startedAt) {
    const hour = new Date(latestWorkout.startedAt).getHours();
    check('early-bird', hour < 7);
    check('night-owl', hour >= 22);
  }

  return newlyUnlocked;
}
