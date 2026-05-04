import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useLifeData } from '../hooks/useLifeData';
import { averageMetric, compareThisWeekLastWeek, dailySeries, habitCompletionRate, metricTrend, streakForHabit, sumTimeByCategory } from '../utils/analytics';

export function Analytics() {
  const data = useLifeData();
  if (!data) return null;
  const series = dailySeries(30, data.xpTransactions, data.habitCompletions, data.timeEntries, data.metricLogs);
  const categories = sumTimeByCategory(data.timeEntries, data.categories);
  const habitRates = data.habits.filter((habit) => habit.status === 'active').map((habit) => ({ name: habit.name, rate: habitCompletionRate(habit, data.habitCompletions), streak: streakForHabit(habit, data.habitCompletions).current })).slice(0, 12);
  const weight = data.metricDefinitions.find((metric) => metric.name === 'Weight');
  const sleep = data.metricDefinitions.find((metric) => metric.name === 'Sleep hours');
  const energy = data.metricDefinitions.find((metric) => metric.name === 'Energy');
  const poop = data.metricDefinitions.find((metric) => metric.name === 'Poop frequency');
  const water = data.metricDefinitions.find((metric) => metric.name === 'Water intake');
  const mood = data.metricDefinitions.find((metric) => metric.name === 'Mood');
  const caffeine = data.metricDefinitions.find((metric) => metric.name === 'Caffeine');
  const weightTrend = weight ? metricTrend(weight, data.metricLogs.slice().reverse()) : [];
  const sleepTrend = sleep ? metricTrend(sleep, data.metricLogs.slice().reverse()) : [];
  const poopTrend = poop ? metricTrend(poop, data.metricLogs.slice().reverse()) : [];

  const insights = [
    compareThisWeekLastWeek(data.timeEntries),
    `Your most consistent habit is ${habitRates.sort((a, b) => b.rate - a.rate)[0]?.name ?? 'waiting for data'}.`,
    averageMetric(sleep, data.metricLogs) && averageMetric(energy, data.metricLogs)
      ? `Sleep and energy can be compared here; current averages are ${averageMetric(sleep, data.metricLogs)?.toFixed(1)}h sleep and ${averageMetric(energy, data.metricLogs)?.toFixed(1)}/10 energy.`
      : 'Log sleep and energy to compare them without pretending correlation is causation.',
    averageMetric(poop, data.metricLogs) ? `Your average poop frequency this period is ${averageMetric(poop, data.metricLogs)?.toFixed(1)} per logged day.` : 'Poop frequency appears here after a few logs.',
    categories[0] ? `${categories[0].name} is your largest tracked time category.` : 'Track time to reveal your highest-use categories.',
  ];

  return (
    <main className="page-grid">
      <section className="panel span-2">
        <div className="panel-title"><div><h2>Analytics</h2><p>Useful patterns, careful wording. LifeXP shows associations, not magic causes.</p></div></div>
        <div className="insight-grid">
          {insights.map((insight) => <article key={insight}><strong>Insight</strong><p>{insight}</p></article>)}
        </div>
      </section>

      <ChartPanel title="XP over time" subtitle="Daily XP transactions">
        <ResponsiveContainer width="100%" height={260}><LineChart data={series}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="date" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Line dataKey="xp" stroke="#6d5dfc" strokeWidth={3} dot={false} /></LineChart></ResponsiveContainer>
      </ChartPanel>

      <ChartPanel title="Time by category" subtitle="Hours tracked by life area">
        <ResponsiveContainer width="100%" height={260}><PieChart><Pie data={categories} dataKey="minutes" nameKey="name" innerRadius={54} outerRadius={92}>{categories.map((entry) => <Cell key={entry.id} fill={entry.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
      </ChartPanel>

      <ChartPanel title="Habit completion rate" subtitle="Last 30 days">
        <ResponsiveContainer width="100%" height={300}><BarChart data={habitRates}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis /><Tooltip /><Bar dataKey="rate" fill="#f97316" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer>
      </ChartPanel>

      <ChartPanel title="Productivity heatmap" subtitle="Habits, time, metrics per day">
        <div className="heatmap">{series.map((day) => <span key={day.date} title={`${day.date}: ${day.habits} habits, ${day.time}h, ${day.metrics} metrics`} style={{ opacity: Math.min(1, 0.18 + (day.habits + day.time + day.metrics) / 12) }} />)}</div>
      </ChartPanel>

      <ChartPanel title="Weight trend" subtitle="If available">
        <MiniLine data={weightTrend} color="#f59e0b" />
      </ChartPanel>

      <ChartPanel title="Sleep trend" subtitle="Sleep hours">
        <MiniLine data={sleepTrend} color="#64748b" />
      </ChartPanel>

      <ChartPanel title="Poop frequency trend" subtitle="Normal body data, usefully summarized">
        <MiniLine data={poopTrend} color="#a16207" />
      </ChartPanel>

      <section className="panel">
        <div className="panel-title"><div><h3>Metric averages</h3><p>Most tracked lifestyle signals.</p></div></div>
        <div className="metric-pills">
          {[mood, energy, water, caffeine].map((metric) => metric ? <span key={metric.id}>{metric.name}: <strong>{averageMetric(metric, data.metricLogs)?.toFixed(1) ?? 'No data'} {metric.unit}</strong></span> : null)}
        </div>
      </section>
    </main>
  );
}

function ChartPanel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <section className="panel"><div className="panel-title"><div><h3>{title}</h3><p>{subtitle}</p></div></div>{children}</section>;
}

function MiniLine({ data, color }: { data: { date: string; value: number }[]; color: string }) {
  if (!data.length) return <div className="empty-state">No data yet.</div>;
  return <ResponsiveContainer width="100%" height={240}><LineChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="date" tick={{ fontSize: 11 }} /><YAxis /><Tooltip /><Line dataKey="value" stroke={color} strokeWidth={3} dot={false} /></LineChart></ResponsiveContainer>;
}
