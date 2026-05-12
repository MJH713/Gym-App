export function getToday() {
  return new Date().toISOString().split('T')[0];
}

export function isSameDay(date1, date2) {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

export function getWeekKey(date) {
  return `${date.getFullYear()}-W${String(getWeekNumber(date)).padStart(2, '0')}`;
}

export function getWeekDates(referenceDate = new Date()) {
  const dates = [];
  const day = referenceDate.getDay();
  // Monday = 0 offset
  const monday = new Date(referenceDate);
  const diff = (day === 0 ? -6 : 1 - day);
  monday.setDate(referenceDate.getDate() + diff);
  monday.setHours(0, 0, 0, 0);

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

export function getDayOfWeek(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.getDay(); // 0 = Sunday, 6 = Saturday
}
