import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart3, BookOpen, Brain, DatabaseBackup, Flame, Gauge,
  LineChart, ListChecks, Lock, Rocket, Sparkles, Timer, Trophy, Zap,
} from 'lucide-react';

const sections = [
  {
    icon: Gauge,
    title: 'What is LifeXP?',
    body: [
      'LifeXP is a privacy-first habit, time, planner, life metrics, and personal analytics tracker. The basic idea is simple: your real life already has quests, stats, streaks, bottlenecks, recovery days, and tiny wins. LifeXP gives you a clean place to see them.',
      'It is built for the serious stuff — research, writing, coding, finances, gym consistency, reading, routines, and focused work. It is also built for the ordinary but useful stuff: water, caffeine, sleep, mood, symptoms, weight, bathroom frequency, chores, screen time, and custom signals that only make sense to you.',
    ],
  },
  {
    icon: Sparkles,
    title: 'Why I built it',
    body: [
      'Most tracking apps ask real life to be neater than it is. Some only care about habits. Some only care about fitness. Some are great for time tracking but awkward for body metrics. Some are beautiful until you want to export your data.',
      'LifeXP exists because a useful life tracker should be honest about the mess. A day can include a research block, a workout, a rough mood dip, three cups of coffee, one surprisingly productive coding sprint, laundry, a budget check-in, and yes, a quick note that your body is doing body things. That all belongs in the same personal map.',
    ],
  },
  {
    icon: ListChecks,
    title: 'What you can track',
    body: [
      'You can track habits, to-do quests, daily timetable blocks, stopwatch sessions, Pomodoro sessions, focus sessions, routines, achievements, reports, and flexible metrics. The default setup includes research, writing, reading, coding, fitness, health, finances, chores, rest, learning, admin, and body metrics.',
      'The metric system is intentionally broad. Weight, poop frequency, sleep hours, bedtime, wake time, water intake, mood, energy, stress, focus, caffeine, alcohol, symptoms, medication, money spent, pages read, words written, coding hours, meditation, and custom metrics can all live side by side.',
    ],
  },
  {
    icon: Flame,
    title: 'How habit tracking works',
    body: [
      'Habits in LifeXP have categories, icons, colors, frequencies, targets, units, difficulty, XP rewards, notes, and status controls. You can complete a habit in one click, increment counts, add notes, skip kindly, pause, archive, or delete it.',
      'The point is not to create a perfect streak machine. The point is to make consistency visible. Streaks, completion rates, history, and trends help you see which habits are becoming part of your actual life and which ones need a smaller next step.',
    ],
  },
  {
    icon: ListChecks,
    title: 'How planner quests work',
    body: [
      'LifeXP includes a planner for to-dos and daily timetables. A to-do can have a priority, due date, checklist steps, category, and XP reward. A timetable block gives your day a shape: start time, end time, category, notes, and optional linked tasks.',
      'When you mark tasks or timetable blocks complete, you earn XP. If a block is not realistic anymore, you can skip it without turning the whole day into a guilt spiral. The goal is to make planning feel like a flexible quest log, not a courtroom transcript.',
    ],
  },
  {
    icon: Timer,
    title: 'How time tracking works',
    body: [
      'The time tracker supports manual entries, stopwatch sessions, Pomodoro-style sessions, focus mode, tags, notes, energy before and after, and focus scores. LifeXP also warns about overlapping entries so your time data stays believable.',
      'Time tracking is especially useful for questions like: How much research did I actually do this week? Am I spending enough time writing? Where did my evenings go? Do my coding sessions cluster around certain days? You do not need perfect data to get useful answers.',
    ],
  },
  {
    icon: LineChart,
    title: 'How life metrics work',
    body: [
      'Life metrics are flexible by design. Some metrics make sense once per day, like weight or sleep hours. Others make sense multiple times per day, like mood, symptoms, caffeine, water, or bathroom frequency. LifeXP supports event-style logs, daily summaries, or both.',
      'That means poop frequency can be tracked with a quick +1 each time or entered as a daily total. Water can be logged cup by cup. Mood can be checked throughout the day. Sleep can be compared with energy. The wording stays normal because this is private health and lifestyle data, not something to be weird about.',
    ],
  },
  {
    icon: Trophy,
    title: 'How XP and leveling work',
    body: [
      'LifeXP uses XP, levels, ranks, coins, quests, streaks, and achievements to make tracking more motivating. Completing habits, logging focused time, recording metrics, finishing planner quests, reviewing your day, generating reports, and backing up your data can all become small wins.',
      'The gamification is adjustable. You can turn off XP, sounds, confetti, or coins if you want a quieter analytics tool. The game layer is there to help momentum, not to boss you around.',
    ],
  },
  {
    icon: BarChart3,
    title: 'How analytics and reports work',
    body: [
      'Analytics are where the checkmarks turn into insight. LifeXP shows time by category, habit completion rates, XP over time, productivity heatmaps, metric trends, weekly comparisons, and summaries for things like sleep, mood, water, caffeine, weight, and bathroom frequency.',
      'The app is careful about wording. It should say a pattern appears associated with something, not that one thing magically caused another. Personal data is useful, but it should stay humble.',
    ],
  },
  {
    icon: DatabaseBackup,
    title: 'How to export and back up your data',
    body: [
      'LifeXP should never trap your data. The Backup page can export a full JSON backup with your schema version, app version, profile, settings, habits, completions, time entries, to-dos, timetable blocks, metrics, achievements, XP transactions, quests, and reports.',
      'You can also export individual CSV files for spreadsheet analysis. Imports show a preview before applying, support merge or replace mode, and create a safety backup before restore. If browser storage ever gets cleared, your backup is the lifeboat.',
    ],
  },
  {
    icon: Lock,
    title: 'Privacy and local storage',
    body: [
      'LifeXP has no remote backend and no real login. Your profile name and avatar are local only. Your data stays in IndexedDB inside your browser unless you intentionally export it.',
      'That privacy model has one important tradeoff: data does not automatically sync between devices. If you want to move from your laptop to your phone or another browser, export a backup and import it there.',
    ],
  },
  {
    icon: Brain,
    title: 'How to request features',
    body: [
      'LifeXP is built to grow with real use. The Feedback page links to GitHub Issues for feature requests, UX improvements, questions, known issues, and the roadmap. Good feature requests explain the workflow, the pain point, and what a better version would let you do.',
    ],
  },
  {
    icon: Rocket,
    title: 'Future plans',
    body: [
      'Future improvements could include richer recurring timetable rules, local notification reminders, stronger achievement automation, deeper correlation tools, custom dashboard layouts, more report templates, importers for common CSV formats, and optional encrypted sync if the project ever grows beyond local-only storage.',
      'For now, the priority is the core promise: track your life, understand your patterns, keep your data, and make tiny actions feel visible.',
    ],
  },
];

const featureChips: Array<{ label: string; icon: typeof Flame; color: string }> = [
  { label: 'Habits + Streaks', icon: Flame, color: '#f97316' },
  { label: 'Time Tracking', icon: Timer, color: '#06b6d4' },
  { label: 'Focus Mode', icon: Brain, color: '#6d5dfc' },
  { label: 'Life Metrics', icon: LineChart, color: '#22c55e' },
  { label: 'Planner Quests', icon: ListChecks, color: '#8b5cf6' },
  { label: 'Achievements', icon: Trophy, color: '#f59e0b' },
  { label: 'Analytics', icon: BarChart3, color: '#0ea5e9' },
  { label: 'Private Storage', icon: Lock, color: '#10b981' },
];

const stagger = { hidden: {}, show: { transition: { staggerChildren: .06 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 220, damping: 24 } },
};

export function Guide() {
  return (
    <main className="article-page">
      {/* Nav */}
      <nav className="landing-nav">
        <Link to="/" className="brand-block public">
          <span className="brand-mark">XP</span>
          <span>
            <strong>LifeXP</strong>
            <small>Track your life. Level it up.</small>
          </span>
        </Link>
        <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center' }}>
          <Link to="/feedback" style={{ color: 'var(--muted)', fontWeight: 800, fontSize: '.9rem' }}>Feedback</Link>
          <Link className="btn primary" to="/app"><Zap size={14} /> Launch LifeXP</Link>
        </div>
      </nav>

      <article>
        {/* Hero banner */}
        <motion.div
          className="guide-hero"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .5, type: 'spring', stiffness: 120 }}
        >
          <div className="guide-hero-orb" />
          <p className="micro guide-eyebrow">
            <BookOpen size={13} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '.35rem' }} />
            LifeXP guide
          </p>
          <h1 className="guide-h1">
            Why I Made LifeXP:<br />Tracking My Life So I Can Level It Up
          </h1>
          <p className="guide-lede">
            A privacy-first habit, time, planner, and life metrics tracker for people who want to understand
            where their days actually go — and make consistent improvement feel like a game worth playing.
          </p>
          <div className="guide-chips">
            {featureChips.map(({ label, icon: Icon, color }) => (
              <span key={label} className="guide-chip" style={{ '--chip-color': color } as React.CSSProperties}>
                <Icon size={13} />
                {label}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Lede paragraphs */}
        <p className="lede" style={{ marginBottom: '.85rem' }}>
          LifeXP was created to make personal tracking easier, more fun, and more honest. Tracking should produce insight,
          not just checkmarks, and motivation matters when real life gets noisy.
        </p>
        <p className="lede">
          Every section below covers a real part of how the app works — not a marketing pitch, just the mechanics
          behind the decisions.
        </p>

        {/* Content sections */}
        <motion.div variants={stagger} initial="hidden" animate="show">
          {sections.map((section, i) => {
            const SectionIcon = section.icon;
            return (
              <motion.section key={section.title} variants={fadeUp} className="guide-section">
                <div className="guide-section-header" style={{ marginTop: i === 0 ? '1.8rem' : '2.2rem' }}>
                  <div className="guide-section-icon">
                    <SectionIcon size={17} />
                  </div>
                  <h2>{section.title}</h2>
                </div>
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </motion.section>
            );
          })}
        </motion.div>

        {/* Closing CTA */}
        <motion.div
          className="guide-cta"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: .5 }}
        >
          <div>
            <p className="closing">Every tiny action counts. LifeXP helps you see them.</p>
            <p style={{ color: 'var(--muted)', fontSize: '.95rem', marginTop: '.35rem' }}>
              Start with one habit, one metric, or one focus session. The pattern builds itself.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
            <Link className="btn primary" to="/app"><Zap size={15} /> Launch LifeXP</Link>
            <Link className="btn ghost" to="/feedback">Give Feedback</Link>
          </div>
        </motion.div>
      </article>
    </main>
  );
}
