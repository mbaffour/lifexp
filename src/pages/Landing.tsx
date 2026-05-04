import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, Code2, DatabaseBackup, Flame, LineChart, ListChecks, Lock, Sparkles, Timer, Trophy } from 'lucide-react';

const featureCards: Array<[string, string, typeof Flame]> = [
  ['Gamified habits', 'Complete habits, earn XP, keep streaks, and make boring consistency feel visible.', Flame],
  ['Planner quests', 'Build a timetable, attach to-dos, check off steps, and earn XP for following the plan.', ListChecks],
  ['Time tracking', 'Run timers, Pomodoros, focus sessions, manual entries, tags, and category summaries.', Timer],
  ['Life metrics', 'Track sleep, mood, water, caffeine, symptoms, weight, poop frequency, money, and custom data.', LineChart],
  ['Private storage', 'No accounts. No backend. Your data stays in IndexedDB until you export it.', Lock],
  ['Analytics', 'Charts, heatmaps, insights, weekly comparisons, and report-friendly summaries.', BarChart3],
  ['Portable data', 'Export JSON backups and CSVs so LifeXP never traps your history.', DatabaseBackup],
];

export function Landing() {
  return (
    <main className="landing">
      <header className="landing-nav">
        <Link to="/" className="brand-block public">
          <span className="brand-mark">XP</span>
          <span>
            <strong>LifeXP</strong>
            <small>Track your life. Level it up.</small>
          </span>
        </Link>
        <nav>
          <Link to="/guide">Guide</Link>
          <Link to="/feedback">Feedback</Link>
          <a href="https://github.com/YOUR_USERNAME/lifexp" target="_blank" rel="noreferrer">GitHub</a>
        </nav>
      </header>

      <section className="hero-section">
        <div className="hero-copy">
          <h1>LifeXP</h1>
          <p className="tagline">Track your life. Level it up.</p>
          <p>
            A private, local-first RPG dashboard for habits, to-dos, timetables, focus sessions, body and lifestyle metrics, goals, reports,
            and the strangely useful little data points that make real life easier to understand.
          </p>
          <div className="hero-actions">
            <Link className="btn primary" to="/app">Launch LifeXP</Link>
            <Link className="btn ghost" to="/guide">Read the Guide</Link>
          </div>
          <div className="hero-links">
            <Link to="/feedback">Report a Bug</Link>
            <Link to="/feedback">Request a Feature</Link>
            <a href="https://github.com/YOUR_USERNAME/lifexp" target="_blank" rel="noreferrer">
              <Code2 size={16} /> View on GitHub
            </a>
          </div>
        </div>
        <motion.div className="hero-dashboard" initial={{ opacity: 0, y: 24, rotateX: 8 }} animate={{ opacity: 1, y: 0, rotateX: 0 }}>
          <div className="hero-dash-header">
            <span className="avatar">🧭</span>
            <div>
              <strong>Level 12 Optimizer</strong>
              <small>Every tiny action counts.</small>
            </div>
            <span className="coin">240 coins</span>
          </div>
          <div className="hero-xp"><span style={{ width: '68%' }} /></div>
          <div className="hero-grid">
            <div><Flame /><strong>9 day streak</strong><span>Reading is your strongest quest.</span></div>
            <div><Timer /><strong>3h 20m</strong><span>Research and coding today.</span></div>
            <div><LineChart /><strong>7 metrics</strong><span>Sleep, mood, water, weight, poop.</span></div>
            <div><Trophy /><strong>42 XP</strong><span>No zero day already protected.</span></div>
          </div>
          <div className="mini-chart">
            {[38, 70, 48, 86, 64, 92, 74].map((height, index) => <span key={index} style={{ height: `${height}%` }} />)}
          </div>
        </motion.div>
      </section>

      <section className="section-band">
        <div className="section-heading">
          <Sparkles size={28} />
          <h2>Built for messy, measurable real life</h2>
          <p>Research, gym consistency, reading, coding, to-do quests, timetable blocks, chores, finances, sleep, energy, caffeine, symptoms, and yes, tasteful body metrics.</p>
        </div>
        <div className="feature-grid">
          {featureCards.map(([title, copy, Icon]) => (
            <article key={String(title)} className="feature-card">
              <Icon size={22} />
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="privacy-section">
        <div>
          <h2>Private by default. Exportable by design.</h2>
          <p>
            LifeXP runs entirely in your browser with IndexedDB. There is no remote backend, no account requirement, and no analytics pipeline
            collecting your personal logs. Export a full JSON backup or CSVs whenever you want.
          </p>
        </div>
        <Link className="btn primary" to="/app/backup">Open Backup Tools</Link>
      </section>
    </main>
  );
}
