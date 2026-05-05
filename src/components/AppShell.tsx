import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  BarChart3, CalendarDays, ChevronLeft, ChevronRight, DatabaseBackup,
  Flame, Gauge, ListChecks, LineChart,
  NotebookText, RotateCcw, Settings, ShieldCheck,
  Sparkles, Timer, Trophy,
} from 'lucide-react';
import { undoLastAction } from '../db/lifexpDb';
import { useLifeData } from '../hooks/useLifeData';
import { getLevelInfo } from '../utils/gamification';
import { useToast } from './Toast';
import { XPBar } from './XPBar';

const nav = [
  { to: '/app', label: 'Dashboard', icon: Gauge, end: true },
  { to: '/app/planner', label: 'Planner', icon: ListChecks },
  { to: '/app/habits', label: 'Habits', icon: Flame },
  { to: '/app/time', label: 'Time', icon: Timer },
  { to: '/app/focus', label: 'Focus', icon: Sparkles },
  { to: '/app/metrics', label: 'Metrics', icon: LineChart },
  { to: '/app/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/app/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/app/achievements', label: 'Awards', icon: Trophy },
  { to: '/app/reports', label: 'Reports', icon: NotebookText },
  { to: '/app/backup', label: 'Backup', icon: DatabaseBackup },
  { to: '/app/settings', label: 'Settings', icon: Settings },
];

const SIDEBAR_KEY = 'lifexp_sidebar_collapsed';

export function AppShell() {
  const data = useLifeData();
  const toast = useToast();
  const navigate = useNavigate();
  const profile = data?.profile;
  const stats = data?.stats;
  const levelInfo = stats ? getLevelInfo(stats.totalXP) : null;

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try { return localStorage.getItem(SIDEBAR_KEY) === 'true'; } catch { return false; }
  });

  const toggleSidebar = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem(SIDEBAR_KEY, String(next)); } catch { /* noop */ }
      return next;
    });
  };

  const undo = async () => {
    const result = await undoLastAction();
    toast(result.message, result.undone ? 'info' : 'warning');
  };

  /* Global Ctrl+Z / Cmd+Z undo shortcut */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        const active = document.activeElement;
        const isInput = active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement || active instanceof HTMLSelectElement;
        if (!isInput) {
          e.preventDefault();
          undo();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`app-shell${collapsed ? ' sidebar-collapsed' : ''}`}>
      <aside className="sidebar">
        {/* Brand row with toggle */}
        <div className="brand-row">
          {!collapsed ? (
            <button className="brand-block" onClick={() => navigate('/')} aria-label="Go to LifeXP landing page">
              <span className="brand-mark">XP</span>
              <span>
                <strong>LifeXP</strong>
                <small>Track your life. Level it up.</small>
              </span>
            </button>
          ) : (
            <button className="brand-block" onClick={() => navigate('/')} aria-label="Go to LifeXP landing page" style={{ margin: '0 auto' }}>
              <span className="brand-mark">XP</span>
            </button>
          )}
          <button
            className="sidebar-toggle"
            onClick={toggleSidebar}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        </div>

        <nav className="desktop-nav" aria-label="LifeXP navigation">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? 'active' : '')}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={17} />
              {!collapsed ? <span>{item.label}</span> : null}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          {!collapsed && stats ? <XPBar totalXP={stats.totalXP} /> : null}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', gap: '.5rem' }}>
            <div className="privacy-chip" title="All data is stored locally">
              <ShieldCheck size={15} />
              {!collapsed ? <span>Local only</span> : null}
            </div>
            {stats && stats.currentStreak > 0 ? (
              <div className="privacy-chip" style={{ color: '#f97316' }} title={`${stats.currentStreak}-day streak`}>
                <Flame size={15} />
                {!collapsed ? <span>{stats.currentStreak}d</span> : null}
              </div>
            ) : null}
          </div>
        </div>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <div>
            <p className="micro">Every tiny action counts.</p>
            <h1>Welcome back{profile?.displayName ? `, ${profile.displayName}` : ''}</h1>
          </div>
          <div className="topbar-actions">
            <button className="btn small ghost" onClick={undo} title="Undo last action (Ctrl+Z)">
              <RotateCcw size={14} />
              Undo
            </button>
            <div className="profile-pill">
              <span>{profile?.avatar ?? '🧭'}</span>
              <div>
                <strong style={{ display: 'flex', alignItems: 'center', gap: '.35rem' }}>
                  {levelInfo ? (
                    <span className="level-badge small" title={`Level ${levelInfo.level}`}>
                      {levelInfo.level}
                    </span>
                  ) : null}
                  {stats?.currentRank ?? 'Newcomer'}
                </strong>
                <small>{stats?.coins ?? 0} coins · {stats?.gems ?? 0} gems</small>
              </div>
            </div>
          </div>
        </header>
        <Outlet />
      </div>

      {/* Mobile nav - shown at bottom on small screens */}
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {nav.slice(0, 5).map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} aria-label={item.label}>
            <item.icon size={19} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
