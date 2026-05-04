import { useState, type FormEvent } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Plus, Search, Trash2 } from 'lucide-react';
import { db, addXP, updateStats, uuid } from '../db/lifexpDb';
import { useLifeData } from '../hooks/useLifeData';
import { Icon } from '../components/Icon';
import { useToast } from '../components/Toast';
import type { MetricLogMode, MetricType } from '../types';
import { metricTrend } from '../utils/analytics';
import { todayKey } from '../utils/dates';

export function LifeMetrics() {
  const data = useLifeData();
  const toast = useToast();
  const [selected, setSelected] = useState<string>('');
  const [query, setQuery] = useState('');
  const [logValue, setLogValue] = useState('1');
  const [note, setNote] = useState('');
  const [definition, setDefinition] = useState({ name: '', type: 'number' as MetricType, unit: 'times', logMode: 'both' as MetricLogMode, categoryId: '', icon: 'Activity', color: '#14b8a6' });
  if (!data) return null;

  const metrics = data.metricDefinitions.filter((metric) => !metric.archived && metric.name.toLowerCase().includes(query.toLowerCase()));
  const activeMetric = metrics.find((metric) => metric.id === (selected || metrics[0]?.id));
  const todayLogs = data.metricLogs.filter((log) => log.date === todayKey());
  const trend = activeMetric ? metricTrend(activeMetric, data.metricLogs.slice().reverse()) : [];

  const quickLog = async (metricId: string, value: number | string = 1) => {
    const metric = data.metricDefinitions.find((item) => item.id === metricId);
    if (!metric) return;
    await db.metricLogs.add({
      id: uuid('ml_'),
      metricId,
      timestamp: new Date().toISOString(),
      date: todayKey(),
      value,
      note: '',
      tags: metric.logMode === 'event' || metric.logMode === 'both' ? ['event'] : ['daily-summary'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await addXP(8, 'metric', metricId, `Logged ${metric.name}`);
    await updateStats({ metricsLogged: (data.stats?.metricsLogged ?? 0) + 1 });
    toast(`${metric.name} logged.`);
  };

  const saveLog = async (event: FormEvent) => {
    event.preventDefault();
    if (!activeMetric) return;
    const value = activeMetric.type === 'boolean' ? logValue === 'true' : activeMetric.type === 'text' ? logValue : Number(logValue);
    await db.metricLogs.add({
      id: uuid('ml_'),
      metricId: activeMetric.id,
      timestamp: new Date().toISOString(),
      date: todayKey(),
      value,
      note,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await addXP(10, 'metric', activeMetric.id, `Logged ${activeMetric.name}`);
    await updateStats({ metricsLogged: (data.stats?.metricsLogged ?? 0) + 1 });
    setNote('');
    toast(`${activeMetric.name} saved.`);
  };

  const createMetric = async (event: FormEvent) => {
    event.preventDefault();
    if (!definition.name.trim()) return toast('Metric name is required.', 'warning');
    await db.metricDefinitions.add({
      id: uuid('metric_'),
      name: definition.name.trim(),
      description: '',
      categoryId: definition.categoryId || data.categories.find((category) => category.name === 'Body Metrics')?.id || data.categories[0]?.id,
      type: definition.type,
      unit: definition.unit,
      icon: definition.icon,
      color: definition.color,
      goalDirection: 'none',
      quickLogEnabled: true,
      logMode: definition.logMode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      archived: false,
    });
    setDefinition((current) => ({ ...current, name: '' }));
    toast('Metric created.');
  };

  const metricCounts = metrics.map((metric) => ({
    ...metric,
    count: data.metricLogs.filter((log) => log.metricId === metric.id).length,
    today: todayLogs.filter((log) => log.metricId === metric.id).length,
  }));

  return (
    <main className="page-grid">
      <section className="panel span-2">
        <div className="panel-title">
          <div><h2>Life Metrics</h2><p>Track anything: weight, sleep, mood, water, caffeine, symptoms, expenses, pages, coding time, or private body metrics.</p></div>
        </div>
        <form className="form-grid" onSubmit={createMetric}>
          <label>Metric name<input value={definition.name} onChange={(e) => setDefinition({ ...definition, name: e.target.value })} placeholder="Headache" /></label>
          <label>Type<select value={definition.type} onChange={(e) => setDefinition({ ...definition, type: e.target.value as MetricType })}><option>number</option><option>scale</option><option>rating</option><option>boolean</option><option>text</option><option>duration</option><option>time</option></select></label>
          <label>Unit<input value={definition.unit} onChange={(e) => setDefinition({ ...definition, unit: e.target.value })} /></label>
          <label>Log mode<select value={definition.logMode} onChange={(e) => setDefinition({ ...definition, logMode: e.target.value as MetricLogMode })}><option value="event">Event count</option><option value="dailySummary">Daily summary</option><option value="both">Both</option></select></label>
          <label>Category<select value={definition.categoryId} onChange={(e) => setDefinition({ ...definition, categoryId: e.target.value })}>{data.categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}</select></label>
          <button className="btn primary"><Plus size={16} /> Add metric</button>
        </form>
      </section>

      <section className="panel">
        <div className="toolbar"><label className="search"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search metrics" /></label></div>
        <div className="metric-list">
          {metricCounts.map((metric) => (
            <button key={metric.id} className={`metric-row ${activeMetric?.id === metric.id ? 'active' : ''}`} onClick={() => setSelected(metric.id)}>
              <span className="habit-icon" style={{ background: metric.color }}><Icon name={metric.icon} size={18} /></span>
              <span><strong>{metric.name}</strong><small>{metric.today} today · {metric.count} total · {metric.logMode}</small></span>
              <button className="icon-btn" onClick={(event) => { event.stopPropagation(); quickLog(metric.id, metric.name === 'Poop frequency' ? 1 : 1); }}>+1</button>
            </button>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-title"><div><h3>{activeMetric?.name ?? 'Select a metric'}</h3><p>Event-style and daily-summary tracking are both supported.</p></div></div>
        {activeMetric ? (
          <>
            <form className="log-form" onSubmit={saveLog}>
              <label>Value<input value={logValue} onChange={(e) => setLogValue(e.target.value)} /></label>
              <label>Note<input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional context" /></label>
              <button className="btn primary">Save log</button>
            </form>
            <ResponsiveContainer width="100%" height={230}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke={activeMetric.color} strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </>
        ) : <div className="empty-state">Choose or create a metric.</div>}
      </section>

      <section className="panel span-2">
        <div className="panel-title"><div><h3>Today’s metric logs</h3><p>Mundane tracking is normal here. Private data deserves useful tools.</p></div></div>
        <div className="timeline-list">
          {todayLogs.map((log) => {
            const metric = data.metricDefinitions.find((item) => item.id === log.metricId);
            return (
              <article key={log.id} className="card-row">
                <span className="color-dot" style={{ background: metric?.color }} />
                <div><strong>{metric?.name}</strong><small>{String(log.value)} {metric?.unit} · {log.note || 'No note'}</small></div>
                <button className="icon-btn danger" onClick={() => db.metricLogs.delete(log.id).then(() => toast('Metric log deleted.'))}><Trash2 size={17} /></button>
              </article>
            );
          })}
          {!todayLogs.length ? <div className="empty-state">No metrics today. Weight once, water +1, mood check, poop frequency: all valid signal.</div> : null}
        </div>
      </section>
    </main>
  );
}
