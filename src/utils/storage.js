const KEYS = {
  PROFILE: 'gymapp_profile',
  STREAK: 'gymapp_streak',
  WORKOUTS: 'gymapp_workouts',
  QUESTS: 'gymapp_quests',
  ACHIEVEMENTS: 'gymapp_achievements',
  XP_LOG: 'gymapp_xp_log',
};

export { KEYS };

export function getItem(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setItem(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getProfile() {
  return getItem(KEYS.PROFILE, null);
}

export function setProfile(p) {
  setItem(KEYS.PROFILE, p);
}

export function getStreak() {
  return getItem(KEYS.STREAK, {
    currentStreak: 0,
    longestStreak: 0,
    lastWorkoutDate: null,
    freezesAvailable: 1,
    freezeUsedOnDate: null,
  });
}

export function setStreak(s) {
  setItem(KEYS.STREAK, s);
}

export function getWorkouts() {
  return getItem(KEYS.WORKOUTS, []);
}

export function appendWorkout(w) {
  const ws = getWorkouts();
  ws.push(w);
  setItem(KEYS.WORKOUTS, ws);
}

export function getQuests() {
  return getItem(KEYS.QUESTS, null);
}

export function setQuests(q) {
  setItem(KEYS.QUESTS, q);
}

export function getAchievements() {
  return getItem(KEYS.ACHIEVEMENTS, { unlocked: [] });
}

export function setAchievements(a) {
  setItem(KEYS.ACHIEVEMENTS, a);
}

export function getXPLog() {
  return getItem(KEYS.XP_LOG, []);
}

export function appendXPLog(entry) {
  const log = getXPLog();
  log.push(entry);
  setItem(KEYS.XP_LOG, log);
}
