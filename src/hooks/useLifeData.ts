import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/lifexpDb';
import type { Settings } from '../types';

const emptyData = {
  profile: undefined,
  stats: undefined,
  settings: undefined as Settings | undefined,
  categories: [],
  habits: [],
  habitCompletions: [],
  timeEntries: [],
  metricDefinitions: [],
  metricLogs: [],
  routines: [],
  achievements: [],
  xpTransactions: [],
  quests: [],
  todoItems: [],
  timetableBlocks: [],
  reports: [],
};

export function useLifeData() {
  const data = useLiveQuery(async () => {
    const [
      profile,
      stats,
      settings,
      categories,
      habits,
      habitCompletions,
      timeEntries,
      metricDefinitions,
      metricLogs,
      routines,
      achievements,
      xpTransactions,
      quests,
      todoItems,
      timetableBlocks,
      reports,
    ] = await Promise.all([
      db.userProfile.get('local_profile'),
      db.userStats.get('stats'),
      db.settings.get('settings'),
      db.categories.toArray(),
      db.habits.toArray(),
      db.habitCompletions.toArray(),
      db.timeEntries.orderBy('startTime').reverse().toArray(),
      db.metricDefinitions.toArray(),
      db.metricLogs.orderBy('timestamp').reverse().toArray(),
      db.routines.toArray(),
      db.achievements.toArray(),
      db.xpTransactions.toArray(),
      db.quests.toArray(),
      db.todoItems.toArray(),
      db.timetableBlocks.toArray(),
      db.reports.toArray(),
    ]);

    return {
      profile,
      stats,
      settings,
      categories,
      habits,
      habitCompletions,
      timeEntries,
      metricDefinitions,
      metricLogs,
      routines,
      achievements,
      xpTransactions,
      quests,
      todoItems,
      timetableBlocks,
      reports,
    };
  }, [], emptyData);

  return data;
}
