import { Lock, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { db } from '../db/lifexpDb';
import { useLifeData } from '../hooks/useLifeData';
import { Icon } from '../components/Icon';
import { useToast } from '../components/Toast';

export function Achievements() {
  const data = useLifeData();
  const toast = useToast();
  if (!data) return null;
  const unlocked = data.achievements.filter((a) => a.unlockedAt);
  const locked = data.achievements.filter((a) => !a.unlockedAt);

  const unlockDemo = async (id: string) => {
    await db.achievements.update(id, { unlockedAt: new Date().toISOString() });
    toast('Achievement unlocked! +XP');
  };

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: .05 } },
  } as const;
  const item = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 240, damping: 22 } },
  };

  return (
    <main className="page-stack">
      {/* Hero */}
      <section className="panel achievement-hero" style={{
        background: 'linear-gradient(135deg, rgba(245,158,11,.10), rgba(251,191,36,.06), var(--surface))',
        borderColor: 'rgba(245,158,11,.28)',
      }}>
        <div style={{
          width: 62, height: 62, borderRadius: 14,
          background: 'linear-gradient(135deg, rgba(245,158,11,.22), rgba(251,191,36,.14))',
          border: '1px solid rgba(245,158,11,.38)',
          display: 'grid', placeItems: 'center',
          boxShadow: '0 0 24px rgba(245,158,11,.30)',
          flexShrink: 0,
        }}>
          <Trophy size={30} style={{ color: '#d97706' }} />
        </div>
        <div>
          <h2>Achievements</h2>
          <p style={{ color: 'var(--muted)', marginTop: '.35rem', lineHeight: 1.55 }}>
            {unlocked.length} of {data.achievements.length} unlocked.{' '}
            {unlocked.length > 0
              ? `${Math.round((unlocked.length / data.achievements.length) * 100)}% complete.`
              : 'Achievements reward tracking milestones without making perfection the point.'}
          </p>
        </div>
        {unlocked.length > 0 ? (
          <div style={{ marginLeft: 'auto', textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: '2rem', fontWeight: 950, lineHeight: 1 }}>
              {unlocked.reduce((s, a) => s + a.xpReward, 0).toLocaleString()}
            </div>
            <div style={{ color: 'var(--muted)', fontSize: '.78rem', fontWeight: 850 }}>XP earned</div>
          </div>
        ) : null}
      </section>

      {/* Unlocked */}
      {unlocked.length > 0 ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
            <h3 style={{ color: '#d97706' }}>Unlocked</h3>
            <span style={{
              background: 'rgba(245,158,11,.18)', color: '#d97706',
              border: '1px solid rgba(245,158,11,.30)',
              borderRadius: '6px', padding: '.2rem .55rem', fontSize: '.76rem', fontWeight: 900,
            }}>
              {unlocked.length}
            </span>
          </div>
          <motion.div className="achievement-grid" variants={container} initial="hidden" animate="show">
            {unlocked.map((achievement) => (
              <motion.article key={achievement.id} className="achievement-card unlocked" variants={item}>
                <div className="ach-icon">
                  <Icon name={achievement.icon} size={26} />
                </div>
                <h3>{achievement.name}</h3>
                <p>{achievement.description}</p>
                <small>
                  +{achievement.xpReward} XP · Unlocked {achievement.unlockedAt!.slice(0, 10)}
                </small>
              </motion.article>
            ))}
          </motion.div>
        </>
      ) : null}

      {/* Locked */}
      {locked.length > 0 ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginTop: '.4rem' }}>
            <h3 style={{ color: 'var(--muted)' }}>Locked</h3>
            <span style={{
              background: 'var(--surface-2)', color: 'var(--muted)',
              border: '1px solid var(--border)',
              borderRadius: '6px', padding: '.2rem .55rem', fontSize: '.76rem', fontWeight: 900,
            }}>
              {locked.length}
            </span>
          </div>
          <motion.div className="achievement-grid" variants={container} initial="hidden" animate="show">
            {locked.map((achievement) => (
              <motion.article key={achievement.id} className="achievement-card" variants={item}>
                <div className="ach-icon" style={{ position: 'relative' }}>
                  <Icon name={achievement.icon} size={26} />
                  <Lock size={12} style={{
                    position: 'absolute', bottom: -2, right: -2,
                    background: 'var(--surface-2)', borderRadius: '50%', padding: '1px',
                    color: 'var(--muted)',
                  }} />
                </div>
                <h3>{achievement.name}</h3>
                <p>{achievement.description}</p>
                <small>{achievement.xpReward} XP · {achievement.condition}</small>
                <button className="btn small ghost" onClick={() => unlockDemo(achievement.id)}>
                  Unlock manually
                </button>
              </motion.article>
            ))}
          </motion.div>
        </>
      ) : null}
    </main>
  );
}
