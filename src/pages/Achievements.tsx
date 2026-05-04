import { Award } from 'lucide-react';
import { db } from '../db/lifexpDb';
import { useLifeData } from '../hooks/useLifeData';
import { Icon } from '../components/Icon';
import { useToast } from '../components/Toast';

export function Achievements() {
  const data = useLifeData();
  const toast = useToast();
  if (!data) return null;
  const unlocked = data.achievements.filter((achievement) => achievement.unlockedAt);

  const unlockDemo = async (id: string) => {
    await db.achievements.update(id, { unlockedAt: new Date().toISOString() });
    toast('Achievement unlocked.');
  };

  return (
    <main className="page-stack">
      <section className="panel achievement-hero">
        <Award size={44} />
        <div>
          <h2>Achievements</h2>
          <p>{unlocked.length} of {data.achievements.length} unlocked. Achievements reward tracking milestones without making perfection the point.</p>
        </div>
      </section>
      <section className="achievement-grid">
        {data.achievements.map((achievement) => (
          <article key={achievement.id} className={`achievement-card ${achievement.unlockedAt ? 'unlocked' : ''}`}>
            <span><Icon name={achievement.icon} size={24} /></span>
            <h3>{achievement.name}</h3>
            <p>{achievement.description}</p>
            <small>{achievement.xpReward} XP · {achievement.unlockedAt ? `Unlocked ${achievement.unlockedAt.slice(0, 10)}` : achievement.condition}</small>
            {!achievement.unlockedAt ? <button className="btn small ghost" onClick={() => unlockDemo(achievement.id)}>Unlock manually</button> : null}
          </article>
        ))}
      </section>
    </main>
  );
}
