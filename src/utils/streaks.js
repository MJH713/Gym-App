export function isStreakActive(lastWorkoutDate) {
  if (!lastWorkoutDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const last = new Date(lastWorkoutDate + 'T00:00:00');
  last.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((today - last) / (1000 * 60 * 60 * 24));
  return diffDays <= 1;
}

export function updateStreak(currentStreakData, workoutDate) {
  const data = { ...currentStreakData };
  const today = workoutDate || new Date().toISOString().split('T')[0];

  if (data.lastWorkoutDate === today) {
    // Already worked out today, no change
    return data;
  }

  if (!data.lastWorkoutDate) {
    // First workout ever
    data.currentStreak = 1;
    data.longestStreak = 1;
    data.lastWorkoutDate = today;
    return data;
  }

  const lastDate = new Date(data.lastWorkoutDate + 'T00:00:00');
  const todayDate = new Date(today + 'T00:00:00');
  lastDate.setHours(0, 0, 0, 0);
  todayDate.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    // Consecutive day
    data.currentStreak = (data.currentStreak || 0) + 1;
  } else if (diffDays === 2 && data.freezesAvailable > 0) {
    // Use freeze
    data.currentStreak = (data.currentStreak || 0) + 1;
    data.freezesAvailable = Math.max(0, (data.freezesAvailable || 0) - 1);
    data.freezeUsedOnDate = today;
  } else {
    // Streak broken
    data.currentStreak = 1;
  }

  data.longestStreak = Math.max(data.longestStreak || 0, data.currentStreak);
  data.lastWorkoutDate = today;

  return data;
}
