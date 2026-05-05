import { Link } from 'react-router-dom';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CalendarCheck, FileText, Flame, ListChecks, NotebookPen, Plus, Sparkles, Star, Timer, Trophy, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { db, addXP, updateStats, undoLastAction, uuid } from '../db/lifexpDb';
import { useLifeData } from '../hooks/useLifeData';
import { getLevelInfo } from '../utils/gamification';
import { StatCard } from '../components/StatCard';
import { XPBar } from '../components/XPBar';
import { Icon } from '../components/Icon';
import { useToast } from '../components/Toast';
import { compareThisWeekLastWeek, dailySeries, sumTimeByCategory } from '../utils/analytics';
import { todayKey } from '../utils/dates';

export function Dashboard() {
  const data = useLifeData();
  const toast = useToast();
  if (!data?.settings?.setupComplete || !data.stats) return null;

  const today = todayKey();
  const todayCompletions = data.habitCompletions.filter((c) => c.date === today && !c.skipped);
  const todayTime = data.timeEntries.filter((e) => e.startTime.slice(0, 10) === today);
  const todayMetrics = data.metricLogs.filter((l) => l.date === today);
  const todayTodos = data.todoItems.filter((t) => t.dueDate === today || t.scheduledDate === today);
  const completedTodos = data.todoItems.filter((t) => t.completedAt?.slice(0, 10) === today);
  const todayBlocks = data.timetableBlocks.filter((b) => b.date === today).sort((a, b) => a.startTime.localeCompare(b.startTime));
  const completedBlocks = todayBlocks.filter((b) => b.status === 'completed');
  const dueHabits = data.habits.filter((h) => h.status === 'active').slice(0, 8);
  const series = dailySeries(7, data.xpTransactions, data.habitCompletions, data.timeEntries, data.metricLogs);
  const byCategory = sumTimeByCategory(todayTime, data.categories);
  const xpToday = data.xpTransactions.filter((x) => x.createdAt.slice(0, 10) === today).reduce((s, x) => s + x.amount, 0);
  const levelInfo = getLevelInfo(data.stats.totalXP);
  const noZero = todayCompletions.length + todayTime.length + todayMetrics.length + completedTodos.length + completedBlocks.length > 0;

  const completeHabit = async (habitId: string) => {
    const habit = data.habits.find((h) => h.id === habitId);
    if (!habit) return;
    const duplicate = await db.habitCompletions.where({ habitId, date: today }).first();
    if (duplicate && !window.confirm('Already logged today. Add another?')) return;
    await db.habitCompletions.add({
      id: uuid('hc_'),
      habitId,
      date: today,
      completedAt: new Date().toISOString(),
      count: habit.targetCount,
      notes: '',
      xpEarned: habit.xpReward,
      createdAt: new Date().toISOString(),
    });
    await addXP(habit.xpReward, 'habit', habitId, `Completed ${habit.name}`);
    await updateStats({ habitsCompleted: (data.stats?.habitsCompleted ?? 0) + 1 });
    toast(`+${habit.xpReward} XP — ${habit.name} complete!`, 'success', {
      label: 'Undo',
      onClick: async () => { await undoLastAction(); },
    });
  };

  const quickLogMetric = async () => {
    const metric = data.metricDefinitions.find((m) => m.quickLogEnabled && m.name === 'Water intake') ?? data.metricDefinitions[0];
    if (!metric) return;
    await db.metricLogs.add({
      id: uuid('ml_'),
      metricId: metric.id,
      timestamp: new Date().toISOString(),
      date: today,
      value: metric.name === 'Water intake' ? 1 : Number(metric.defaultValue ?? 1),
      note: 'Quick logged from dashboard',
      tags: ['quick-log'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await addXP(8, 'metric', metric.id, `Logged ${metric.name}`);
    await updateStats({ metricsLogged: (data.stats?.metricsLogged ?? 0) + 1 });
    toast(`${metric.name} logged. +8 XP`, 'success', {
      label: 'Undo',
      onClick: async () => { await undoLastAction(); },
    });
  };

  const dailyQuest = data.quests.find((q) => q.type === 'daily');

  return (
    <motion.main className="page-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .35 }}>

      {/* Hero */}
      <section className="dashboard-hero panel">
        <div style={{ display: 'grid', gap: '.9rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '2.2rem', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,.25))' }}>
              {data.profile?.avatar ?? '🧭'}
            </span>
            <div>
              <p className="micro" style={{ marginBottom: '.1rem' }}>Today's command center</p>
              <h2 style={{ fontSize: 'clamp(1.4rem,2.5vw,2rem)' }}>
                {data.profile?.displayName ? `${data.profile.displayName}'s Quest Log` : 'Your Quest Log'}
              </h2>
            </div>
            {data.stats.currentStreak > 0 ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '.35rem',
                background: 'linear-gradient(135deg,rgba(249,115,22,.18),rgba(234,88,12,.12))',
                border: '1px solid rgba(249,115,22,.35)',
                borderRadius: '8px', padding: '.4rem .75rem',
                color: '#f97316', fontWeight: 900, fontSize: '.85rem',
                marginLeft: 'auto',
              }}>
                <Flame size={15} />
                {data.stats.currentStreak}-day streak
              </div>
            ) : null}
          </div>
          <p style={{ color: 'var(--muted)', lineHeight: 1.6, maxWidth: 560 }}>
            Build honest feedback loops across habits, focus, body signals, and the everyday stuff that quietly matters.
          </p>
          <div style={{ display: 'flex', gap: '.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '.4rem',
              background: 'linear-gradient(135deg,rgba(245,158,11,.18),rgba(251,191,36,.1))',
              border: '1px solid rgba(245,158,11,.35)',
              borderRadius: '8px', padding: '.35rem .75rem',
              color: '#d97706', fontWeight: 900, fontSize: '.82rem',
            }}>
              <Trophy size={14} />
              Lv {levelInfo.level} · {levelInfo.currentRank}
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '.4rem',
              background: 'linear-gradient(135deg,rgba(109,93,252,.14),rgba(6,182,212,.1))',
              border: '1px solid rgba(109,93,252,.28)',
              borderRadius: '8px', padding: '.35rem .75rem',
              color: 'var(--accent)', fontWeight: 900, fontSize: '.82rem',
            }}>
              <Zap size={14} />
              {data.stats.coins} coins
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '.4rem',
              background: 'linear-gradient(135deg,rgba(34,197,94,.14),rgba(6,182,212,.1))',
              border: '1px solid rgba(34,197,94,.28)',
              borderRadius: '8px', padding: '.35rem .75rem',
              color: '#16a34a', fontWeight: 900, fontSize: '.82rem',
            }}>
              <Star size={14} />
              {data.stats.achievementsUnlocked} achievements
            </div>
          </div>
        </div>
        <XPBar totalXP={data.stats.totalXP} />
      </section>

      {/* Stat cards */}
      <div className="stat-grid">
        <StatCard title="XP today" value={xpToday} detail="From real actions" icon="Sparkles" tone="gold" />
        <StatCard title="Habits done" value={`${todayCompletions.length}/${dueHabits.length}`} detail="Today" icon="Flame" tone="coral" />
        <StatCard title="Time tracked" value={`${Math.round(todayTime.reduce((s, e) => s + e.durationMinutes, 0) / 60 * 10) / 10}h`} detail="Today" icon="Timer" tone="cyan" />
        <StatCard title="Metrics logged" value={todayMetrics.length} detail="Private & local" icon="LineChart" tone="emerald" />
      </div>

      {/* Habits */}
      <section className="panel span-2">
        <div className="panel-title">
          <div><h3>Today's habits</h3><p>One tap, small win, XP lands.</p></div>
          <Link className="btn small ghost" to="/app/habits"><Plus size={15} /> Manage</Link>
        </div>
        <div className="habit-list compact">
          {dueHabits.length === 0 ? (
            <div className="empty-mini">No active habits yet. Create one to start earning XP.</div>
          ) : dueHabits.map((habit) => {
            const complete = todayCompletions.some((c) => c.habitId === habit.id);
            return (
              <motion.button
                key={habit.id}
                className={`habit-row ${complete ? 'complete' : ''}`}
                onClick={() => completeHabit(habit.id)}
                whileTap={{ scale: .98 }}
              >
                <span className="habit-icon" style={{ background: habit.color }}>
                  <Icon name={habit.icon} size={17} />
                </span>
                <span>
                  <strong>{habit.name}</strong>
                  <small>{habit.targetCount} {habit.unit} · +{habit.xpReward} XP</small>
                </span>
                <span style={{
                  fontSize: '.78rem', fontWeight: 900, padding: '.3rem .6rem',
                  borderRadius: '6px',
                  background: complete ? 'rgba(34,197,94,.15)' : 'var(--surface-2)',
                  color: complete ? 'var(--success)' : 'var(--muted)',
                  border: `1px solid ${complete ? 'rgba(34,197,94,.35)' : 'var(--border)'}`,
                }}>
                  {complete ? '✓ Done' : 'Complete'}
                </span>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Quick actions */}
      <section className="panel">
        <div className="panel-title"><div><h3>Quick actions</h3><p>Fast logs, zero friction.</p></div></div>
        <div className="action-grid">
          <Link className="quick-action" to="/app/time"><Timer size={18} /> Start timer</Link>
          <Link className="quick-action" to="/app/planner"><ListChecks size={18} /> Plan day</Link>
          <button className="quick-action" onClick={() => dueHabits[0] && completeHabit(dueHabits[0].id)}>
            <CalendarCheck size={18} /> Complete habit
          </button>
          <button className="quick-action" onClick={quickLogMetric}><Plus size={18} /> Log metric</button>
          <Link className="quick-action" to="/app/reports"><FileText size={18} /> Generate report</Link>
          <Link className="quick-action" to="/app/metrics"><NotebookPen size={18} /> Journal note</Link>
        </div>
      </section>

      {/* Planner mini */}
      <section className="panel">
        <div className="panel-title">
          <div><h3>Today's planner</h3><p>Timetable blocks and to-do quests.</p></div>
          <Link className="btn small ghost" to="/app/planner">Open</Link>
        </div>
        <div className="planner-mini-list">
          <div className="planner-mini-score">
            <strong>{completedTodos.length + completedBlocks.length}</strong>
            <span>planner wins today</span>
          </div>
          {todayBlocks.slice(0, 3).map((block) => (
            <Link key={block.id} className={`mini-plan-item ${block.status}`} to="/app/planner">
              <span>{block.startTime}</span>
              <strong>{block.title}</strong>
            </Link>
          ))}
          {!todayBlocks.length && todayTodos.slice(0, 3).map((todo) => (
            <Link key={todo.id} className={`mini-plan-item ${todo.status}`} to="/app/planner">
              <span style={{ textTransform: 'capitalize' }}>{todo.priority}</span>
              <strong>{todo.title}</strong>
            </Link>
          ))}
          {!todayBlocks.length && !todayTodos.length
            ? <EmptyMini text="No timetable or to-dos yet. Add one small quest." />
            : null}
        </div>
      </section>

      {/* Weekly chart */}
      <section className="panel">
        <div className="panel-title"><div><h3>Weekly progress</h3><p>XP, habits, and time — last 7 days.</p></div></div>
        <ResponsiveContainer width="100%" height={225}>
          <AreaChart data={series}>
            <defs>
              <linearGradient id="xpGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={.5} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={.02} />
              </linearGradient>
              <linearGradient id="habitGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity={.45} />
                <stop offset="100%" stopColor="#f97316" stopOpacity={.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--muted)' }} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--muted)' }} />
            <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
            <Area dataKey="xp" stroke="var(--accent)" strokeWidth={2} fill="url(#xpGrad)" />
            <Area dataKey="habits" stroke="#f97316" strokeWidth={2} fill="url(#habitGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </section>

      {/* Time by category */}
      <section className="panel">
        <div className="panel-title"><div><h3>Time by category</h3><p>Today's tracked focus spread.</p></div></div>
        {byCategory.length ? (
          <ResponsiveContainer width="100%" height={225}>
            <PieChart>
              <Pie data={byCategory} dataKey="minutes" nameKey="name" innerRadius={52} outerRadius={84} paddingAngle={4} strokeWidth={0}>
                {byCategory.map((entry) => <Cell key={entry.id} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        ) : <EmptyMini text="Start a timer and this chart wakes up." />}
      </section>

      {/* Metrics */}
      <section className="panel">
        <div className="panel-title">
          <div><h3>Life metrics today</h3><p>Normal, private, useful.</p></div>
          <Link className="btn small ghost" to="/app/metrics">Open</Link>
        </div>
        <div className="metric-pills">
          {todayMetrics.slice(0, 8).map((log) => {
            const metric = data.metricDefinitions.find((m) => m.id === log.metricId);
            return (
              <span key={log.id}>
                {metric?.name}: <strong>{String(log.value)} {metric?.unit}</strong>
              </span>
            );
          })}
          {!todayMetrics.length
            ? <EmptyMini text="Mood, water, sleep, poop — all fair game. No metrics yet." />
            : null}
        </div>
      </section>

      {/* Quests */}
      <section className="panel">
        <div className="panel-title"><div><h3>Active quests</h3><p>Friendly pressure, adjustable in Settings.</p></div></div>

        <div className="quest-card">
          <Sparkles size={20} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '.5rem' }}>
              <strong>{dailyQuest?.title ?? 'Log one meaningful action'}</strong>
              {dailyQuest?.xpReward ? (
                <span style={{
                  fontSize: '.74rem', fontWeight: 900,
                  background: 'linear-gradient(135deg,rgba(109,93,252,.18),rgba(6,182,212,.12))',
                  border: '1px solid rgba(109,93,252,.28)',
                  color: 'var(--accent)', padding: '.2rem .5rem', borderRadius: '6px', whiteSpace: 'nowrap',
                }}>
                  +{dailyQuest.xpReward} XP
                </span>
              ) : null}
            </div>
            <span>{dailyQuest?.description ?? 'Protect the no zero day.'}</span>
          </div>
        </div>

        <div className={`quest-card ${noZero ? 'success' : ''}`}>
          <Flame size={20} />
          <div>
            <strong>{noZero ? 'No zero day protected ✓' : 'No zero day — unprotected'}</strong>
            <span>{noZero ? 'You already made today count.' : 'One tiny log is enough to keep the story moving.'}</span>
          </div>
        </div>
      </section>

      {/* Insights */}
      <section className="panel span-2">
        <div className="panel-title"><div><h3>Helpful insights</h3><p>No causality overclaims, just pattern clues.</p></div></div>
        <div className="insight-grid">
          <article>
            <strong>What you've been consistent with</strong>
            <p>{todayCompletions[0] ? `${data.habits.find((h) => h.id === todayCompletions[0].habitId)?.name} is already checked today.` : 'Complete a habit and LifeXP will highlight your consistency.'}</p>
          </article>
          <article>
            <strong>What needs attention</strong>
            <p>{dueHabits.find((h) => !todayCompletions.some((c) => c.habitId === h.id))?.name ?? 'Nothing urgent. You\'re on top of it.'}</p>
          </article>
          <article>
            <strong>Week comparison</strong>
            <p>{compareThisWeekLastWeek(data.timeEntries)}</p>
          </article>
          <article>
            <strong>Most active category</strong>
            <p>{byCategory[0] ? `${byCategory[0].name} leads today with ${byCategory[0].hours} hours.` : 'Track time and your category balance appears here.'}</p>
          </article>
        </div>
      </section>

      {/* Activity bars */}
      <section className="panel span-2">
        <div className="panel-title"><div><h3>Last 7 days activity</h3><p>Time and metrics — a fast scan of your data trail.</p></div></div>
        <ResponsiveContainer width="100%" height={235}>
          <BarChart data={series}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--muted)' }} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--muted)' }} />
            <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
            <Bar dataKey="time" fill="var(--accent-2)" radius={[6, 6, 0, 0]} />
            <Bar dataKey="metrics" fill="var(--success)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </section>

    </motion.main>
  );
}

function EmptyMini({ text }: { text: string }) {
  return <div className="empty-mini">{text}</div>;
}
