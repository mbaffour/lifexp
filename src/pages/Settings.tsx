import { Save } from 'lucide-react';
import { db } from '../db/lifexpDb';
import { useLifeData } from '../hooks/useLifeData';
import { useToast } from '../components/Toast';
import type { Settings as SettingsRecord, ThemeName, Units, WeekStart, WeightUnit } from '../types';

const themes: Array<{
  id: ThemeName;
  label: string;
  bg: string;
  surface: string;
  accent: string;
  text: string;
  badge?: string;
}> = [
  { id: 'light',   label: 'Light',   bg: '#f5f7fb', surface: '#fff',    accent: '#6d5dfc', text: '#0f1623' },
  { id: 'day',     label: 'Day',     bg: '#eef5ff', surface: '#fff',    accent: '#0061d9', text: '#071830', badge: 'New' },
  { id: 'dark',    label: 'Dark',    bg: '#090d17', surface: '#111827', accent: '#6d5dfc', text: '#eef2ff' },
  { id: 'night',   label: 'Night',   bg: '#06080f', surface: '#0c1020', accent: '#818cf8', text: '#dce6ff', badge: 'New' },
  { id: 'neon',    label: 'Neon',    bg: '#05080f', surface: '#0b1120', accent: '#00d4ff', text: '#e4ecff' },
  { id: 'ambient', label: 'Ambient', bg: '#120d08', surface: '#1c1409', accent: '#f5a623', text: '#f5e8d0', badge: 'New' },
  { id: 'forest',  label: 'Forest',  bg: '#f0f7ee', surface: '#fff',    accent: '#1a7d52', text: '#0f2116' },
  { id: 'ocean',   label: 'Ocean',   bg: '#edf7ff', surface: '#fff',    accent: '#0277c2', text: '#0a1e30' },
  { id: 'sunset',  label: 'Sunset',  bg: '#fff5ec', surface: '#fff',    accent: '#d9520a', text: '#1e0e06' },
  { id: 'minimal', label: 'Minimal', bg: '#f9f9f9', surface: '#fff',    accent: '#1a1a1e', text: '#141416' },
];

export function Settings() {
  const data = useLifeData();
  const toast = useToast();
  if (!data?.settings || !data.profile) return null;

  const updateSetting = async <K extends keyof SettingsRecord>(key: K, value: SettingsRecord[K]) => {
    await db.settings.update('settings', { [key]: value } as Partial<SettingsRecord>);
    if (key === 'theme') document.documentElement.dataset.theme = String(value);
    if (key === 'accentColor') document.documentElement.style.setProperty('--accent', String(value));
  };

  const updateProfile = async (key: string, value: string) => {
    await db.userProfile.update('local_profile', { [key]: value, updatedAt: new Date().toISOString() });
  };

  return (
    <main className="page-grid">

      {/* Profile */}
      <section className="panel">
        <div className="panel-title"><div><h2>Settings</h2><p>Profile, themes, gamification, and preferences.</p></div></div>
        <div className="settings-stack">
          <label>Display name<input value={data.profile.displayName} onChange={(e) => updateProfile('displayName', e.target.value)} /></label>
          <label>Avatar / emoji<input value={data.profile.avatar} onChange={(e) => updateProfile('avatar', e.target.value)} /></label>
          <label>Accent color<input type="color" value={data.settings.accentColor} onChange={(e) => updateSetting('accentColor', e.target.value)} /></label>
          <label>Daily reset time<input type="time" value={data.settings.dailyResetTime} onChange={(e) => updateSetting('dailyResetTime', e.target.value)} /></label>
        </div>
      </section>

      {/* Preferences */}
      <section className="panel">
        <div className="panel-title"><div><h3>Preferences</h3><p>Gamification is fully adjustable.</p></div></div>
        <div className="toggle-list">
          <Toggle label="XP system" checked={data.settings.xpEnabled} onChange={(v) => updateSetting('xpEnabled', v)} />
          <Toggle label="Sound effects" checked={data.settings.soundEnabled} onChange={(v) => updateSetting('soundEnabled', v)} />
          <Toggle label="Confetti" checked={data.settings.confettiEnabled} onChange={(v) => updateSetting('confettiEnabled', v)} />
          <Toggle label="Backup reminder" checked={data.settings.backupReminderEnabled} onChange={(v) => updateSetting('backupReminderEnabled', v)} />
        </div>
        <div className="settings-stack" style={{ marginTop: '1rem' }}>
          <label>Week starts on
            <select value={data.settings.weekStartsOn} onChange={(e) => updateSetting('weekStartsOn', e.target.value as WeekStart)}>
              <option value="sunday">Sunday</option>
              <option value="monday">Monday</option>
            </select>
          </label>
          <label>Units
            <select value={data.settings.units} onChange={(e) => updateSetting('units', e.target.value as Units)}>
              <option value="imperial">Imperial</option>
              <option value="metric">Metric</option>
            </select>
          </label>
          <label>Weight unit
            <select value={data.settings.weightUnit} onChange={(e) => updateSetting('weightUnit', e.target.value as WeightUnit)}>
              <option value="lbs">lbs</option>
              <option value="kg">kg</option>
            </select>
          </label>
          <label>Time format
            <select value={data.settings.timeFormat} onChange={(e) => updateSetting('timeFormat', e.target.value as '12h' | '24h')}>
              <option value="12h">12h</option>
              <option value="24h">24h</option>
            </select>
          </label>
        </div>
      </section>

      {/* Theme picker — full-width */}
      <section className="panel span-2">
        <div className="panel-title">
          <div>
            <h3>Theme</h3>
            <p>Choose your vibe. Night, Ambient, and Day are new.</p>
          </div>
        </div>
        <div className="theme-grid">
          {themes.map((theme) => {
            const active = data.settings!.theme === theme.id;
            return (
              <button
                key={theme.id}
                className={`theme-card ${active ? 'active' : ''}`}
                onClick={() => updateSetting('theme', theme.id)}
                title={`Switch to ${theme.label} theme`}
                style={{ '--theme-bg': theme.bg, '--theme-surface': theme.surface, '--theme-accent': theme.accent, '--theme-text': theme.text } as React.CSSProperties}
              >
                {/* Mini preview */}
                <div className="theme-preview">
                  <div className="tp-sidebar">
                    <div className="tp-brand" />
                    <div className="tp-nav-item" />
                    <div className="tp-nav-item" />
                    <div className="tp-nav-item active" />
                    <div className="tp-nav-item" />
                  </div>
                  <div className="tp-main">
                    <div className="tp-bar" />
                    <div className="tp-card" />
                    <div className="tp-card narrow" />
                  </div>
                </div>
                <div className="theme-label">
                  {theme.label}
                  {theme.badge ? (
                    <span className="theme-badge">{theme.badge}</span>
                  ) : null}
                  {active ? <span className="theme-check">✓</span> : null}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Categories */}
      <section className="panel span-2">
        <div className="panel-title">
          <div><h3>Manage categories</h3><p>Category colors power charts, cards, and balance scores.</p></div>
          <button className="btn small ghost" onClick={() => toast('Category manager UI is on the roadmap.', 'info')}><Save size={15} /> Save</button>
        </div>
        <div className="category-manager">
          {data.categories.map((category) => (
            <article key={category.id}>
              <span className="color-dot" style={{ background: category.color }} />
              <strong>{category.name}</strong>
              <small>{category.description}</small>
            </article>
          ))}
        </div>
      </section>

      {/* Privacy note */}
      <section className="panel span-2">
        <div className="privacy-note">
          <strong>Privacy note</strong>
          <p>LifeXP has no remote backend and no real login. Your profile name, avatar, habits, timers, body metrics, reports, and backups stay in this browser unless you intentionally export them.</p>
        </div>
      </section>

    </main>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="toggle">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}
