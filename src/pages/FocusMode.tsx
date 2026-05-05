import { useEffect, useRef, useState } from 'react';
import { Bell, BellOff, Coffee, Play, RotateCcw, Square, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { db, addXP, updateStats, uuid } from '../db/lifexpDb';
import { useLifeData } from '../hooks/useLifeData';
import { useToast } from '../components/Toast';
import { playCompletionChime, playBeep, vibrateDevice } from '../utils/sounds';

export function FocusMode() {
  const data = useLifeData();
  const toast = useToast();

  const [minutes, setMinutes] = useState(25);
  const [secs, setSecs] = useState(0);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [title, setTitle] = useState('Deep focus');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const totalSeconds = useRef(25 * 60);
  const halfAlerted = useRef(false);

  /* Recompute total when inputs change (only when not running) */
  const setDuration = (m: number, s: number) => {
    if (running) return;
    setMinutes(m);
    setSecs(s);
    const total = m * 60 + s;
    totalSeconds.current = total;
    setRemaining(total);
    halfAlerted.current = false;
  };

  useEffect(() => {
    if (!running) return undefined;

    const timer = window.setInterval(() => {
      setRemaining((v) => {
        /* Half-way beep */
        if (soundEnabled && !halfAlerted.current && v <= Math.floor(totalSeconds.current / 2)) {
          halfAlerted.current = true;
          playBeep(440, 0.12);
        }

        if (v <= 1) {
          window.clearInterval(timer);
          if (soundEnabled) {
            playCompletionChime();
            vibrateDevice();
          }
          window.queueMicrotask(() => {
            setRunning(false);
            toast('🎉 Focus block complete! Nice work.');
          });
          return 0;
        }
        return v - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [running, soundEnabled, toast]);

  if (!data) return null;
  const categoryId = data.categories.find((c) => c.name === 'Research')?.id ?? data.categories[0]?.id ?? '';
  const progress = totalSeconds.current > 0 ? ((totalSeconds.current - remaining) / totalSeconds.current) * 100 : 0;
  const elapsedMinutes = Math.floor((totalSeconds.current - remaining) / 60);

  const start = () => {
    const total = minutes * 60 + secs;
    if (total <= 0) return toast('Set a duration first.', 'warning');
    if (soundEnabled) playBeep(523, 0.1);
    totalSeconds.current = total;
    halfAlerted.current = false;
    setStartedAt(new Date().toISOString());
    setRemaining(total);
    setRunning(true);
  };

  const pause = () => {
    if (!running) return;
    if (soundEnabled) playBeep(440, 0.1);
    setRunning(false);
  };

  const reset = () => {
    setRunning(false);
    const total = minutes * 60 + secs;
    totalSeconds.current = total;
    halfAlerted.current = false;
    setRemaining(total);
  };

  const complete = async () => {
    const durationMinutes = Math.max(1, Math.round((totalSeconds.current - remaining) / 60));
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
    reset();
    toast(`Focus session saved. +${xpEarned} XP`);
  };

  const isAtStart = remaining === totalSeconds.current;

  return (
    <main className="focus-page">
      <motion.section
        className="panel focus-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .4 }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.6rem', marginBottom: '.3rem' }}>
            <h2 style={{ margin: 0 }}>Focus Mode</h2>
            <button
              onClick={() => setSoundEnabled((e) => !e)}
              className="icon-btn"
              title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
              style={{ width: 32, height: 32 }}
            >
              {soundEnabled ? <Bell size={15} /> : <BellOff size={15} />}
            </button>
          </div>
          <p style={{ color: 'var(--muted)', fontSize: '.9rem', lineHeight: 1.55 }}>
            Sounds {soundEnabled ? 'on' : 'off'} · Vibration on completion · Beep at halfway
          </p>
        </div>

        {/* Session title */}
        <label style={{ width: '100%', maxWidth: 340 }}>
          Session title
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Deep focus" />
        </label>

        {/* Ring */}
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
              {running
                ? remaining === 0 ? '✅ Complete!' : '🧠 Stay with it'
                : isAtStart ? 'Ready when you are'
                : 'Paused'}
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

        {/* Duration config — minutes + seconds + break */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '.75rem', width: '100%' }}>
          <label>
            Focus min
            <input
              type="number"
              min="0"
              max="180"
              value={minutes}
              disabled={running}
              onChange={(e) => setDuration(Math.max(0, Number(e.target.value)), secs)}
            />
          </label>
          <label>
            Seconds
            <input
              type="number"
              min="0"
              max="59"
              value={secs}
              disabled={running}
              onChange={(e) => setDuration(minutes, Math.min(59, Math.max(0, Number(e.target.value))))}
            />
          </label>
          <label>
            Break min
            <input
              type="number"
              min="1"
              max="60"
              value={breakMinutes}
              onChange={(e) => setBreakMinutes(Number(e.target.value))}
            />
          </label>
        </div>

        {/* Quick presets */}
        <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { label: '5m', m: 5, s: 0 },
            { label: '10m', m: 10, s: 0 },
            { label: '25m', m: 25, s: 0 },
            { label: '45m', m: 45, s: 0 },
            { label: '1h', m: 60, s: 0 },
            { label: '90m', m: 90, s: 0 },
          ].map(({ label, m, s }) => (
            <button
              key={label}
              className="btn small ghost"
              disabled={running}
              onClick={() => setDuration(m, s)}
              style={{ opacity: running ? .5 : 1 }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="timer-actions">
          <motion.button
            className="btn primary"
            onClick={start}
            whileTap={{ scale: .97 }}
            disabled={running}
            style={{ opacity: running ? .5 : 1 }}
          >
            <Play size={15} /> Start
          </motion.button>
          <button className="btn ghost" onClick={pause} disabled={!running} style={{ opacity: !running ? .5 : 1 }}>
            <Coffee size={15} /> Pause
          </button>
          <button className="btn ghost" onClick={reset}>
            <RotateCcw size={15} /> Reset
          </button>
          <button className="btn danger" onClick={complete} disabled={isAtStart && !running} style={{ opacity: isAtStart && !running ? .5 : 1 }}>
            <Square size={15} /> Save session
          </button>
        </div>
      </motion.section>
    </main>
  );
}

function format(totalSec: number) {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = Math.floor(totalSec % 60);
  if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
}

function pad(n: number) { return String(n).padStart(2, '0'); }
