import { useEffect, useState } from 'react';
import { Coffee, Play, RotateCcw, Square } from 'lucide-react';
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
      setRemaining((value) => {
        if (value <= 1) {
          window.clearInterval(timer);
          window.queueMicrotask(() => {
            setRunning(false);
            toast('Focus block complete. Nice work.');
          });
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running, toast]);

  if (!data) return null;
  const categoryId = data.categories.find((category) => category.name === 'Research')?.id ?? data.categories[0]?.id ?? '';
  const progress = 100 - (remaining / (minutes * 60)) * 100;

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
    await addXP(Math.max(10, durationMinutes), 'focus', id, `Completed ${title}`);
    await updateStats({ timeMinutesTracked: (data.stats?.timeMinutesTracked ?? 0) + durationMinutes });
    setRunning(false);
    setRemaining(minutes * 60);
    toast(`Focus session saved. +${Math.max(10, durationMinutes)} XP`);
  };

  return (
    <main className="focus-page">
      <section className="panel focus-card">
        <div>
          <h2>Focus Mode</h2>
          <p>Custom focus blocks with calm pressure, break planning, and XP when the session is saved.</p>
        </div>
        <label>Session title<input value={title} onChange={(e) => setTitle(e.target.value)} /></label>
        <div className="focus-ring" style={{ background: `conic-gradient(var(--accent) ${progress}%, var(--border) ${progress}% 100%)` }}>
          <div>
            <strong>{format(remaining)}</strong>
            <span>{running ? 'Stay with it' : 'Ready when you are'}</span>
          </div>
        </div>
        <div className="settings-row">
          <label>Focus minutes<input type="number" min="1" value={minutes} onChange={(e) => { const next = Number(e.target.value); setMinutes(next); setRemaining(next * 60); }} /></label>
          <label>Break minutes<input type="number" min="1" value={breakMinutes} onChange={(e) => setBreakMinutes(Number(e.target.value))} /></label>
        </div>
        <div className="timer-actions">
          <button className="btn primary" onClick={start}><Play size={16} /> Start</button>
          <button className="btn ghost" onClick={() => setRunning(false)}><Coffee size={16} /> Pause</button>
          <button className="btn ghost" onClick={() => { setRunning(false); setRemaining(minutes * 60); }}><RotateCcw size={16} /> Reset</button>
          <button className="btn danger" onClick={complete}><Square size={16} /> Save session</button>
        </div>
      </section>
    </main>
  );
}

function format(seconds: number) {
  return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
}
