import { motion } from 'framer-motion';
import { getLevelInfo } from '../utils/gamification';

export function XPBar({ totalXP }: { totalXP: number }) {
  const info = getLevelInfo(totalXP);
  return (
    <div className="xp-card" aria-label={`Level ${info.level} ${info.currentRank}, ${Math.round(info.progress)}% to next level`}>
      <div className="xp-level-row">
        <div className="level-badge" title={`Level ${info.level}`}>
          {info.level}
        </div>
        <div className="xp-info">
          <div className="xp-meta">
            <span className="rank-text">{info.currentRank}</span>
            <span className="xp-total">{totalXP.toLocaleString()} XP</span>
          </div>
          <div className="xp-track">
            <motion.div
              className="xp-fill"
              initial={{ width: 0 }}
              animate={{ width: `${info.progress}%` }}
              transition={{ type: 'spring', stiffness: 80, damping: 18 }}
            />
          </div>
          <div className="xp-meta muted">
            <span>{Math.round(info.progress)}% to Level {info.level + 1}</span>
            <span>{Math.max(0, info.nextLevelXP - totalXP).toLocaleString()} XP left</span>
          </div>
        </div>
      </div>
    </div>
  );
}
