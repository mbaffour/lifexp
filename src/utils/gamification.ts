export const ranks = [
  'Newcomer',
  'Initiate',
  'Builder',
  'Tracker',
  'Strategist',
  'Optimizer',
  'Champion',
  'Master',
  'Legend',
  'Life Architect',
];

export function xpForLevel(level: number) {
  if (level <= 1) return 0;
  return Math.round(75 * Math.pow(level, 1.55) + (level - 1) * 35);
}

export function getLevelInfo(totalXP: number) {
  let level = 1;
  while (xpForLevel(level + 1) <= totalXP) level += 1;
  const currentFloor = xpForLevel(level);
  const nextLevelXP = xpForLevel(level + 1);
  const progress = ((totalXP - currentFloor) / (nextLevelXP - currentFloor)) * 100;
  const currentRank = ranks[Math.min(ranks.length - 1, Math.floor((level - 1) / 4))];
  return {
    level,
    currentLevel: level,
    currentRank,
    currentFloor,
    nextLevelXP,
    progress: Math.max(0, Math.min(100, progress)),
  };
}

export function difficultyMultiplier(difficulty: string) {
  return { easy: 1, medium: 1.25, hard: 1.55, heroic: 2 }[difficulty] ?? 1;
}

export function friendlyInsight(value: number, noun: string) {
  if (value <= 0) return `No ${noun} yet. Tiny action, quick log, done.`;
  if (value < 3) return `You have ${value} ${noun}. A small streak is forming.`;
  return `${value} ${noun} logged. The pattern is starting to show.`;
}
