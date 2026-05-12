import { DAILY_QUEST_TEMPLATES, WEEKLY_QUEST_TEMPLATES } from '../constants/quests.js';

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function dateToSeed(dateStr) {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) & 0xffffffff;
  }
  return Math.abs(hash);
}

export function generateDailyQuests(dateStr) {
  const rng = seededRandom(dateToSeed(dateStr));

  // Always include complete_workout
  const fixed = DAILY_QUEST_TEMPLATES.find((t) => t.id === 'complete_workout');
  const rest = DAILY_QUEST_TEMPLATES.filter((t) => t.id !== 'complete_workout');

  // Pick 2 random from rest
  const shuffled = [...rest].sort(() => rng() - 0.5);
  const picked = shuffled.slice(0, 2);

  return [fixed, ...picked].map((template) => ({
    ...template,
    instanceId: `${template.id}_${dateStr}`,
    date: dateStr,
    progress: 0,
    completed: false,
    xpClaimed: false,
  }));
}

export function generateWeeklyQuests(weekKey) {
  return WEEKLY_QUEST_TEMPLATES.map((template) => ({
    ...template,
    instanceId: `${template.id}_${weekKey}`,
    weekKey,
    progress: 0,
    completed: false,
    xpClaimed: false,
  }));
}

export function updateQuestProgress(quests, workout) {
  const daily = (quests.daily || []).map((q) => {
    if (q.completed) return q;
    let newProgress = q.progress;

    switch (q.goalType) {
      case 'complete_workout':
        newProgress = Math.min(q.goal, newProgress + 1);
        break;
      case 'strength_sets': {
        const strengthSets = (workout.exercises || [])
          .filter((e) => e.category === 'strength')
          .reduce((acc, e) => acc + (e.sets || []).length, 0);
        newProgress = Math.min(q.goal, newProgress + strengthSets);
        break;
      }
      case 'cardio_time': {
        const cardioMins = (workout.exercises || [])
          .filter((e) => e.category === 'cardio')
          .reduce((acc, e) => acc + (e.durationMinutes || 0), 0);
        newProgress = Math.min(q.goal, newProgress + cardioMins);
        break;
      }
      case 'flexibility_flow': {
        const flexMins = (workout.exercises || [])
          .filter((e) => e.category === 'flexibility')
          .reduce((acc, e) => acc + (e.durationMinutes || 0), 0);
        newProgress = Math.min(q.goal, newProgress + flexMins);
        break;
      }
      case 'total_reps': {
        const totalReps = (workout.exercises || [])
          .filter((e) => e.category === 'strength')
          .reduce((acc, e) => acc + (e.sets || []).reduce((a, s) => a + (s.reps || 0), 0), 0);
        newProgress = Math.min(q.goal, newProgress + totalReps);
        break;
      }
      case 'multi_exercise': {
        const uniqueExercises = new Set((workout.exercises || []).map((e) => e.exerciseId));
        newProgress = Math.min(q.goal, uniqueExercises.size);
        break;
      }
      case 'morning_workout': {
        const hour = new Date(workout.startedAt).getHours();
        if (hour < 9) newProgress = Math.min(q.goal, newProgress + 1);
        break;
      }
      case 'heavy_set': {
        const hasHeavy = (workout.exercises || []).some((e) =>
          (e.sets || []).some((s) => (s.weight || 0) >= 50)
        );
        if (hasHeavy) newProgress = Math.min(q.goal, newProgress + 1);
        break;
      }
      case 'squat_sets': {
        const squatSets = (workout.exercises || [])
          .filter((e) => (e.name || '').toLowerCase().includes('squat'))
          .reduce((acc, e) => acc + (e.sets || []).length, 0);
        newProgress = Math.min(q.goal, newProgress + squatSets);
        break;
      }
      case 'pushup_reps': {
        const pushupReps = (workout.exercises || [])
          .filter((e) => (e.name || '').toLowerCase().includes('push'))
          .reduce((acc, e) => acc + (e.sets || []).reduce((a, s) => a + (s.reps || 0), 0), 0);
        newProgress = Math.min(q.goal, newProgress + pushupReps);
        break;
      }
      default:
        break;
    }

    const completed = newProgress >= q.goal;
    return { ...q, progress: newProgress, completed };
  });

  const weekly = (quests.weekly || []).map((q) => {
    if (q.completed) return q;
    let newProgress = q.progress;

    switch (q.goalType) {
      case 'weekly_workouts':
        newProgress = Math.min(q.goal, newProgress + 1);
        break;
      case 'weekly_cardio': {
        const cardioMins = (workout.exercises || [])
          .filter((e) => e.category === 'cardio')
          .reduce((acc, e) => acc + (e.durationMinutes || 0), 0);
        newProgress = Math.min(q.goal, newProgress + cardioMins);
        break;
      }
      case 'weekly_strength': {
        const hasStrength = (workout.exercises || []).some((e) => e.category === 'strength');
        if (hasStrength) newProgress = Math.min(q.goal, newProgress + 1);
        break;
      }
      case 'weekly_xp':
        newProgress = Math.min(q.goal, newProgress + (workout.xpEarned || 0));
        break;
      case 'weekly_streak':
        newProgress = Math.min(q.goal, newProgress + 1);
        break;
      default:
        break;
    }

    const completed = newProgress >= q.goal;
    return { ...q, progress: newProgress, completed };
  });

  return { ...quests, daily, weekly };
}
