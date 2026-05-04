import { motion } from 'framer-motion';
import { getLevelInfo } from '../utils/gamification';

export function XPBar({ totalXP }: { totalXP: number }) {
  const level = getLevelInfo(totalXP);
  return (
    <div className="xp-card" aria-label={`Level ${level.level}, ${Math.round(level.progress)} percent to next level`}>
      <div className="xp-meta">
        <span>Level {level.level}</span>
        <strong>{totalXP.toLocaleString()} XP</strong>
      </div>
      <div className="xp-track">
        <motion.div
          className="xp-fill"
          initial={{ width: 0 }}
          animate={{ width: `${level.progress}%` }}
          transition={{ type: 'spring', stiffness: 90, damping: 18 }}
        />
      </div>
      <div className="xp-meta muted">
        <span>{level.currentRank}</span>
        <span>{Math.max(0, level.nextLevelXP - totalXP)} XP to next level</span>
      </div>
    </div>
  );
}
