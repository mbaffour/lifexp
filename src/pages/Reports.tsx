import { useState } from 'react';
import { Download, FileJson, Printer } from 'lucide-react';
import { db, uuid } from '../db/lifexpDb';
import { useLifeData } from '../hooks/useLifeData';
import { downloadBlob, toCsv } from '../utils/export';
import { sumTimeByCategory } from '../utils/analytics';
import { todayKey } from '../utils/dates';
import { useToast } from '../components/Toast';

export function Reports() {
  const data = useLifeData();
  const toast = useToast();
  const [range, setRange] = useState('weekly');
  if (!data?.stats) return null;

  const report = (() => {
    const now = new Date();
    const days = range === 'daily' ? 1 : range === 'monthly' ? 30 : 7;
    const start = new Date(now.getTime() - (days - 1) * 86400000).toISOString().slice(0, 10);
    const end = todayKey();
    const habits = data.habitCompletions.filter((item) => item.date >= start && item.date <= end && !item.skipped);
    const time = data.timeEntries.filter((item) => item.startTime.slice(0, 10) >= start && item.startTime.slice(0, 10) <= end);
    const metrics = data.metricLogs.filter((item) => item.date >= start && item.date <= end);
    const todos = data.todoItems.filter((item) => item.createdAt.slice(0, 10) <= end && (item.dueDate ?? item.scheduledDate ?? item.createdAt.slice(0, 10)) >= start);
    const completedTodos = data.todoItems.filter((item) => item.completedAt && item.completedAt.slice(0, 10) >= start && item.completedAt.slice(0, 10) <= end);
    const timetableBlocks = data.timetableBlocks.filter((item) => item.date >= start && item.date <= end);
    const completedBlocks = timetableBlocks.filter((item) => item.status === 'completed');
    const xp = data.xpTransactions.filter((item) => item.createdAt.slice(0, 10) >= start && item.createdAt.slice(0, 10) <= end);
    const categories = sumTimeByCategory(time, data.categories);
    return {
      title: `${range[0].toUpperCase()}${range.slice(1)} LifeXP Report`,
      start,
      end,
      totalXP: xp.reduce((sum, item) => sum + item.amount, 0),
      habitCompletionRate: data.habits.length ? Math.round((habits.length / (data.habits.filter((habit) => habit.status === 'active').length * days)) * 100) : 0,
      timeMinutes: time.reduce((sum, item) => sum + item.durationMinutes, 0),
      todoCompletionRate: todos.length ? Math.round((completedTodos.length / todos.length) * 100) : 0,
      timetableCompletionRate: timetableBlocks.length ? Math.round((completedBlocks.length / timetableBlocks.length) * 100) : 0,
      completedTodos: completedTodos.length,
      completedBlocks: completedBlocks.length,
      categories,
      topActivities: time.slice(0, 5).map((item) => `${item.title} (${item.durationMinutes} min)`),
      metrics,
      achievements: data.achievements.filter((item) => item.unlockedAt && item.unlockedAt.slice(0, 10) >= start),
      weakSpots: data.habits.filter((habit) => !habits.some((completion) => completion.habitId === habit.id)).slice(0, 5).map((habit) => habit.name),
      focus: categories[0]?.name ? `Keep investing in ${categories[0].name}, then pick one neglected habit to revive.` : 'Track one time block and one metric tomorrow.',
    };
  })();

  const saveReport = async () => {
    await db.reports.add({ id: uuid('report_'), title: report.title, rangeStart: report.start, rangeEnd: report.end, payload: report, createdAt: new Date().toISOString() });
    toast('Report saved locally.');
  };

  return (
    <main className="page-stack reports-page">
      <section className="panel">
        <div className="panel-title">
          <div><h2>Reports</h2><p>Generate daily, weekly, monthly, and custom summaries you can print or export.</p></div>
          <select value={range} onChange={(e) => setRange(e.target.value)}><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="custom">Custom date range</option></select>
        </div>
        <div className="row-actions">
          <button className="btn primary" onClick={saveReport}><FileJson size={16} /> Save report</button>
          <button className="btn ghost" onClick={() => window.print()}><Printer size={16} /> Print / Save PDF</button>
          <button className="btn ghost" onClick={() => downloadBlob(`lifexp-${range}-report.json`, JSON.stringify(report, null, 2))}><Download size={16} /> Export JSON</button>
          <button className="btn ghost" onClick={() => downloadBlob(`lifexp-${range}-summary.csv`, toCsv([report as unknown as Record<string, unknown>]), 'text/csv')}><Download size={16} /> Export CSV</button>
        </div>
      </section>

      <section className="report-sheet">
        <h1>{report.title}</h1>
        <p>{report.start} to {report.end}</p>
        <div className="stat-grid">
          <div><span>Total XP</span><strong>{report.totalXP}</strong></div>
          <div><span>Level</span><strong>{data.stats.currentLevel}</strong></div>
          <div><span>Habit rate</span><strong>{report.habitCompletionRate}%</strong></div>
          <div><span>Time tracked</span><strong>{(report.timeMinutes / 60).toFixed(1)}h</strong></div>
          <div><span>To-do rate</span><strong>{report.todoCompletionRate}%</strong></div>
          <div><span>Timetable rate</span><strong>{report.timetableCompletionRate}%</strong></div>
        </div>
        <h2>Time by category</h2>
        <ul>{report.categories.map((item) => <li key={item.id}>{item.name}: {item.hours}h</li>)}</ul>
        <h2>Top activities</h2>
        <ul>{report.topActivities.map((item) => <li key={item}>{item}</li>)}</ul>
        <h2>Life metrics summary</h2>
        <p>{report.metrics.length} metric logs, including weight, sleep, poop frequency, mood, or energy when available.</p>
        <h2>Planner summary</h2>
        <p>{report.completedTodos} to-dos completed and {report.completedBlocks} timetable blocks checked off in this range.</p>
        <h2>Weak spots</h2>
        <p>{report.weakSpots.length ? report.weakSpots.join(', ') : 'No obvious weak spots in this range.'}</p>
        <h2>Suggested focus</h2>
        <p>{report.focus}</p>
      </section>
    </main>
  );
}
