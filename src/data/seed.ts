import type {
  Achievement,
  Category,
  Habit,
  MetricDefinition,
  Quest,
  Routine,
  Settings,
  TimetableBlock,
  TodoItem,
  UserProfile,
  UserStats,
} from '../types';

const now = () => new Date().toISOString();
export const id = (prefix = '') => `${prefix}${crypto.randomUUID()}`;

const categorySeed: Array<[string, string, string, string]> = [
  ['Research', 'Deep research sessions, papers, and literature review.', 'Microscope', '#6d5dfc'],
  ['Lab Work', 'Bench work, experiments, protocols, and analysis.', 'FlaskConical', '#14b8a6'],
  ['Writing', 'Manuscripts, notes, outlines, and reflections.', 'PenLine', '#f97316'],
  ['Reading', 'Books, papers, newsletters, and study.', 'BookOpen', '#06b6d4'],
  ['Coding', 'Programming, data work, debugging, and builds.', 'Code2', '#8b5cf6'],
  ['Fitness', 'Training, movement, mobility, and walks.', 'Dumbbell', '#ef4444'],
  ['Health', 'Care tasks, symptoms, medication, and recovery.', 'HeartPulse', '#ec4899'],
  ['Body Metrics', 'Private body and lifestyle metrics.', 'Activity', '#f59e0b'],
  ['Finance', 'Money, spending, saving, bills, and planning.', 'WalletCards', '#22c55e'],
  ['Relationship', 'Partner time and relationship maintenance.', 'Heart', '#fb7185'],
  ['Family', 'Calls, visits, errands, and support.', 'UsersRound', '#0ea5e9'],
  ['Chores', 'House tasks, admin cleanup, and errands.', 'Home', '#84cc16'],
  ['Creativity', 'Music, art, ideas, and side quests.', 'Sparkles', '#d946ef'],
  ['Rest', 'Sleep, breaks, leisure, and recovery.', 'Moon', '#64748b'],
  ['Social', 'Friends, community, messages, and events.', 'MessagesSquare', '#38bdf8'],
  ['Learning', 'Courses, practice, skills, and flashcards.', 'GraduationCap', '#a855f7'],
  ['Errands', 'Shopping, appointments, and life logistics.', 'MapPin', '#f43f5e'],
  ['Admin', 'Planning, email, files, and calendar work.', 'ClipboardList', '#475569'],
  ['Custom', 'Anything else worth measuring.', 'PlusCircle', '#10b981'],
];

export const makeCategories = (): Category[] =>
  categorySeed.map(([name, description, icon, color]) => ({
    id: id('cat_'),
    name,
    description,
    icon,
    color,
    xpMultiplier: 1,
    createdAt: now(),
    updatedAt: now(),
  }));

const categoryId = (categories: Category[], name: string) =>
  categories.find((category) => category.name === name)?.id ?? categories[0].id;

export const makeDefaultHabits = (categories: Category[]): Habit[] =>
  [
    ['Read papers', 'Read or annotate research papers.', 'Research', 'BookOpen', '#6d5dfc', 'medium', 35, 'pages'],
    ['Write', 'Move a draft, note, or outline forward.', 'Writing', 'PenLine', '#f97316', 'hard', 45, 'minutes'],
    ['Exercise', 'Move with intent: lift, walk, stretch, or train.', 'Fitness', 'Dumbbell', '#ef4444', 'medium', 40, 'minutes'],
    ['Drink water', 'Keep hydration visible.', 'Health', 'Droplets', '#06b6d4', 'easy', 15, 'cups'],
    ['Sleep on time', 'Protect tomorrow by winding down tonight.', 'Rest', 'Moon', '#64748b', 'medium', 30, 'times'],
    ['Code', 'Practice, build, debug, or ship.', 'Coding', 'Code2', '#8b5cf6', 'hard', 50, 'minutes'],
    ['Plan tomorrow', 'Write a short plan for the next day.', 'Admin', 'CalendarCheck', '#475569', 'easy', 20, 'times'],
    ['Clean room', 'Reset one physical space.', 'Chores', 'Home', '#84cc16', 'easy', 20, 'times'],
    ['Call family', 'Send a message, call, or check in.', 'Family', 'Phone', '#0ea5e9', 'easy', 20, 'times'],
    ['Save money', 'Log or make one financial improvement.', 'Finance', 'PiggyBank', '#22c55e', 'medium', 30, 'dollars'],
    ['Reflect/journal', 'Capture how the day actually felt.', 'Writing', 'NotebookPen', '#f97316', 'easy', 25, 'entries'],
  ].map(([name, description, category, icon, color, difficulty, xpReward, unit]) => ({
    id: id('habit_'),
    name: String(name),
    description: String(description),
    categoryId: categoryId(categories, String(category)),
    frequency: { type: 'daily' },
    targetCount: String(unit) === 'cups' ? 8 : 1,
    unit: String(unit),
    difficulty: difficulty as Habit['difficulty'],
    xpReward: Number(xpReward),
    icon: String(icon),
    color: String(color),
    status: 'active',
    createdAt: now(),
    updatedAt: now(),
  }));

export const makeMetricDefinitions = (categories: Category[]): MetricDefinition[] =>
  [
    ['Weight', 'Body weight trend.', 'Body Metrics', 'number', 'lbs', 'Scale', '#f59e0b', 'maintain', 'dailySummary'],
    ['Poop frequency', 'A normal private body metric: tap +1 or enter a daily total.', 'Body Metrics', 'number', 'times', 'SmilePlus', '#a16207', 'none', 'both'],
    ['Sleep hours', 'Hours slept last night.', 'Rest', 'number', 'hours', 'Moon', '#64748b', 'maintain', 'dailySummary'],
    ['Mood', 'How the day or moment feels.', 'Health', 'scale', '/10', 'Smile', '#ec4899', 'increase', 'both'],
    ['Energy', 'Subjective energy rating.', 'Health', 'scale', '/10', 'BatteryCharging', '#22c55e', 'increase', 'both'],
    ['Stress', 'Stress level.', 'Health', 'scale', '/10', 'Zap', '#ef4444', 'decrease', 'both'],
    ['Water intake', 'Cups or bottles of water.', 'Health', 'number', 'cups', 'Droplets', '#06b6d4', 'increase', 'both'],
    ['Caffeine', 'Coffee, tea, or caffeine amount.', 'Health', 'number', 'mg', 'Coffee', '#92400e', 'none', 'both'],
    ['Workout', 'Training volume or session count.', 'Fitness', 'number', 'sessions', 'Dumbbell', '#ef4444', 'increase', 'both'],
    ['Screen time', 'Personal screen time estimate.', 'Admin', 'number', 'hours', 'Monitor', '#475569', 'decrease', 'dailySummary'],
    ['Money spent', 'Spending snapshot.', 'Finance', 'number', 'dollars', 'WalletCards', '#22c55e', 'decrease', 'both'],
    ['Pages read', 'Reading progress.', 'Reading', 'number', 'pages', 'BookOpen', '#06b6d4', 'increase', 'dailySummary'],
    ['Words written', 'Writing output.', 'Writing', 'number', 'words', 'Keyboard', '#f97316', 'increase', 'dailySummary'],
    ['Coding time', 'Coding hours from manual metric logs.', 'Coding', 'duration', 'minutes', 'Code2', '#8b5cf6', 'increase', 'dailySummary'],
  ].map(([name, description, category, type, unit, icon, color, goalDirection, logMode]) => ({
    id: id('metric_'),
    name: String(name),
    description: String(description),
    categoryId: categoryId(categories, String(category)),
    type: type as MetricDefinition['type'],
    unit: String(unit),
    icon: String(icon),
    color: String(color),
    goalDirection: goalDirection as MetricDefinition['goalDirection'],
    quickLogEnabled: true,
    logMode: logMode as MetricDefinition['logMode'],
    createdAt: now(),
    updatedAt: now(),
    archived: false,
  }));

export const makeRoutines = (categories: Category[]): Routine[] =>
  [
    ['Morning routine', 'A simple launch sequence.', 'Health', 'Sun', '#f59e0b', ['Water', 'Light movement', 'Review priorities']],
    ['Night routine', 'A calmer landing sequence.', 'Rest', 'Moon', '#64748b', ['Screen cutoff', 'Plan tomorrow', 'Journal']],
    ['Gym day', 'Training prep and follow-through.', 'Fitness', 'Dumbbell', '#ef4444', ['Warm up', 'Lift', 'Log workout']],
    ['Lab day', 'Keep lab work organized.', 'Lab Work', 'FlaskConical', '#14b8a6', ['Check protocol', 'Run experiment', 'Record notes']],
    ['Writing day', 'Protect the page.', 'Writing', 'PenLine', '#f97316', ['Outline', 'Draft', 'Review']],
    ['Sunday reset', 'Weekly review and reset.', 'Admin', 'CalendarCheck', '#475569', ['Review week', 'Clean inbox', 'Backup LifeXP']],
  ].map(([name, description, category, icon, color, items]) => ({
    id: id('routine_'),
    name: String(name),
    description: String(description),
    categoryId: categoryId(categories, String(category)),
    icon: String(icon),
    color: String(color),
    items: items as string[],
    createdAt: now(),
    updatedAt: now(),
  }));

export const makeAchievements = (): Achievement[] =>
  [
    ['First Habit Completed', 'Complete your first habit.', 'BadgeCheck', 'habit_completed_1', 25],
    ['First Timer Session', 'Track your first block of time.', 'Timer', 'time_entry_1', 25],
    ['First Metric Logged', 'Log your first life metric.', 'LineChart', 'metric_log_1', 25],
    ['First Poop Logged', 'Log a very normal body metric.', 'SmilePlus', 'poop_log_1', 25],
    ['7-Day Streak', 'Show up for seven days.', 'Flame', 'streak_7', 100],
    ['30-Day Streak', 'Build a serious streak.', 'FlameKindling', 'streak_30', 350],
    ['100 Habit Completions', 'Complete 100 habits.', 'Trophy', 'habit_completed_100', 300],
    ['10 Hours Tracked', 'Track 10 hours of time.', 'Hourglass', 'time_600', 150],
    ['100 Hours Tracked', 'Track 100 hours of time.', 'Clock3', 'time_6000', 500],
    ['Fitness Warrior', 'Keep fitness visible.', 'Dumbbell', 'fitness_10', 150],
    ['Research Beast', 'Track sustained research.', 'Microscope', 'research_10', 150],
    ['Coding Sprint', 'Track five coding sessions.', 'Code2', 'coding_5', 120],
    ['Sleep Scientist', 'Log sleep seven times.', 'Moon', 'sleep_7', 120],
    ['Hydration Hero', 'Log water seven times.', 'Droplets', 'water_7', 120],
    ['Weight Tracker', 'Log weight five times.', 'Scale', 'weight_5', 100],
    ['Body Data Beginner', 'Log body metrics five times.', 'Activity', 'body_5', 100],
    ['No Zero Day', 'Log any meaningful action today.', 'Sparkles', 'no_zero_day', 40],
    ['Sunday Planner', 'Plan on a Sunday.', 'CalendarCheck', 'sunday_plan', 50],
    ['Backup Boss', 'Export your first backup.', 'Download', 'backup_1', 80],
    ['Export Expert', 'Export CSV or JSON data.', 'FileDown', 'export_1', 80],
    ['Comeback Kid', 'Return after a missed day.', 'RotateCcw', 'comeback', 80],
  ].map(([name, description, icon, condition, xpReward]) => ({
    id: id('ach_'),
    name: String(name),
    description: String(description),
    icon: String(icon),
    condition: String(condition),
    xpReward: Number(xpReward),
  }));

export const makeQuests = (): Quest[] => {
  const date = new Date().toISOString().slice(0, 10);
  return [
    ['daily', 'Complete 3 habits', 'Tiny wins stack fast.', 75, 12],
    ['daily', 'Track 1 hour of focused time', 'Give your attention a home.', 80, 15],
    ['daily', 'Log 3 metrics', 'Collect clues from real life.', 60, 10],
    ['daily', 'Review your day', 'A short reflection counts.', 45, 8],
    ['weekly', 'Track time on 5 days', 'Build an honest time map.', 250, 40],
    ['weekly', 'Generate a weekly report', 'Turn checkmarks into insight.', 200, 35],
  ].map(([type, title, description, xpReward, coinReward]) => ({
    id: id('quest_'),
    type: type as Quest['type'],
    title: String(title),
    description: String(description),
    xpReward: Number(xpReward),
    coinReward: Number(coinReward),
    status: 'open',
    date,
    createdAt: now(),
  }));
};

export const makeTodoItems = (categories: Category[]): TodoItem[] => {
  const date = new Date().toISOString().slice(0, 10);
  return [
    ['Draft research outline', 'Turn the next paper section into a rough outline.', 'Research', 'high', 40, ['Open notes', 'Write 5 bullets', 'Pick next source']],
    ['Plan tomorrow', 'Choose the three most important actions for tomorrow.', 'Admin', 'normal', 25, ['Review calendar', 'Pick top 3']],
    ['Laundry reset', 'Start, dry, and put away one laundry load.', 'Chores', 'normal', 20, ['Wash', 'Dry', 'Put away']],
    ['Budget check-in', 'Review spending and update the month snapshot.', 'Finance', 'normal', 30, ['Review transactions', 'Update notes']],
    ['Gym bag ready', 'Prep clothes, bottle, and headphones.', 'Fitness', 'low', 15, ['Pack bag', 'Fill water']],
  ].map(([title, description, category, priority, xpReward, checklist]) => ({
    id: id('todo_'),
    title: String(title),
    description: String(description),
    categoryId: categoryId(categories, String(category)),
    dueDate: date,
    scheduledDate: date,
    priority: priority as TodoItem['priority'],
    status: 'open',
    checklist: checklist as string[],
    completedChecklist: [],
    tags: [],
    xpReward: Number(xpReward),
    coinReward: Math.max(1, Math.floor(Number(xpReward) / 10)),
    createdAt: now(),
    updatedAt: now(),
  }));
};

export const makeTimetableBlocks = (categories: Category[], todos: TodoItem[] = []): TimetableBlock[] => {
  const date = new Date().toISOString().slice(0, 10);
  return [
    ['Deep research block', 'Read and annotate one paper.', 'Research', '09:00', '10:30', 45, todos[0]?.id ? [todos[0].id] : []],
    ['Workout window', 'Lift, walk, or mobility session.', 'Fitness', '12:30', '13:15', 35, []],
    ['Admin reset', 'Clean up inbox, plan, and log data.', 'Admin', '17:00', '17:30', 25, todos[1]?.id ? [todos[1].id] : []],
  ].map(([title, description, category, startTime, endTime, xpReward, todoIds]) => ({
    id: id('block_'),
    title: String(title),
    description: String(description),
    categoryId: categoryId(categories, String(category)),
    date,
    startTime: String(startTime),
    endTime: String(endTime),
    todoIds: todoIds as string[],
    repeat: 'none',
    status: 'planned',
    xpReward: Number(xpReward),
    notes: '',
    createdAt: now(),
    updatedAt: now(),
  }));
};

export const makeSettings = (setupComplete = false): Settings => ({
  id: 'settings',
  setupComplete,
  theme: 'light',
  accentColor: '#6d5dfc',
  soundEnabled: false,
  confettiEnabled: true,
  xpEnabled: true,
  weekStartsOn: 'sunday',
  units: 'imperial',
  weightUnit: 'lbs',
  timeFormat: '12h',
  dateFormat: 'MMM d, yyyy',
  backupReminderEnabled: true,
  dailyResetTime: '04:00',
  dashboardWidgets: ['habits', 'time', 'metrics', 'planner', 'quests', 'insights'],
});

export const makeProfile = (): UserProfile => ({
  id: 'local_profile',
  displayName: 'Life Adventurer',
  avatar: '🧭',
  createdAt: now(),
  updatedAt: now(),
});

export const makeStats = (): UserStats => ({
  id: 'stats',
  totalXP: 0,
  currentLevel: 1,
  currentRank: 'Newcomer',
  coins: 0,
  gems: 0,
  currentStreak: 0,
  longestStreak: 0,
  habitsCompleted: 0,
  timeMinutesTracked: 0,
  metricsLogged: 0,
  achievementsUnlocked: 0,
  createdAt: now(),
  updatedAt: now(),
});
