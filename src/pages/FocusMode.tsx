import { useEffect, useState } from 'react';
import { Coffee, Play, RotateCcw, Square, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { db, addXP, updateStats, uuid } from '../db/lifexpDb';
import { useLifeData } from '../hooks/useLifeData';
import { useToast } from '../components/Toast';

export function FocusMode() {
  const data = useLifeData();
  const toast = useToast();
  const [minutes, setMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [title, setTitle] = useState('Deep focus');

  useEffect(() => {
    if (!running) return undefined;
    const timer = window.setInterval(() => {
      setRemaining((v) => {
        if (v <= 1) {
          window.clearInterval(timer);
          window.queueMicrotask(() => {
            setRunning(false);
            toast('Focus block complete. Nice work.');
          });
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running, toast]);

  if (!data) return null;
  const categoryId = data.categories.find((c) => c.name === 'Research')?.id ?? data.categories[0]?.id ?? '';
  const progress = 100 - (remaining / (minutes * 60)) * 100;
  const elapsedMinutes = Math.floor((minutes * 60 - remaining) / 60);

  const start = () => {
    setStartedAt(new Date().toISOString());
    setRemaining(minutes * 60);
    setRunning(true);
  };

  const complete = async () => {
    const durationMinutes = Math.max(1, Math.round((minutes * 60 - remaining) / 60));
    const startTime = startedAt ?? new Date(Date.now() - durationMinutes * 60000).toISOString();
    const id = uuid('time_');
    await db.timeEntries.add({
      id,
      title,
      categoryId,
      tags: ['focus'],
      startTime,
      endTime: new Date().toISOString(),
      durationMinutes,
      timerMode: 'focus',
      mode: 'focus',
      notes: `Focus score: 8/10. Break target: ${breakMinutes} min.`,
      focusScore: 8,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    const xpEarned = Math.max(10, durationMinutes);
    await addXP(xpEarned, 'focus', id, `Completed ${title}`);
    await updateStats({ timeMinutesTracked: (data.stats?.timeMinutesTracked ?? 0) + durationMinutes });
    setRunning(false);
    setRemaining(minutes * 60);
    toast(`Focus session saved. +${xpEarned} XP`);
  };

  return (
    <main className="focus-page">
      <motion.section
        className="panel focus-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .4 }}
      >
        <div style={{ textAlign: 'center' }}>
          <h2>Focus Mode</h2>
          <p style={{ color: 'var(--muted)', marginTop: '.4rem', lineHeight: 1.55 }}>
            Custom focus blocks with calm pressure, break planning, and XP on save.
          </p>
        </div>

        <label style={{ width: '100%', maxWidth: 320 }}>
          Session title
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Deep focus" />
        </label>

        <div
          className={`focus-ring ${running ? 'active' : ''}`}
          style={{
            background: `conic-gradient(var(--accent) ${progress}%, color-mix(in srgb, var(--border) 80%, transparent) ${progress}% 100%)`,
          }}
          aria-label={`${format(remaining)} remaining`}
        >
          <div>
            <strong className="timer-display" style={{ fontSize: 'clamp(2.8rem,9vw,5.2rem)' }}>
              {format(remaining)}
            </strong>
            <p style={{ color: 'var(--muted)', fontSize: '.88rem', marginTop: '.4rem' }}>
              {running ? '🧠 Stay with it' : remaining === minutes * 60 ? 'Ready when you are' : 'Paused'}
            </p>
            {running && elapsedMinutes > 0 ? (
              <p style={{
                color: 'var(--accent)', fontSize: '.78rem', fontWeight: 900, marginTop: '.25rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.3rem',
              }}>
                <Zap size={12} /> +{elapsedMinutes} XP so far
              </p>
            ) : null}
          </div>
        </div>

        <div className="settings-row">
          <label>
            Focus minutes
            <input
              type="number"
              min="1"
              value={minutes}
              onChange={(e) => { const n = Number(e.target.value); setMinutes(n); if (!running) setRemaining(n * 60); }}
            />
          </label>
          <label>
            Break minutes
            <input type="number" min="1" value={breakMinutes} onChange={(e) => setBreakMinutes(Number(e.target.value))} />
          </label>
        </div>

        <div className="timer-actions">
          <motion.button
            className="btn primary"
            onClick={start}
            whileTap={{ scale: .97 }}
            disabled={running}
            style={{ opacity: running ? .6 : 1 }}
          >
            <Play size={15} /> Start
          </motion.button>
          <button className="btn ghost" onClick={() => setRunning(false)} disabled={!running}>
            <Coffee size={15} /> Pause
          </button>
          <button className="btn ghost" onClick={() => { setRunning(false); setRemaining(minutes * 60); }}>
            <RotateCcw size={15} /> Reset
          </button>
          <button className="btn danger" onClick={complete}>
            <Square size={15} /> Save session
          </button>
        </div>
      </motion.section>
    </main>
  );
}

function format(seconds: number) {
  return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
}
