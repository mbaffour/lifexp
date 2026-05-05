import { useEffect, useState, type FormEvent } from 'react';
import { Copy, Pause, Play, Plus, Square, Trash2 } from 'lucide-react';
import { db, addXP, updateStats, uuid } from '../db/lifexpDb';
import { useLifeData } from '../hooks/useLifeData';
import { useToast } from '../components/Toast';
import { categoryColor, sumTimeByCategory } from '../utils/analytics';
import { prettyDate, prettyTime } from '../utils/dates';
import type { TimerMode } from '../types';

export function TimeTracker() {
  const data = useLifeData();
  const toast = useToast();
  const [active, setActive] = useState<{ id: string; title: string; categoryId: string; start: string; elapsed: number; running: boolean; mode: TimerMode } | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [manual, setManual] = useState({ title: '', categoryId: '', date: new Date().toISOString().slice(0, 10), minutes: 30, tags: '', notes: '' });

  useEffect(() => {
    const interval = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  if (!data) return null;
  const categoryId = manual.categoryId || data.categories[0]?.id || '';
  const elapsed = active ? active.elapsed + (active.running ? Math.floor((nowMs - new Date(active.start).getTime()) / 1000) : 0) : 0;
  const categoryTotals = sumTimeByCategory(data.timeEntries.slice(0, 200), data.categories);

  const startTimer = (mode: TimerMode = 'stopwatch') => {
    if (active) return toast('A timer is already active. Stop or pause it first.', 'warning');
    setActive({ id: uuid('timer_'), title: manual.title || (mode === 'pomodoro' ? 'Pomodoro focus' : 'Focus session'), categoryId, start: new Date().toISOString(), elapsed: 0, running: true, mode });
    toast(`${mode === 'pomodoro' ? 'Pomodoro' : 'Timer'} started.`);
  };

  const stopTimer = async () => {
    if (!active) return;
    const end = new Date();
    const durationMinutes = Math.max(1, Math.round(elapsed / 60));
    await saveEntry({
      title: active.title,
      categoryId: active.categoryId,
      startTime: active.start,
      endTime: end.toISOString(),
      durationMinutes,
      mode: active.mode,
      tags: active.mode === 'pomodoro' ? ['pomodoro'] : ['timer'],
      notes: '',
    });
    setActive(null);
  };

  const saveManual = async (event: FormEvent) => {
    event.preventDefault();
    const start = new Date(`${manual.date}T09:00:00`);
    const end = new Date(start.getTime() + Number(manual.minutes) * 60000);
    await saveEntry({
      title: manual.title || 'Manual entry',
      categoryId,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      durationMinutes: Number(manual.minutes),
      mode: 'manual',
      tags: manual.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      notes: manual.notes,
    });
    setManual((current) => ({ ...current, title: '', notes: '', tags: '' }));
  };

  const saveEntry = async (entry: { title: string; categoryId: string; startTime: string; endTime: string; durationMinutes: number; mode: TimerMode; tags: string[]; notes: string }) => {
    const overlaps = data.timeEntries.some((existing) => new Date(entry.startTime) < new Date(existing.endTime) && new Date(entry.endTime) > new Date(existing.startTime));
    if (overlaps) toast('Heads up: this overlaps an existing entry.', 'warning');
    const id = uuid('time_');
    await db.timeEntries.add({
      id,
      title: entry.title,
      categoryId: entry.categoryId,
      tags: entry.tags,
      startTime: entry.startTime,
      endTime: entry.endTime,
      durationMinutes: entry.durationMinutes,
      timerMode: entry.mode,
      mode: entry.mode,
      notes: entry.notes,
      focusScore: entry.mode === 'manual' ? undefined : 8,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await addXP(Math.max(5, Math.round(entry.durationMinutes / 5)), 'time', id, `Tracked ${entry.title}`);
    await updateStats({ timeMinutesTracked: (data.stats?.timeMinutesTracked ?? 0) + entry.durationMinutes });
    toast(`Saved ${entry.durationMinutes} minutes.`);
  };

  const duplicate = async (id: string) => {
    const entry = data.timeEntries.find((item) => item.id === id);
    if (!entry) return;
    await db.timeEntries.add({ ...entry, id: uuid('time_'), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    toast('Time entry duplicated.');
  };

  return (
    <main className="page-stack">
      <section className="panel timer-panel">
        <div>
          <h2>Time Tracker</h2>
          <p>Track focused work, rest, chores, admin, and everything between. Overlaps are detected before saving.</p>
        </div>
        <div className="timer-display" aria-live="polite">{formatElapsed(elapsed)}</div>
        <div className="timer-actions">
          <button className="btn primary" onClick={() => startTimer('stopwatch')}><Play size={16} /> Start timer</button>
          <button className="btn ghost" onClick={() => startTimer('pomodoro')}><Play size={16} /> Pomodoro</button>
          <button className="btn ghost" onClick={() => active && setActive({ ...active, running: !active.running, elapsed })}><Pause size={16} /> {active?.running ? 'Pause' : 'Resume'}</button>
          <button className="btn danger" onClick={stopTimer}><Square size={16} /> Stop</button>
        </div>
      </section>

      <section className="panel">
        <div className="panel-title"><div><h3>Manual time entry</h3><p>Add, edit, duplicate, or delete sessions.</p></div></div>
        <form className="form-grid" onSubmit={saveManual}>
          <label>Title<input value={manual.title} onChange={(e) => setManual({ ...manual, title: e.target.value })} placeholder="Research block" /></label>
          <label>Category<select value={categoryId} onChange={(e) => setManual({ ...manual, categoryId: e.target.value })}>{data.categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}</select></label>
          <label>Date<input type="date" value={manual.date} onChange={(e) => setManual({ ...manual, date: e.target.value })} /></label>
          <label>Minutes<input type="number" min="1" value={manual.minutes} onChange={(e) => setManual({ ...manual, minutes: Number(e.target.value) })} /></label>
          <label>Tags<input value={manual.tags} onChange={(e) => setManual({ ...manual, tags: e.target.value })} placeholder="deep-work, writing" /></label>
          <label>Notes<input value={manual.notes} onChange={(e) => setManual({ ...manual, notes: e.target.value })} placeholder="Optional note" /></label>
          <button className="btn primary"><Plus size={16} /> Save entry</button>
        </form>
      </section>

      <section className="panel">
        <div className="panel-title"><div><h3>Recent entries</h3><p>Daily, weekly, and monthly summaries start here.</p></div></div>
        <div className="timeline-list">
          {data.timeEntries.slice(0, 30).map((entry) => (
            <article key={entry.id} className="card-row">
              <span className="color-dot" style={{ background: categoryColor(data.categories, entry.categoryId) }} />
              <div>
                <strong>{entry.title}</strong>
                <small>{prettyDate(entry.startTime)} · {prettyTime(entry.startTime)}-{prettyTime(entry.endTime)} · {entry.durationMinutes} min · {entry.tags.join(', ')}</small>
              </div>
              <div className="row-actions">
                <button className="icon-btn" onClick={() => duplicate(entry.id)} title="Duplicate"><Copy size={17} /></button>
                <button
                  className="icon-btn danger"
                  title="Delete"
                  onClick={async () => {
                    await db.timeEntries.delete(entry.id);
                    toast('Time entry deleted.', 'info', {
                      label: 'Undo',
                      onClick: async () => { await db.timeEntries.add(entry); },
                    });
                  }}
                ><Trash2 size={17} /></button>
              </div>
            </article>
          ))}
          {!data.timeEntries.length ? <div className="empty-state">No tracked time yet. Start with 10 honest minutes.</div> : null}
        </div>
      </section>

      <section className="panel">
        <div className="panel-title"><div><h3>Category summary</h3><p>Top tracked areas across recent entries.</p></div></div>
        <div className="summary-bars">
          {categoryTotals.slice(0, 8).map((item) => (
            <div key={item.id}>
              <span>{item.name}</span>
              <div><span style={{ width: `${Math.min(100, (item.minutes / Math.max(1, categoryTotals[0]?.minutes ?? 1)) * 100)}%`, background: item.color }} /></div>
              <strong>{item.hours}h</strong>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function formatElapsed(seconds: number) {
  const hours = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}:${secs}`;
}
