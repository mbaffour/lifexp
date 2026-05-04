import { Link } from 'react-router-dom';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CalendarCheck, FileText, Flame, ListChecks, NotebookPen, Plus, Sparkles, Timer } from 'lucide-react';
import { motion } from 'framer-motion';
import { db, addXP, updateStats, uuid } from '../db/lifexpDb';
import { useLifeData } from '../hooks/useLifeData';
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
  const todayCompletions = data.habitCompletions.filter((completion) => completion.date === today && !completion.skipped);
  const todayTime = data.timeEntries.filter((entry) => entry.startTime.slice(0, 10) === today);
  const todayMetrics = data.metricLogs.filter((log) => log.date === today);
  const todayTodos = data.todoItems.filter((todo) => todo.dueDate === today || todo.scheduledDate === today);
  const completedTodos = data.todoItems.filter((todo) => todo.completedAt?.slice(0, 10) === today);
  const todayBlocks = data.timetableBlocks.filter((block) => block.date === today).sort((a, b) => a.startTime.localeCompare(b.startTime));
  const completedBlocks = todayBlocks.filter((block) => block.status === 'completed');
  const dueHabits = data.habits.filter((habit) => habit.status === 'active').slice(0, 8);
  const series = dailySeries(7, data.xpTransactions, data.habitCompletions, data.timeEntries, data.metricLogs);
  const byCategory = sumTimeByCategory(todayTime, data.categories);
  const xpToday = data.xpTransactions.filter((xp) => xp.createdAt.slice(0, 10) === today).reduce((sum, xp) => sum + xp.amount, 0);

  const completeHabit = async (habitId: string) => {
    const habit = data.habits.find((item) => item.id === habitId);
    if (!habit) return;
    const duplicate = await db.habitCompletions.where({ habitId, date: today }).first();
    if (duplicate && !window.confirm('This habit is already logged today. Add another completion anyway?')) return;
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
    toast(`${habit.name} completed. +${habit.xpReward} XP`);
  };

  const quickLogMetric = async () => {
    const metric = data.metricDefinitions.find((item) => item.quickLogEnabled && item.name === 'Water intake') ?? data.metricDefinitions[0];
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
    toast(`${metric.name} logged.`);
  };

  const noZero = todayCompletions.length + todayTime.length + todayMetrics.length + completedTodos.length + completedBlocks.length > 0;

  return (
    <motion.main className="page-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <section className="dashboard-hero panel">
        <div>
          <p className="micro">Today’s command center</p>
          <h2>Track your life. Level it up.</h2>
          <p>Build honest feedback loops across habits, focus, body signals, goals, and the everyday stuff that quietly matters.</p>
        </div>
        <XPBar totalXP={data.stats.totalXP} />
      </section>

      <div className="stat-grid">
        <StatCard title="XP today" value={xpToday} detail="Earned from real actions" icon="Sparkles" tone="gold" />
        <StatCard title="Habits done" value={`${todayCompletions.length}/${dueHabits.length}`} detail="Today" icon="Flame" tone="coral" />
        <StatCard title="Time tracked" value={`${Math.round(todayTime.reduce((sum, entry) => sum + entry.durationMinutes, 0) / 60 * 10) / 10}h`} detail="Today" icon="Timer" tone="cyan" />
        <StatCard title="Metrics logged" value={todayMetrics.length} detail="Private and local" icon="LineChart" tone="emerald" />
      </div>

      <section className="panel span-2">
        <div className="panel-title">
          <div><h3>Today’s habits</h3><p>One tap, small win, XP lands.</p></div>
          <Link className="btn small ghost" to="/app/habits"><Plus size={16} /> Manage</Link>
        </div>
        <div className="habit-list compact">
          {dueHabits.map((habit) => {
            const complete = todayCompletions.some((completion) => completion.habitId === habit.id);
            return (
              <button key={habit.id} className={`habit-row ${complete ? 'complete' : ''}`} onClick={() => completeHabit(habit.id)}>
                <span className="habit-icon" style={{ background: habit.color }}><Icon name={habit.icon} size={18} /></span>
                <span><strong>{habit.name}</strong><small>{habit.targetCount} {habit.unit} · {habit.xpReward} XP</small></span>
                <span>{complete ? 'Done' : 'Complete'}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="panel">
        <div className="panel-title"><div><h3>Quick actions</h3><p>Fast logs for low-friction tracking.</p></div></div>
        <div className="action-grid">
          <Link className="quick-action" to="/app/time"><Timer /> Start timer</Link>
          <Link className="quick-action" to="/app/planner"><ListChecks /> Plan day</Link>
          <button className="quick-action" onClick={() => dueHabits[0] && completeHabit(dueHabits[0].id)}><CalendarCheck /> Complete habit</button>
          <button className="quick-action" onClick={quickLogMetric}><Plus /> Log metric</button>
          <Link className="quick-action" to="/app/reports"><FileText /> Generate report</Link>
          <Link className="quick-action" to="/app/metrics"><NotebookPen /> Add journal note</Link>
        </div>
      </section>

      <section className="panel">
        <div className="panel-title">
          <div><h3>Today planner</h3><p>Timetable blocks and to-do quests.</p></div>
          <Link className="btn small ghost" to="/app/planner">Open</Link>
        </div>
        <div className="planner-mini-list">
          <div className="planner-mini-score">
            <strong>{completedTodos.length + completedBlocks.length}</strong>
            <span>planner wins</span>
          </div>
          {todayBlocks.slice(0, 3).map((block) => (
            <Link key={block.id} className={`mini-plan-item ${block.status}`} to="/app/planner">
              <span>{block.startTime}</span>
              <strong>{block.title}</strong>
            </Link>
          ))}
          {!todayBlocks.length && todayTodos.slice(0, 3).map((todo) => (
            <Link key={todo.id} className={`mini-plan-item ${todo.status}`} to="/app/planner">
              <span>{todo.priority}</span>
              <strong>{todo.title}</strong>
            </Link>
          ))}
          {!todayBlocks.length && !todayTodos.length ? <EmptyMini text="No timetable or to-dos today. Add one small quest." /> : null}
        </div>
      </section>

      <section className="panel">
        <div className="panel-title"><div><h3>Weekly progress</h3><p>Habits, time, metrics, and XP.</p></div></div>
        <ResponsiveContainer width="100%" height={230}>
          <AreaChart data={series}>
            <defs>
              <linearGradient id="xpGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#6d5dfc" stopOpacity={0.55} />
                <stop offset="100%" stopColor="#6d5dfc" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Area dataKey="xp" stroke="#6d5dfc" fill="url(#xpGradient)" />
            <Area dataKey="habits" stroke="#f97316" fill="#f9731622" />
          </AreaChart>
        </ResponsiveContainer>
      </section>

      <section className="panel">
        <div className="panel-title"><div><h3>Time by category</h3><p>Today’s tracked focus spread.</p></div></div>
        {byCategory.length ? (
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={byCategory} dataKey="minutes" nameKey="name" innerRadius={54} outerRadius={86} paddingAngle={4}>
                {byCategory.map((entry) => <Cell key={entry.id} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : <EmptyMini text="Start a timer and this chart wakes up." />}
      </section>

      <section className="panel">
        <div className="panel-title"><div><h3>Life metrics today</h3><p>Normal, private, useful.</p></div><Link className="btn small ghost" to="/app/metrics">Open</Link></div>
        <div className="metric-pills">
          {todayMetrics.slice(0, 8).map((log) => {
            const metric = data.metricDefinitions.find((item) => item.id === log.metricId);
            return <span key={log.id}>{metric?.name}: <strong>{String(log.value)} {metric?.unit}</strong></span>;
          })}
          {!todayMetrics.length ? <EmptyMini text="No metrics today. Mood, water, sleep, poop, all fair game." /> : null}
        </div>
      </section>

      <section className="panel">
        <div className="panel-title"><div><h3>Today’s quest</h3><p>Friendly pressure, adjustable in Settings.</p></div></div>
        <div className="quest-card">
          <Sparkles />
          <div>
            <strong>{data.quests.find((quest) => quest.type === 'daily')?.title ?? 'Log one meaningful action'}</strong>
            <span>{data.quests.find((quest) => quest.type === 'daily')?.description ?? 'Protect the no zero day.'}</span>
          </div>
        </div>
        <div className={`quest-card ${noZero ? 'success' : ''}`}>
          <Flame />
          <div>
            <strong>{noZero ? 'No zero day protected' : 'No zero day card'}</strong>
            <span>{noZero ? 'You already made today count.' : 'One tiny log is enough to keep the story moving.'}</span>
          </div>
        </div>
      </section>

      <section className="panel span-2">
        <div className="panel-title"><div><h3>Helpful insights</h3><p>No causality overclaims, just pattern clues.</p></div></div>
        <div className="insight-grid">
          <article><strong>What you’ve been consistent with</strong><p>{todayCompletions[0] ? `${data.habits.find((habit) => habit.id === todayCompletions[0].habitId)?.name} is already checked today.` : 'Complete a habit and LifeXP will highlight consistency.'}</p></article>
          <article><strong>What needs attention</strong><p>{dueHabits.find((habit) => !todayCompletions.some((completion) => completion.habitId === habit.id))?.name ?? 'Nothing urgent. Nice.'}</p></article>
          <article><strong>Week comparison</strong><p>{compareThisWeekLastWeek(data.timeEntries)}</p></article>
          <article><strong>Most active category</strong><p>{byCategory[0] ? `${byCategory[0].name} leads today with ${byCategory[0].hours} hours.` : 'Track time and your category balance appears here.'}</p></article>
        </div>
      </section>

      <section className="panel span-2">
        <div className="panel-title"><div><h3>Last 7 days activity</h3><p>Fast scan of your personal data trail.</p></div></div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={series}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="time" fill="#06b6d4" radius={[8, 8, 0, 0]} />
            <Bar dataKey="metrics" fill="#22c55e" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </section>
    </motion.main>
  );
}

function EmptyMini({ text }: { text: string }) {
  return <div className="empty-mini">{text}</div>;
}
