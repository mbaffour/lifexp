import { useState } from 'react';
import { addDays, endOfMonth, format, startOfMonth, startOfWeek } from 'date-fns';
import { useLifeData } from '../hooks/useLifeData';
import { dateKey, prettyDate, todayKey } from '../utils/dates';

export function Calendar() {
  const data = useLifeData();
  const [cursor, setCursor] = useState(new Date());
  const [selected, setSelected] = useState(todayKey());
  if (!data) return null;

  const start = startOfWeek(startOfMonth(cursor));
  const end = endOfMonth(cursor);
  const days: Date[] = [];
  for (let day = start; day <= addDays(end, 6); day = addDays(day, 1)) days.push(day);

  const details = {
    habits: data.habitCompletions.filter((item) => item.date === selected),
    time: data.timeEntries.filter((item) => item.startTime.slice(0, 10) === selected),
    metrics: data.metricLogs.filter((item) => item.date === selected),
    todos: data.todoItems.filter((item) => item.dueDate === selected || item.scheduledDate === selected || item.completedAt?.slice(0, 10) === selected),
    blocks: data.timetableBlocks.filter((item) => item.date === selected).sort((a, b) => a.startTime.localeCompare(b.startTime)),
    xp: data.xpTransactions.filter((item) => item.createdAt.slice(0, 10) === selected),
  };

  return (
    <main className="page-grid">
      <section className="panel span-2">
        <div className="panel-title">
          <div><h2>Calendar</h2><p>See habits, time, metrics, XP, and notes by day.</p></div>
          <div className="row-actions">
            <button className="btn small ghost" onClick={() => setCursor(addDays(cursor, -30))}>Previous</button>
            <button className="btn small ghost" onClick={() => setCursor(new Date())}>Today</button>
            <button className="btn small ghost" onClick={() => setCursor(addDays(cursor, 30))}>Next</button>
          </div>
        </div>
        <h3>{format(cursor, 'MMMM yyyy')}</h3>
        <div className="calendar-grid">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <strong key={day}>{day}</strong>)}
          {days.map((day) => {
            const key = dateKey(day);
            const habitCount = data.habitCompletions.filter((item) => item.date === key && !item.skipped).length;
            const metricCount = data.metricLogs.filter((item) => item.date === key).length;
            const minutes = data.timeEntries.filter((item) => item.startTime.slice(0, 10) === key).reduce((sum, item) => sum + item.durationMinutes, 0);
            const plannerCount = data.todoItems.filter((item) => item.dueDate === key || item.scheduledDate === key).length + data.timetableBlocks.filter((item) => item.date === key).length;
            const xp = data.xpTransactions.filter((item) => item.createdAt.slice(0, 10) === key).reduce((sum, item) => sum + item.amount, 0);
            return (
              <button key={key} className={`calendar-day ${selected === key ? 'selected' : ''} ${key === todayKey() ? 'today' : ''}`} onClick={() => setSelected(key)}>
                <span>{format(day, 'd')}</span>
                <small>{plannerCount ? `${plannerCount} plans` : habitCount ? `${habitCount} habits` : ''}</small>
                <div className="day-dots"><i className={habitCount ? 'hot' : ''} /><i className={minutes ? 'cool' : ''} /><i className={metricCount ? 'green' : ''} /><i className={plannerCount ? 'purple' : ''} /><i className={xp ? 'gold' : ''} /></div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="panel">
        <div className="panel-title"><div><h3>{prettyDate(selected)}</h3><p>Day details</p></div></div>
        <div className="day-details">
          <strong>Habits</strong>
          {details.habits.map((item) => <span key={item.id}>{data.habits.find((habit) => habit.id === item.habitId)?.name}: {item.skipped ? 'skipped' : `${item.count} done`}</span>)}
          <strong>Time</strong>
          {details.time.map((item) => <span key={item.id}>{item.title}: {item.durationMinutes} min</span>)}
          <strong>To-dos</strong>
          {details.todos.map((item) => <span key={item.id}>{item.title}: {item.status}</span>)}
          <strong>Timetable</strong>
          {details.blocks.map((item) => <span key={item.id}>{item.startTime}-{item.endTime} {item.title}: {item.status}</span>)}
          <strong>Metrics</strong>
          {details.metrics.map((item) => {
            const metric = data.metricDefinitions.find((metricItem) => metricItem.id === item.metricId);
            return <span key={item.id}>{metric?.name}: {String(item.value)} {metric?.unit}</span>;
          })}
          <strong>XP</strong>
          <span>{details.xp.reduce((sum, item) => sum + item.amount, 0)} XP earned</span>
        </div>
      </section>
    </main>
  );
}
