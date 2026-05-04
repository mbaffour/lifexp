import { Save } from 'lucide-react';
import { db } from '../db/lifexpDb';
import { useLifeData } from '../hooks/useLifeData';
import { useToast } from '../components/Toast';
import type { Settings as SettingsRecord, ThemeName, Units, WeekStart, WeightUnit } from '../types';

const themes: ThemeName[] = ['light', 'dark', 'neon', 'forest', 'ocean', 'sunset', 'minimal'];

export function Settings() {
  const data = useLifeData();
  const toast = useToast();
  if (!data?.settings || !data.profile) return null;

  const updateSetting = async <K extends keyof SettingsRecord>(key: K, value: SettingsRecord[K]) => {
    await db.settings.update('settings', { [key]: value } as Partial<SettingsRecord>);
    if (key === 'theme') document.documentElement.dataset.theme = String(value);
  };

  const updateProfile = async (key: string, value: string) => {
    await db.userProfile.update('local_profile', { [key]: value, updatedAt: new Date().toISOString() });
  };

  return (
    <main className="page-grid">
      <section className="panel">
        <div className="panel-title"><div><h2>Settings</h2><p>Local profile, themes, gamification, units, categories, and safety controls.</p></div></div>
        <div className="settings-stack">
          <label>Display name<input value={data.profile.displayName} onChange={(e) => updateProfile('displayName', e.target.value)} /></label>
          <label>Avatar/icon<input value={data.profile.avatar} onChange={(e) => updateProfile('avatar', e.target.value)} /></label>
          <label>Theme<select value={data.settings.theme} onChange={(e) => updateSetting('theme', e.target.value as ThemeName)}>{themes.map((theme) => <option key={theme}>{theme}</option>)}</select></label>
          <label>Accent color<input type="color" value={data.settings.accentColor} onChange={(e) => updateSetting('accentColor', e.target.value)} /></label>
          <label>Daily reset time<input type="time" value={data.settings.dailyResetTime} onChange={(e) => updateSetting('dailyResetTime', e.target.value)} /></label>
        </div>
      </section>

      <section className="panel">
        <div className="panel-title"><div><h3>Preferences</h3><p>Gamification is adjustable.</p></div></div>
        <div className="toggle-list">
          <Toggle label="XP system" checked={data.settings.xpEnabled} onChange={(value) => updateSetting('xpEnabled', value)} />
          <Toggle label="Sound effects" checked={data.settings.soundEnabled} onChange={(value) => updateSetting('soundEnabled', value)} />
          <Toggle label="Confetti" checked={data.settings.confettiEnabled} onChange={(value) => updateSetting('confettiEnabled', value)} />
          <Toggle label="Backup reminder" checked={data.settings.backupReminderEnabled} onChange={(value) => updateSetting('backupReminderEnabled', value)} />
        </div>
        <div className="settings-stack">
          <label>Week starts on<select value={data.settings.weekStartsOn} onChange={(e) => updateSetting('weekStartsOn', e.target.value as WeekStart)}><option value="sunday">Sunday</option><option value="monday">Monday</option></select></label>
          <label>Units<select value={data.settings.units} onChange={(e) => updateSetting('units', e.target.value as Units)}><option value="imperial">Imperial</option><option value="metric">Metric</option></select></label>
          <label>Weight unit<select value={data.settings.weightUnit} onChange={(e) => updateSetting('weightUnit', e.target.value as WeightUnit)}><option value="lbs">lbs</option><option value="kg">kg</option></select></label>
          <label>Time format<select value={data.settings.timeFormat} onChange={(e) => updateSetting('timeFormat', e.target.value as '12h' | '24h')}><option value="12h">12h</option><option value="24h">24h</option></select></label>
        </div>
      </section>

      <section className="panel span-2">
        <div className="panel-title"><div><h3>Manage categories</h3><p>Category colors power charts, cards, and balance scores.</p></div><button className="btn small ghost" onClick={() => toast('Category manager is editable in the database-backed tables; custom UI refinements are on the roadmap.', 'info')}><Save size={16} /> Save</button></div>
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

      <section className="panel span-2">
        <div className="privacy-note">
          <strong>Privacy note</strong>
          <p>LifeXP has no remote backend and no real login. Your profile name, avatar, habits, timers, body metrics, reports, and backups stay in this browser unless you intentionally export them.</p>
        </div>
      </section>
    </main>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="toggle"><span>{label}</span><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} /></label>;
}
