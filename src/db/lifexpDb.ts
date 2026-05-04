import Dexie, { type Table } from 'dexie';
import {
  makeAchievements,
  makeCategories,
  makeDefaultHabits,
  makeMetricDefinitions,
  makeProfile,
  makeQuests,
  makeRoutines,
  makeSettings,
  makeStats,
  makeTimetableBlocks,
  makeTodoItems,
} from '../data/seed';
import type {
  Achievement,
  BackupPayload,
  Category,
  Habit,
  HabitCompletion,
  MetricDefinition,
  MetricLog,
  Quest,
  ReportRecord,
  Routine,
  RoutineLog,
  Settings,
  TimetableBlock,
  TimeEntry,
  TodoItem,
  UserProfile,
  UserStats,
  XPTransaction,
} from '../types';
import { getLevelInfo } from '../utils/gamification';

export const APP_VERSION = '1.1.0';
export const SCHEMA_VERSION = 2;

export class LifeXPDatabase extends Dexie {
  userProfile!: Table<UserProfile, string>;
  userStats!: Table<UserStats, string>;
  categories!: Table<Category, string>;
  habits!: Table<Habit, string>;
  habitCompletions!: Table<HabitCompletion, string>;
  timeEntries!: Table<TimeEntry, string>;
  metricDefinitions!: Table<MetricDefinition, string>;
  metricLogs!: Table<MetricLog, string>;
  routines!: Table<Routine, string>;
  routineLogs!: Table<RoutineLog, string>;
  achievements!: Table<Achievement, string>;
  xpTransactions!: Table<XPTransaction, string>;
  quests!: Table<Quest, string>;
  todoItems!: Table<TodoItem, string>;
  timetableBlocks!: Table<TimetableBlock, string>;
  settings!: Table<Settings, string>;
  reports!: Table<ReportRecord, string>;

  constructor() {
    super('LifeXP');
    this.version(1).stores({
      userProfile: 'id',
      userStats: 'id',
      categories: 'id, name',
      habits: 'id, categoryId, status, createdAt',
      habitCompletions: 'id, habitId, date, createdAt',
      timeEntries: 'id, categoryId, startTime, endTime, createdAt',
      metricDefinitions: 'id, categoryId, name, archived',
      metricLogs: 'id, metricId, date, timestamp',
      routines: 'id, categoryId',
      routineLogs: 'id, routineId, date',
      achievements: 'id, condition, unlockedAt',
      xpTransactions: 'id, sourceType, sourceId, createdAt',
      quests: 'id, type, date, status',
      settings: 'id',
      reports: 'id, createdAt',
    });
    this.version(2).stores({
      userProfile: 'id',
      userStats: 'id',
      categories: 'id, name',
      habits: 'id, categoryId, status, createdAt',
      habitCompletions: 'id, habitId, date, createdAt',
      timeEntries: 'id, categoryId, startTime, endTime, createdAt',
      metricDefinitions: 'id, categoryId, name, archived',
      metricLogs: 'id, metricId, date, timestamp',
      routines: 'id, categoryId',
      routineLogs: 'id, routineId, date',
      achievements: 'id, condition, unlockedAt',
      xpTransactions: 'id, sourceType, sourceId, createdAt',
      quests: 'id, type, date, status',
      todoItems: 'id, categoryId, dueDate, scheduledDate, status, priority, createdAt',
      timetableBlocks: 'id, categoryId, date, startTime, status, createdAt',
      settings: 'id',
      reports: 'id, createdAt',
    });
  }
}

export const db = new LifeXPDatabase();

const now = () => new Date().toISOString();
export const uuid = (prefix = '') => `${prefix}${crypto.randomUUID()}`;

export async function ensureBootstrap() {
  const settings = await db.settings.get('settings');
  if (settings) {
    if (!settings.dashboardWidgets.includes('planner')) {
      const categories = await db.categories.toArray();
      if (categories.length && (await db.todoItems.count()) === 0) {
        const todoItems = makeTodoItems(categories);
        await db.todoItems.bulkPut(todoItems);
        await db.timetableBlocks.bulkPut(makeTimetableBlocks(categories, todoItems));
      }
      await db.settings.update('settings', { dashboardWidgets: [...settings.dashboardWidgets, 'planner'] });
    }
    return;
  }
  await db.transaction('rw', db.settings, db.userProfile, db.userStats, db.achievements, async () => {
    await db.settings.put(makeSettings(false));
    await db.userProfile.put(makeProfile());
    await db.userStats.put(makeStats());
    await db.achievements.bulkPut(makeAchievements());
  });
}

export async function initializeLifeXP(mode: 'fresh' | 'demo') {
  const categories = makeCategories();
  const habits = makeDefaultHabits(categories);
  const metrics = makeMetricDefinitions(categories);
  const routines = makeRoutines(categories);
  const quests = makeQuests();
  const todoItems = makeTodoItems(categories);
  const timetableBlocks = makeTimetableBlocks(categories, todoItems);
  const settings = makeSettings(true);

  await db.transaction(
    'rw',
    [
      db.categories,
      db.habits,
      db.metricDefinitions,
      db.routines,
      db.quests,
      db.settings,
      db.habitCompletions,
      db.metricLogs,
      db.timeEntries,
      db.xpTransactions,
      db.reports,
      db.userProfile,
      db.userStats,
      db.achievements,
      db.todoItems,
      db.timetableBlocks,
    ],
    async () => {
      await Promise.all([
        db.categories.clear(),
        db.habits.clear(),
        db.metricDefinitions.clear(),
        db.routines.clear(),
        db.quests.clear(),
        db.habitCompletions.clear(),
        db.metricLogs.clear(),
        db.timeEntries.clear(),
        db.xpTransactions.clear(),
        db.reports.clear(),
        db.achievements.clear(),
        db.todoItems.clear(),
        db.timetableBlocks.clear(),
      ]);

      await db.categories.bulkPut(categories);
      await db.habits.bulkPut(habits);
      await db.metricDefinitions.bulkPut(metrics);
      await db.routines.bulkPut(routines);
      await db.quests.bulkPut(quests);
      await db.todoItems.bulkPut(todoItems);
      await db.timetableBlocks.bulkPut(timetableBlocks);
      await db.userProfile.put(makeProfile());
      await db.userStats.put(makeStats());
      await db.achievements.bulkPut(makeAchievements());
      await db.settings.put(settings);

      if (mode === 'demo') {
        const today = new Date();
        const completions: HabitCompletion[] = [];
        const metricLogs: MetricLog[] = [];
        const timeEntries: TimeEntry[] = [];
        for (let dayOffset = 13; dayOffset >= 0; dayOffset -= 1) {
          const date = new Date(today);
          date.setDate(today.getDate() - dayOffset);
          const dateString = date.toISOString().slice(0, 10);
          habits.slice(0, 6).forEach((habit, index) => {
            if ((dayOffset + index) % 3 !== 0) {
              completions.push({
                id: uuid('hc_'),
                habitId: habit.id,
                date: dateString,
                completedAt: date.toISOString(),
                count: habit.targetCount,
                notes: '',
                xpEarned: habit.xpReward,
                createdAt: date.toISOString(),
              });
            }
          });
          metrics.slice(0, 8).forEach((metric, index) => {
            metricLogs.push({
              id: uuid('ml_'),
              metricId: metric.id,
              timestamp: date.toISOString(),
              date: dateString,
              value:
                metric.name === 'Weight'
                  ? 180 - dayOffset * 0.15
                  : metric.name === 'Sleep hours'
                    ? 6.5 + ((index + dayOffset) % 4) * 0.35
                    : metric.name === 'Poop frequency'
                      ? 1 + ((index + dayOffset) % 3)
                      : metric.name === 'Water intake'
                        ? 5 + ((index + dayOffset) % 5)
                        : 4 + ((index + dayOffset) % 6),
              note: '',
              tags: [],
              createdAt: date.toISOString(),
              updatedAt: date.toISOString(),
            });
          });
          const start = new Date(date);
          start.setHours(9 + (dayOffset % 4), 0, 0, 0);
          const end = new Date(start);
          end.setMinutes(start.getMinutes() + 45 + (dayOffset % 5) * 25);
          timeEntries.push({
            id: uuid('time_'),
            title: dayOffset % 2 === 0 ? 'Research block' : 'Coding sprint',
            categoryId: categoryId(categories, dayOffset % 2 === 0 ? 'Research' : 'Coding'),
            tags: dayOffset % 2 === 0 ? ['deep-work'] : ['build'],
            startTime: start.toISOString(),
            endTime: end.toISOString(),
            durationMinutes: Math.round((end.getTime() - start.getTime()) / 60000),
            timerMode: 'focus',
            mode: 'focus',
            notes: '',
            energyBefore: 6,
            energyAfter: 7,
            focusScore: 8,
            createdAt: start.toISOString(),
            updatedAt: end.toISOString(),
          });
        }
        await db.habitCompletions.bulkPut(completions);
        await db.metricLogs.bulkPut(metricLogs);
        await db.timeEntries.bulkPut(timeEntries);
        await addXP(725, 'demo_seed', 'demo', 'Loaded demo progress');
      }
    },
  );
}

const categoryId = (categories: Category[], name: string) =>
  categories.find((category) => category.name === name)?.id ?? categories[0].id;

export async function addXP(amount: number, sourceType: string, sourceId: string, reason: string) {
  const settings = await db.settings.get('settings');
  if (settings && !settings.xpEnabled) return;
  await db.transaction('rw', db.userStats, db.xpTransactions, async () => {
    const stats = (await db.userStats.get('stats')) ?? makeStats();
    const totalXP = Math.max(0, stats.totalXP + amount);
    const levelInfo = getLevelInfo(totalXP);
    await db.xpTransactions.add({
      id: uuid('xp_'),
      sourceType,
      sourceId,
      amount,
      reason,
      createdAt: now(),
    });
    await db.userStats.put({
      ...stats,
      totalXP,
      currentLevel: levelInfo.level,
      currentRank: levelInfo.currentRank,
      coins: stats.coins + Math.max(0, Math.floor(amount / 10)),
      updatedAt: now(),
    });
  });
}

export async function updateStats(partial: Partial<UserStats>) {
  const stats = (await db.userStats.get('stats')) ?? makeStats();
  const levelInfo = getLevelInfo(stats.totalXP);
  await db.userStats.put({
    ...stats,
    ...partial,
    currentLevel: levelInfo.level,
    currentRank: levelInfo.currentRank,
    updatedAt: now(),
  });
}

export async function exportAllData(): Promise<BackupPayload> {
  const [
    habits,
    habitCompletions,
    timeEntries,
    categories,
    metricDefinitions,
    metricLogs,
    routines,
    routineLogs,
    achievements,
    xpTransactions,
    quests,
    settings,
    userProfile,
    userStats,
    reports,
    todoItems,
    timetableBlocks,
  ] = await Promise.all([
    db.habits.toArray(),
    db.habitCompletions.toArray(),
    db.timeEntries.toArray(),
    db.categories.toArray(),
    db.metricDefinitions.toArray(),
    db.metricLogs.toArray(),
    db.routines.toArray(),
    db.routineLogs.toArray(),
    db.achievements.toArray(),
    db.xpTransactions.toArray(),
    db.quests.toArray(),
    db.settings.toArray(),
    db.userProfile.toArray(),
    db.userStats.toArray(),
    db.reports.toArray(),
    db.todoItems.toArray(),
    db.timetableBlocks.toArray(),
  ]);

  return {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: now(),
    appVersion: APP_VERSION,
    habits,
    habitCompletions,
    timeEntries,
    categories,
    metricDefinitions,
    metricLogs,
    routines,
    routineLogs,
    achievements,
    xpTransactions,
    quests,
    settings,
    userProfile,
    userStats,
    reports,
    todoItems,
    timetableBlocks,
  };
}

export async function importBackup(payload: BackupPayload, mode: 'merge' | 'replace') {
  if (!payload || !payload.schemaVersion || payload.schemaVersion > SCHEMA_VERSION) {
    throw new Error('Unsupported or invalid LifeXP backup file.');
  }

  const tables = [
    db.habits,
    db.habitCompletions,
    db.timeEntries,
    db.categories,
    db.metricDefinitions,
    db.metricLogs,
    db.routines,
    db.routineLogs,
    db.achievements,
    db.xpTransactions,
    db.quests,
    db.settings,
    db.userProfile,
    db.userStats,
    db.reports,
    db.todoItems,
    db.timetableBlocks,
  ];

  await db.transaction('rw', tables, async () => {
    if (mode === 'replace') {
      await Promise.all(tables.map((table) => table.clear()));
    }
    await Promise.all([
      db.habits.bulkPut(payload.habits ?? []),
      db.habitCompletions.bulkPut(payload.habitCompletions ?? []),
      db.timeEntries.bulkPut(payload.timeEntries ?? []),
      db.categories.bulkPut(payload.categories ?? []),
      db.metricDefinitions.bulkPut(payload.metricDefinitions ?? []),
      db.metricLogs.bulkPut(payload.metricLogs ?? []),
      db.routines.bulkPut(payload.routines ?? []),
      db.routineLogs.bulkPut(payload.routineLogs ?? []),
      db.achievements.bulkPut(payload.achievements ?? []),
      db.xpTransactions.bulkPut(payload.xpTransactions ?? []),
      db.quests.bulkPut(payload.quests ?? []),
      db.settings.bulkPut(payload.settings ?? [makeSettings(true)]),
      db.userProfile.bulkPut(payload.userProfile ?? [makeProfile()]),
      db.userStats.bulkPut(payload.userStats ?? [makeStats()]),
      db.reports.bulkPut(payload.reports ?? []),
      db.todoItems.bulkPut(payload.todoItems ?? []),
      db.timetableBlocks.bulkPut(payload.timetableBlocks ?? []),
    ]);
  });
}
