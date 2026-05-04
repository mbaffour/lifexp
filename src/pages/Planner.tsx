import { useState, type FormEvent } from 'react';
import { CalendarClock, CheckCircle2, Circle, Flag, ListChecks, Plus, SkipForward, Trash2 } from 'lucide-react';
import { db, addXP, uuid } from '../db/lifexpDb';
import { useLifeData } from '../hooks/useLifeData';
import { Icon } from '../components/Icon';
import { useToast } from '../components/Toast';
import type { TimetableBlock, TodoItem, TodoPriority } from '../types';
import { todayKey } from '../utils/dates';

const priorityXp: Record<TodoPriority, number> = {
  low: 15,
  normal: 25,
  high: 40,
  urgent: 60,
};

export function Planner() {
  const data = useLifeData();
  const toast = useToast();
  const [todoForm, setTodoForm] = useState({
    title: '',
    description: '',
    dueDate: todayKey(),
    categoryId: '',
    priority: 'normal' as TodoPriority,
    checklist: '',
  });
  const [blockForm, setBlockForm] = useState({
    title: '',
    description: '',
    date: todayKey(),
    startTime: '09:00',
    endTime: '10:00',
    categoryId: '',
    todoId: '',
  });
  const [filter, setFilter] = useState<'today' | 'open' | 'done' | 'all'>('today');

  if (!data) return null;

  const fallbackCategoryId = data.categories[0]?.id ?? '';
  const today = todayKey();
  const todos = data.todoItems;
  const blocks = data.timetableBlocks;
  const todayTodos = todos.filter((todo) => todo.dueDate === today || todo.scheduledDate === today);
  const openTodos = todos.filter((todo) => todo.status !== 'completed' && todo.status !== 'archived');
  const completedToday = todos.filter((todo) => todo.completedAt?.slice(0, 10) === today);
  const todayBlocks = blocks.filter((block) => block.date === today).sort((a, b) => a.startTime.localeCompare(b.startTime));
  const doneBlocksToday = todayBlocks.filter((block) => block.status === 'completed');
  const plannerProgress = Math.round(((completedToday.length + doneBlocksToday.length) / Math.max(1, todayTodos.length + todayBlocks.length)) * 100);

  const visibleTodos = todos
    .filter((todo) => {
      if (filter === 'today') return todo.dueDate === today || todo.scheduledDate === today;
      if (filter === 'open') return todo.status !== 'completed' && todo.status !== 'archived';
      if (filter === 'done') return todo.status === 'completed';
      return todo.status !== 'archived';
    })
    .sort((a, b) => statusRank(a) - statusRank(b) || priorityRank(b.priority) - priorityRank(a.priority));

  const createTodo = async (event: FormEvent) => {
    event.preventDefault();
    if (!todoForm.title.trim()) return toast('Give the task a title first.', 'warning');
    const duplicate = openTodos.some((todo) => todo.title.toLowerCase() === todoForm.title.trim().toLowerCase());
    if (duplicate && !window.confirm('You already have an open task with this title. Create another anyway?')) return;
    const xpReward = priorityXp[todoForm.priority];
    await db.todoItems.add({
      id: uuid('todo_'),
      title: todoForm.title.trim(),
      description: todoForm.description.trim(),
      categoryId: todoForm.categoryId || fallbackCategoryId,
      dueDate: todoForm.dueDate,
      scheduledDate: todoForm.dueDate,
      priority: todoForm.priority,
      status: 'open',
      checklist: todoForm.checklist.split('\n').map((item) => item.trim()).filter(Boolean),
      completedChecklist: [],
      tags: [],
      xpReward,
      coinReward: Math.max(1, Math.floor(xpReward / 10)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setTodoForm((current) => ({ ...current, title: '', description: '', checklist: '' }));
    toast(`To-do added. ${xpReward} XP is waiting.`);
  };

  const createBlock = async (event: FormEvent) => {
    event.preventDefault();
    if (!blockForm.title.trim()) return toast('Name the timetable block first.', 'warning');
    if (toMinutes(blockForm.endTime) <= toMinutes(blockForm.startTime)) return toast('End time must be after start time.', 'warning');
    const overlaps = blocks.some((block) =>
      block.date === blockForm.date &&
      block.status === 'planned' &&
      toMinutes(blockForm.startTime) < toMinutes(block.endTime) &&
      toMinutes(blockForm.endTime) > toMinutes(block.startTime),
    );
    if (overlaps && !window.confirm('This overlaps another planned block. Add it anyway?')) return;
    const duration = toMinutes(blockForm.endTime) - toMinutes(blockForm.startTime);
    await db.timetableBlocks.add({
      id: uuid('block_'),
      title: blockForm.title.trim(),
      description: blockForm.description.trim(),
      categoryId: blockForm.categoryId || fallbackCategoryId,
      date: blockForm.date,
      startTime: blockForm.startTime,
      endTime: blockForm.endTime,
      todoIds: blockForm.todoId ? [blockForm.todoId] : [],
      repeat: 'none',
      status: 'planned',
      xpReward: Math.max(15, Math.round(duration / 2)),
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setBlockForm((current) => ({ ...current, title: '', description: '', todoId: '' }));
    toast('Timetable block added.');
  };

  const completeTodo = async (todo: TodoItem) => {
    if (todo.status === 'completed') return;
    await db.todoItems.update(todo.id, {
      status: 'completed',
      completedChecklist: todo.checklist,
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await addXP(todo.xpReward, 'todo', todo.id, `Completed to-do: ${todo.title}`);
    toast(`${todo.title} complete. +${todo.xpReward} XP`);
  };

  const toggleChecklist = async (todo: TodoItem, item: string) => {
    const completed = new Set(todo.completedChecklist);
    if (completed.has(item)) completed.delete(item);
    else completed.add(item);
    await db.todoItems.update(todo.id, {
      completedChecklist: Array.from(completed),
      status: completed.size > 0 ? 'inProgress' : 'open',
      updatedAt: new Date().toISOString(),
    });
  };

  const finishBlock = async (block: TimetableBlock, status: 'completed' | 'skipped') => {
    await db.timetableBlocks.update(block.id, {
      status,
      completedAt: status === 'completed' ? new Date().toISOString() : undefined,
      actualMinutes: status === 'completed' ? toMinutes(block.endTime) - toMinutes(block.startTime) : undefined,
      updatedAt: new Date().toISOString(),
    });
    if (status === 'completed') {
      await addXP(block.xpReward, 'timetable', block.id, `Completed timetable block: ${block.title}`);
      toast(`${block.title} done. +${block.xpReward} XP`);
    } else {
      toast(`${block.title} skipped without drama.`, 'info');
    }
  };

  return (
    <main className="page-grid">
      <section className="panel planner-hero span-2">
        <div>
          <p className="micro">Plans become quests</p>
          <h2>Timetable and to-do list</h2>
          <p>Schedule your day, attach tasks to time blocks, mark things off, and earn XP for actually doing the plan.</p>
        </div>
        <div className="planner-progress" aria-label={`${plannerProgress}% planner progress today`}>
          <strong>{plannerProgress}%</strong>
          <span>today planned progress</span>
          <div className="xp-track"><span style={{ width: `${plannerProgress}%` }} /></div>
        </div>
      </section>

      <section className="panel planner-stat">
        <ListChecks />
        <strong>{openTodos.length}</strong>
        <span>open to-dos</span>
      </section>
      <section className="panel planner-stat">
        <CalendarClock />
        <strong>{todayBlocks.length}</strong>
        <span>blocks today</span>
      </section>
      <section className="panel planner-stat">
        <CheckCircle2 />
        <strong>{completedToday.length + doneBlocksToday.length}</strong>
        <span>planner wins today</span>
      </section>

      <section className="panel span-2">
        <div className="panel-title">
          <div><h3>Create a to-do quest</h3><p>Priority sets the XP reward. Checklist steps make big tasks less slippery.</p></div>
        </div>
        <form className="form-grid planner-form" onSubmit={createTodo}>
          <label>Task title<input value={todoForm.title} onChange={(e) => setTodoForm({ ...todoForm, title: e.target.value })} placeholder="Finish results figure" /></label>
          <label>Due date<input type="date" value={todoForm.dueDate} onChange={(e) => setTodoForm({ ...todoForm, dueDate: e.target.value })} /></label>
          <label>Category<select value={todoForm.categoryId || fallbackCategoryId} onChange={(e) => setTodoForm({ ...todoForm, categoryId: e.target.value })}>{data.categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}</select></label>
          <label>Priority<select value={todoForm.priority} onChange={(e) => setTodoForm({ ...todoForm, priority: e.target.value as TodoPriority })}><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select></label>
          <label>Description<input value={todoForm.description} onChange={(e) => setTodoForm({ ...todoForm, description: e.target.value })} placeholder="Optional context" /></label>
          <label>Checklist<textarea value={todoForm.checklist} onChange={(e) => setTodoForm({ ...todoForm, checklist: e.target.value })} placeholder={'One step per line'} /></label>
          <button className="btn primary"><Plus size={16} /> Add to-do</button>
        </form>
      </section>

      <section className="panel">
        <div className="panel-title"><div><h3>Create a timetable block</h3><p>Warns on overlapping planned blocks.</p></div></div>
        <form className="planner-block-form" onSubmit={createBlock}>
          <label>Block title<input value={blockForm.title} onChange={(e) => setBlockForm({ ...blockForm, title: e.target.value })} placeholder="Deep work" /></label>
          <label>Date<input type="date" value={blockForm.date} onChange={(e) => setBlockForm({ ...blockForm, date: e.target.value })} /></label>
          <div className="settings-row">
            <label>Start<input type="time" value={blockForm.startTime} onChange={(e) => setBlockForm({ ...blockForm, startTime: e.target.value })} /></label>
            <label>End<input type="time" value={blockForm.endTime} onChange={(e) => setBlockForm({ ...blockForm, endTime: e.target.value })} /></label>
          </div>
          <label>Category<select value={blockForm.categoryId || fallbackCategoryId} onChange={(e) => setBlockForm({ ...blockForm, categoryId: e.target.value })}>{data.categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}</select></label>
          <label>Attach to-do<select value={blockForm.todoId} onChange={(e) => setBlockForm({ ...blockForm, todoId: e.target.value })}><option value="">No linked task</option>{openTodos.map((todo) => <option key={todo.id} value={todo.id}>{todo.title}</option>)}</select></label>
          <label>Notes<input value={blockForm.description} onChange={(e) => setBlockForm({ ...blockForm, description: e.target.value })} placeholder="Optional plan" /></label>
          <button className="btn primary"><Plus size={16} /> Add block</button>
        </form>
      </section>

      <section className="panel span-2">
        <div className="panel-title">
          <div><h3>To-do quests</h3><p>Mark tasks and checklist steps off for a satisfying little XP hit.</p></div>
          <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
            <option value="today">Today</option>
            <option value="open">Open</option>
            <option value="done">Done</option>
            <option value="all">All</option>
          </select>
        </div>
        <div className="todo-list">
          {visibleTodos.map((todo) => {
            const category = data.categories.find((cat) => cat.id === todo.categoryId);
            const checklistProgress = Math.round((todo.completedChecklist.length / Math.max(1, todo.checklist.length)) * 100);
            return (
              <article key={todo.id} className={`todo-card ${todo.status === 'completed' ? 'complete' : ''}`}>
                <button className="todo-check" onClick={() => completeTodo(todo)} aria-label={`Complete ${todo.title}`}>
                  {todo.status === 'completed' ? <CheckCircle2 /> : <Circle />}
                </button>
                <div>
                  <div className="todo-heading">
                    <span className="habit-icon" style={{ background: category?.color ?? 'var(--accent)' }}><Icon name={category?.icon ?? 'ListChecks'} size={17} /></span>
                    <div>
                      <strong>{todo.title}</strong>
                      <small>{category?.name ?? 'Uncategorized'} · {todo.priority} · {todo.xpReward} XP · due {todo.dueDate ?? 'someday'}</small>
                    </div>
                  </div>
                  {todo.description ? <p>{todo.description}</p> : null}
                  {todo.checklist.length ? (
                    <div className="checklist">
                      <div className="xp-track"><span style={{ width: `${checklistProgress}%` }} /></div>
                      {todo.checklist.map((item) => (
                        <button key={item} onClick={() => toggleChecklist(todo, item)} className={todo.completedChecklist.includes(item) ? 'checked' : ''}>
                          <CheckCircle2 size={15} /> {item}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <button className="icon-btn danger" onClick={() => window.confirm('Delete this to-do?') && db.todoItems.delete(todo.id).then(() => toast('To-do deleted.'))} title="Delete to-do"><Trash2 size={17} /></button>
              </article>
            );
          })}
          {!visibleTodos.length ? <div className="empty-state">No to-dos in this view. Add one tiny quest and future-you gets a cleaner map.</div> : null}
        </div>
      </section>

      <section className="panel">
        <div className="panel-title"><div><h3>Today timetable</h3><p>Your day as a game board.</p></div></div>
        <div className="timetable-list">
          {todayBlocks.map((block) => {
            const category = data.categories.find((cat) => cat.id === block.categoryId);
            const linkedTodos = block.todoIds.map((todoId) => data.todoItems.find((todo) => todo.id === todoId)?.title).filter(Boolean);
            return (
              <article key={block.id} className={`time-block ${block.status}`}>
                <div className="time-window"><strong>{block.startTime}</strong><span>{block.endTime}</span></div>
                <div>
                  <strong>{block.title}</strong>
                  <small>{category?.name ?? 'Uncategorized'} · {block.xpReward} XP</small>
                  {block.description ? <p>{block.description}</p> : null}
                  {linkedTodos.length ? <span className="linked-task"><Flag size={13} /> {linkedTodos.join(', ')}</span> : null}
                </div>
                <div className="row-actions">
                  <button className="icon-btn" onClick={() => finishBlock(block, 'completed')} title="Complete block"><CheckCircle2 size={17} /></button>
                  <button className="icon-btn" onClick={() => finishBlock(block, 'skipped')} title="Skip block"><SkipForward size={17} /></button>
                  <button className="icon-btn danger" onClick={() => window.confirm('Delete this timetable block?') && db.timetableBlocks.delete(block.id).then(() => toast('Block deleted.'))} title="Delete block"><Trash2 size={17} /></button>
                </div>
              </article>
            );
          })}
          {!todayBlocks.length ? <div className="empty-state">No timetable blocks today. Add one focused block and turn time into a quest.</div> : null}
        </div>
      </section>
    </main>
  );
}

function toMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function priorityRank(priority: TodoPriority) {
  return { low: 1, normal: 2, high: 3, urgent: 4 }[priority];
}

function statusRank(todo: TodoItem) {
  return todo.status === 'completed' ? 2 : todo.status === 'inProgress' ? 0 : 1;
}
