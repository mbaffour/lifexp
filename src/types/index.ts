export type ThemeName = 'light' | 'dark' | 'neon' | 'forest' | 'ocean' | 'sunset' | 'minimal';
export type WeekStart = 'sunday' | 'monday';
export type Units = 'imperial' | 'metric';
export type WeightUnit = 'lbs' | 'kg';
export type HabitDifficulty = 'easy' | 'medium' | 'hard' | 'heroic';
export type HabitStatus = 'active' | 'paused' | 'archived';
export type FrequencyType = 'daily' | 'weekly' | 'specificDays' | 'customInterval' | 'timesPerWeek';
export type MetricType = 'number' | 'boolean' | 'scale' | 'text' | 'select' | 'multi-select' | 'duration' | 'time' | 'rating';
export type GoalDirection = 'increase' | 'decrease' | 'maintain' | 'none';
export type MetricLogMode = 'event' | 'dailySummary' | 'both';
export type TimerMode = 'manual' | 'stopwatch' | 'pomodoro' | 'focus';
export type TodoPriority = 'low' | 'normal' | 'high' | 'urgent';
export type TodoStatus = 'open' | 'inProgress' | 'completed' | 'archived';
export type TimetableBlockStatus = 'planned' | 'completed' | 'skipped';

export interface UserProfile {
  id: string;
  displayName: string;
  avatar: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  xpMultiplier: number;
  createdAt: string;
  updatedAt: string;
}

export interface HabitFrequency {
  type: FrequencyType;
  days?: number[];
  intervalDays?: number;
  timesPerWeek?: number;
}

export interface Habit {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  frequency: HabitFrequency;
  targetCount: number;
  unit: string;
  difficulty: HabitDifficulty;
  xpReward: number;
  icon: string;
  color: string;
  status: HabitStatus;
  createdAt: string;
  updatedAt: string;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  date: string;
  completedAt?: string;
  count: number;
  notes: string;
  mood?: number;
  difficultyFelt?: HabitDifficulty;
  skipped?: boolean;
  xpEarned: number;
  createdAt: string;
}

export interface TimeEntry {
  id: string;
  title: string;
  categoryId: string;
  tags: string[];
  startTime: string;
  endTime: string;
  durationMinutes: number;
  timerMode: TimerMode;
  mode: TimerMode;
  notes: string;
  energyBefore?: number;
  energyAfter?: number;
  focusScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MetricDefinition {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  type: MetricType;
  unit: string;
  icon: string;
  color: string;
  targetMin?: number;
  targetMax?: number;
  goalDirection: GoalDirection;
  defaultValue?: string | number | boolean;
  quickLogEnabled: boolean;
  logMode: MetricLogMode;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export interface MetricLog {
  id: string;
  metricId: string;
  timestamp: string;
  date: string;
  value: string | number | boolean | string[];
  note: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Routine {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  icon: string;
  color: string;
  items: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RoutineLog {
  id: string;
  routineId: string;
  date: string;
  completedItems: string[];
  createdAt: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
  unlockedAt?: string;
  xpReward: number;
}

export interface XPTransaction {
  id: string;
  sourceType: string;
  sourceId: string;
  amount: number;
  reason: string;
  createdAt: string;
}

export interface Quest {
  id: string;
  type: 'daily' | 'weekly';
  title: string;
  description: string;
  xpReward: number;
  coinReward: number;
  status: 'open' | 'completed' | 'claimed';
  date: string;
  createdAt: string;
}

export interface TodoItem {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  dueDate?: string;
  scheduledDate?: string;
  priority: TodoPriority;
  status: TodoStatus;
  checklist: string[];
  completedChecklist: string[];
  tags: string[];
  xpReward: number;
  coinReward: number;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimetableBlock {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  date: string;
  startTime: string;
  endTime: string;
  todoIds: string[];
  repeat: 'none' | 'daily' | 'weekly' | 'weekdays';
  status: TimetableBlockStatus;
  xpReward: number;
  actualMinutes?: number;
  notes: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  id: 'settings';
  setupComplete: boolean;
  theme: ThemeName;
  accentColor: string;
  soundEnabled: boolean;
  confettiEnabled: boolean;
  xpEnabled: boolean;
  weekStartsOn: WeekStart;
  units: Units;
  weightUnit: WeightUnit;
  timeFormat: '12h' | '24h';
  dateFormat: 'MMM d, yyyy' | 'yyyy-MM-dd' | 'MM/dd/yyyy';
  backupReminderEnabled: boolean;
  lastBackupAt?: string;
  dailyResetTime: string;
  dashboardWidgets: string[];
}

export interface UserStats {
  id: 'stats';
  totalXP: number;
  currentLevel: number;
  currentRank: string;
  coins: number;
  gems: number;
  currentStreak: number;
  longestStreak: number;
  habitsCompleted: number;
  timeMinutesTracked: number;
  metricsLogged: number;
  achievementsUnlocked: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReportRecord {
  id: string;
  title: string;
  rangeStart: string;
  rangeEnd: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface BackupPayload {
  schemaVersion: number;
  exportedAt: string;
  appVersion: string;
  habits: Habit[];
  habitCompletions: HabitCompletion[];
  timeEntries: TimeEntry[];
  categories: Category[];
  metricDefinitions: MetricDefinition[];
  metricLogs: MetricLog[];
  routines: Routine[];
  routineLogs: RoutineLog[];
  achievements: Achievement[];
  xpTransactions: XPTransaction[];
  quests: Quest[];
  todoItems: TodoItem[];
  timetableBlocks: TimetableBlock[];
  settings: Settings[];
  userProfile: UserProfile[];
  userStats: UserStats[];
  reports: ReportRecord[];
}
