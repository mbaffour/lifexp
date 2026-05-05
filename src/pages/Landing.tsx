import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, Code2, DatabaseBackup, Flame, LineChart, ListChecks, Lock, Sparkles, Timer, Trophy, Zap } from 'lucide-react';

const featureCards: Array<[string, string, typeof Flame]> = [
  ['Gamified habits', 'Complete habits, earn XP, keep streaks, and make boring consistency feel visible.', Flame],
  ['Planner quests', 'Build a timetable, attach to-dos, check off steps, and earn XP for following the plan.', ListChecks],
  ['Time tracking', 'Run timers, Pomodoros, focus sessions, manual entries, tags, and category summaries.', Timer],
  ['Life metrics', 'Track sleep, mood, water, caffeine, symptoms, weight, poop frequency, money, and custom data.', LineChart],
  ['Private storage', 'No accounts. No backend. Your data stays in IndexedDB until you export it.', Lock],
  ['Analytics', 'Charts, heatmaps, insights, weekly comparisons, and report-friendly summaries.', BarChart3],
  ['Portable data', 'Export JSON backups and CSVs so LifeXP never traps your history.', DatabaseBackup],
];

const chartHeights = [38, 70, 48, 86, 64, 92, 74];

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
          <a href="https://github.com/mbaffour/lifexp" target="_blank" rel="noreferrer">GitHub</a>
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
            <Link className="btn primary" to="/app">
              <Zap size={16} /> Launch LifeXP
            </Link>
            <Link className="btn ghost" to="/guide">Read the Guide</Link>
          </div>
          <div className="hero-links">
            <Link to="/feedback">Report a Bug</Link>
            <Link to="/feedback">Request a Feature</Link>
            <a href="https://github.com/mbaffour/lifexp" target="_blank" rel="noreferrer">
              <Code2 size={15} /> View on GitHub
            </a>
          </div>
        </div>

        {/* Animated preview card */}
        <motion.div
          className="hero-dashboard"
          initial={{ opacity: 0, y: 28, rotateX: 6 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: .6, type: 'spring', stiffness: 80 }}
        >
          {/* Header row */}
          <div className="hero-dash-header">
            <span className="avatar">🧭</span>
            <div>
              <strong style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                <span style={{
                  width: 22, height: 22, borderRadius: '50%', fontSize: '.72rem', fontWeight: 950,
                  background: 'linear-gradient(135deg,var(--accent),var(--accent-2))',
                  color: 'white', display: 'grid', placeItems: 'center', flexShrink: 0,
                }}>12</span>
                Optimizer
              </strong>
              <small>Every tiny action counts.</small>
            </div>
            <span className="coin"><Zap size={11} style={{ display: 'inline', verticalAlign: '-1px' }} /> 240 coins</span>
          </div>

          {/* XP bar */}
          <div className="hero-xp">
            <span style={{ width: '68%' }} />
          </div>

          {/* Stats grid */}
          <div className="hero-grid">
            <div>
              <Flame size={16} />
              <strong>9-day streak</strong>
              <span>Reading is your strongest quest.</span>
            </div>
            <div>
              <Timer size={16} />
              <strong>3h 20m</strong>
              <span>Research and coding today.</span>
            </div>
            <div>
              <LineChart size={16} />
              <strong>7 metrics</strong>
              <span>Sleep, mood, water, weight, poop.</span>
            </div>
            <div>
              <Trophy size={16} />
              <strong>42 XP today</strong>
              <span>No zero day already protected.</span>
            </div>
          </div>

          {/* Mini chart */}
          <div className="mini-chart">
            {chartHeights.map((height, i) => (
              <motion.span
                key={i}
                style={{ height: `${height}%` }}
                initial={{ scaleY: 0, originY: 1 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: .4 + i * .07, duration: .4, type: 'spring', stiffness: 200 }}
              />
            ))}
          </div>
        </motion.div>
      </section>

      <section className="section-band">
        <div className="section-heading">
          <Sparkles size={26} style={{ color: 'var(--accent)' }} />
          <h2>Built for messy, measurable real life</h2>
          <p>
            Research, gym consistency, reading, coding, to-do quests, timetable blocks, chores, finances, sleep, energy,
            caffeine, symptoms, and yes, tasteful body metrics.
          </p>
        </div>
        <div className="feature-grid">
          {featureCards.map(([title, copy, FeatureIcon]) => (
            <article key={String(title)} className="feature-card">
              <FeatureIcon size={22} style={{ color: 'var(--accent)' }} />
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="privacy-section">
        <div style={{ display: 'grid', gap: '.5rem' }}>
          <h2>Private by default. Exportable by design.</h2>
          <p>
            LifeXP runs entirely in your browser with IndexedDB. There is no remote backend, no account requirement, and no analytics pipeline
            collecting your personal logs. Export a full JSON backup or CSVs whenever you want.
          </p>
        </div>
        <Link className="btn primary" to="/app/backup" style={{ whiteSpace: 'nowrap' }}>
          Open Backup Tools
        </Link>
      </section>
    </main>
  );
}
