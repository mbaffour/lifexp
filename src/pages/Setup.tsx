import { initializeLifeXP } from '../db/lifexpDb';
import { useToast } from '../components/Toast';

export function Setup() {
  const toast = useToast();
  const start = async (mode: 'fresh' | 'demo') => {
    await initializeLifeXP(mode);
    toast(mode === 'demo' ? 'Demo data loaded. Go explore the dashboard.' : 'Fresh LifeXP vault created.');
  };

  return (
    <main className="setup-screen">
      <section className="setup-card">
        <span className="brand-mark large">XP</span>
        <h1>Welcome to LifeXP</h1>
        <p>
          Your data lives locally in this browser. Start clean, or load demo data to see how habits, time, metrics,
          reports, and XP work together.
        </p>
        <div className="setup-actions">
          <button className="btn primary" onClick={() => start('demo')}>Load demo data</button>
          <button className="btn ghost" onClick={() => start('fresh')}>Start fresh</button>
        </div>
      </section>
    </main>
  );
}
