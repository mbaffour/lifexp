import type { Category, Habit, HabitCompletion, MetricDefinition, MetricLog, TimeEntry, XPTransaction } from '../types';
import { lastNDays } from './dates';

export function categoryName(categories: Category[], id: string) {
  return categories.find((category) => category.id === id)?.name ?? 'Uncategorized';
}

export function categoryColor(categories: Category[], id: string) {
  return categories.find((category) => category.id === id)?.color ?? '#94a3b8';
}

export function sumTimeByCategory(entries: TimeEntry[], categories: Category[]) {
  const totals = new Map<string, number>();
  entries.forEach((entry) => totals.set(entry.categoryId, (totals.get(entry.categoryId) ?? 0) + entry.durationMinutes));
  return Array.from(totals.entries())
    .map(([id, minutes]) => ({ id, name: categoryName(categories, id), minutes, hours: Number((minutes / 60).toFixed(1)), color: categoryColor(categories, id) }))
    .sort((a, b) => b.minutes - a.minutes);
}

export function habitCompletionRate(habit: Habit, completions: HabitCompletion[], days = 30) {
  const dates = new Set(completions.filter((completion) => completion.habitId === habit.id && !completion.skipped).map((completion) => completion.date));
  return Math.round((dates.size / days) * 100);
}

export function streakForHabit(habit: Habit, completions: HabitCompletion[]) {
  const completed = new Set(completions.filter((completion) => completion.habitId === habit.id && !completion.skipped).map((completion) => completion.date));
  let streak = 0;
  for (const day of lastNDays(365).reverse()) {
    if (!completed.has(day)) break;
    streak += 1;
  }
  let best = 0;
  let current = 0;
  lastNDays(365).forEach((day) => {
    if (completed.has(day)) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
  });
  return { current: streak, best };
}

export function dailySeries(days: number, xp: XPTransaction[], completions: HabitCompletion[], timeEntries: TimeEntry[], metricLogs: MetricLog[]) {
  return lastNDays(days).map((date) => ({
    date,
    xp: xp.filter((item) => item.createdAt.slice(0, 10) === date).reduce((sum, item) => sum + item.amount, 0),
    habits: completions.filter((completion) => completion.date === date && !completion.skipped).length,
    time: Math.round(timeEntries.filter((entry) => entry.startTime.slice(0, 10) === date).reduce((sum, entry) => sum + entry.durationMinutes, 0) / 60 * 10) / 10,
    metrics: metricLogs.filter((log) => log.date === date).length,
  }));
}

export function metricTrend(metric: MetricDefinition, logs: MetricLog[]) {
  return logs
    .filter((log) => log.metricId === metric.id && typeof log.value !== 'boolean')
    .slice(-30)
    .map((log) => ({ date: log.date, value: Number(log.value) || 0, name: metric.name }));
}

export function averageMetric(metric: MetricDefinition | undefined, logs: MetricLog[]) {
  if (!metric) return undefined;
  const values = logs.filter((log) => log.metricId === metric.id).map((log) => Number(log.value)).filter(Number.isFinite);
  if (!values.length) return undefined;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function compareThisWeekLastWeek(entries: TimeEntry[]) {
  const days = lastNDays(14);
  const lastWeek = entries.filter((entry) => days.slice(0, 7).includes(entry.startTime.slice(0, 10))).reduce((sum, entry) => sum + entry.durationMinutes, 0);
  const thisWeek = entries.filter((entry) => days.slice(7).includes(entry.startTime.slice(0, 10))).reduce((sum, entry) => sum + entry.durationMinutes, 0);
  if (lastWeek === 0 && thisWeek === 0) return 'Track a few sessions and LifeXP will compare this week with last week.';
  if (lastWeek === 0) return `You tracked ${(thisWeek / 60).toFixed(1)} hours this week. First baseline established.`;
  const change = Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
  return `You spent ${Math.abs(change)}% ${change >= 0 ? 'more' : 'less'} tracked time this week than last week.`;
}
