import { useState, type FormEvent } from 'react';
import { Archive, Check, Flame, Pause, Plus, Search, Trash2 } from 'lucide-react';
import { db, addXP, updateStats, uuid } from '../db/lifexpDb';
import { useLifeData } from '../hooks/useLifeData';
import { Icon } from '../components/Icon';
import { useToast } from '../components/Toast';
import type { HabitDifficulty, HabitStatus } from '../types';
import { habitCompletionRate, streakForHabit } from '../utils/analytics';
import { todayKey } from '../utils/dates';

export function Habits() {
  const data = useLifeData();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('due');
  const [form, setForm] = useState({ name: '', categoryId: '', difficulty: 'easy' as HabitDifficulty, unit: 'times', targetCount: 1, xpReward: 20, icon: 'Flame', color: '#f97316' });
  if (!data) return null;

  const habits = (() => {
    let rows = data.habits.filter((habit) => habit.status !== 'archived');
    if (query) rows = rows.filter((habit) => habit.name.toLowerCase().includes(query.toLowerCase()) || habit.description.toLowerCase().includes(query.toLowerCase()));
    if (category !== 'all') rows = rows.filter((habit) => habit.categoryId === category);
    return rows.sort((a, b) => {
      if (sort === 'streak') return streakForHabit(b, data.habitCompletions).current - streakForHabit(a, data.habitCompletions).current;
      if (sort === 'category') return a.categoryId.localeCompare(b.categoryId);
      if (sort === 'completion') return habitCompletionRate(b, data.habitCompletions) - habitCompletionRate(a, data.habitCompletions);
      return Number(todayDone(data.habitCompletions, a.id)) - Number(todayDone(data.habitCompletions, b.id));
    });
  })();

  const createHabit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) return toast('Habit name is required.', 'warning');
    if (data.habits.some((habit) => habit.name.toLowerCase() === form.name.trim().toLowerCase() && habit.status !== 'archived')) {
      return toast('That habit already exists.', 'warning');
    }
    await db.habits.add({
      id: uuid('habit_'),
      name: form.name.trim(),
      description: '',
      categoryId: form.categoryId || data.categories[0]?.id,
      frequency: { type: 'daily' },
      targetCount: Number(form.targetCount),
      unit: form.unit,
      difficulty: form.difficulty,
      xpReward: Number(form.xpReward),
      icon: form.icon,
      color: form.color,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setForm((current) => ({ ...current, name: '' }));
    toast('Habit created.');
  };

  const completeHabit = async (habitId: string, count = 1, skipped = false) => {
    const habit = data.habits.find((item) => item.id === habitId);
    if (!habit) return;
    const date = todayKey();
    const xpEarned = skipped ? 0 : habit.xpReward;
    await db.habitCompletions.add({
      id: uuid('hc_'),
      habitId,
      date,
      completedAt: skipped ? undefined : new Date().toISOString(),
      count,
      notes: skipped ? 'Skipped without breaking streak.' : '',
      skipped,
      xpEarned,
      createdAt: new Date().toISOString(),
    });
    if (!skipped) {
      await addXP(xpEarned, 'habit', habitId, `Completed ${habit.name}`);
      await updateStats({ habitsCompleted: (data.stats?.habitsCompleted ?? 0) + 1 });
    }
    toast(skipped ? `${habit.name} skipped.` : `${habit.name} complete. +${xpEarned} XP`);
  };

  const setStatus = async (habitId: string, status: HabitStatus) => {
    await db.habits.update(habitId, { status, updatedAt: new Date().toISOString() });
    toast(status === 'archived' ? 'Habit archived.' : 'Habit updated.');
  };

  return (
    <main className="page-stack">
      <section className="panel">
        <div className="panel-title">
          <div><h2>Habit Tracker</h2><p>Create habits, complete them, skip kindly, and watch streaks build.</p></div>
        </div>
        <form className="form-grid" onSubmit={createHabit}>
          <label>Habit name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Practice guitar" /></label>
          <label>Category<select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>{data.categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}</select></label>
          <label>Difficulty<select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value as HabitDifficulty })}><option>easy</option><option>medium</option><option>hard</option><option>heroic</option></select></label>
          <label>Target<input type="number" min="1" value={form.targetCount} onChange={(e) => setForm({ ...form, targetCount: Number(e.target.value) })} /></label>
          <label>Unit<input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></label>
          <label>XP reward<input type="number" min="0" value={form.xpReward} onChange={(e) => setForm({ ...form, xpReward: Number(e.target.value) })} /></label>
          <button className="btn primary"><Plus size={16} /> Add habit</button>
        </form>
      </section>

      <section className="panel">
        <div className="toolbar">
          <label className="search"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search habits" /></label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}><option value="all">All categories</option>{data.categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}</select>
          <select value={sort} onChange={(e) => setSort(e.target.value)}><option value="due">Due today</option><option value="streak">Streak</option><option value="category">Category</option><option value="completion">Completion rate</option></select>
        </div>
        <div className="habit-list">
          {habits.map((habit) => {
            const streak = streakForHabit(habit, data.habitCompletions);
            const rate = habitCompletionRate(habit, data.habitCompletions);
            const done = todayDone(data.habitCompletions, habit.id);
            return (
              <article key={habit.id} className={`habit-row card-row ${done ? 'complete' : ''}`}>
                <span className="habit-icon" style={{ background: habit.color }}><Icon name={habit.icon} size={20} /></span>
                <div>
                  <strong>{habit.name}</strong>
                  <small>{data.categories.find((cat) => cat.id === habit.categoryId)?.name} · {habit.targetCount} {habit.unit} · {habit.difficulty} · {habit.xpReward} XP</small>
                  <div className="mini-stats"><span><Flame size={14} /> {streak.current} current</span><span>{streak.best} best</span><span>{rate}% 30d rate</span></div>
                </div>
                <div className="row-actions">
                  <button className="icon-btn" title="Complete" onClick={() => completeHabit(habit.id, habit.targetCount)}><Check size={17} /></button>
                  <button className="icon-btn" title="Increment count" onClick={() => completeHabit(habit.id, 1)}><Plus size={17} /></button>
                  <button className="icon-btn" title="Skip without breaking streak" onClick={() => completeHabit(habit.id, 0, true)}>Skip</button>
                  <button className="icon-btn" title="Pause" onClick={() => setStatus(habit.id, habit.status === 'paused' ? 'active' : 'paused')}><Pause size={17} /></button>
                  <button className="icon-btn" title="Archive" onClick={() => setStatus(habit.id, 'archived')}><Archive size={17} /></button>
                  <button className="icon-btn danger" title="Delete" onClick={() => window.confirm('Delete this habit and its history?') && Promise.all([db.habits.delete(habit.id), db.habitCompletions.where('habitId').equals(habit.id).delete()]).then(() => toast('Habit deleted.'))}><Trash2 size={17} /></button>
                </div>
              </article>
            );
          })}
          {!habits.length ? <div className="empty-state">No habits match this filter. Create a tiny one. Tiny counts.</div> : null}
        </div>
      </section>
    </main>
  );
}

function todayDone(completions: { habitId: string; date: string; skipped?: boolean }[], habitId: string) {
  return completions.some((completion) => completion.habitId === habitId && completion.date === todayKey() && !completion.skipped);
}
