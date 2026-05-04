import { addDays, eachDayOfInterval, format, isSameDay, parseISO, startOfDay, subDays } from 'date-fns';

export const todayKey = () => format(new Date(), 'yyyy-MM-dd');
export const dateKey = (date: Date | string) => format(typeof date === 'string' ? parseISO(date) : date, 'yyyy-MM-dd');
export const prettyDate = (date: Date | string) => format(typeof date === 'string' ? parseISO(date) : date, 'MMM d, yyyy');
export const prettyTime = (iso: string) => format(parseISO(iso), 'p');

export function lastNDays(days: number) {
  const end = startOfDay(new Date());
  const start = subDays(end, days - 1);
  return eachDayOfInterval({ start, end }).map((day) => dateKey(day));
}

export function sameCalendarDay(a: string, b: string) {
  return isSameDay(parseISO(a), parseISO(b));
}

export function addDaysToKey(key: string, amount: number) {
  return dateKey(addDays(parseISO(key), amount));
}
