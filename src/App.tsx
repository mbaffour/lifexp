import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import { ensureBootstrap } from './db/lifexpDb';
import { useLifeData } from './hooks/useLifeData';
import { Achievements } from './pages/Achievements';
import { Analytics } from './pages/Analytics';
import { BackupRestore } from './pages/BackupRestore';
import { Calendar } from './pages/Calendar';
import { Dashboard } from './pages/Dashboard';
import { Feedback } from './pages/Feedback';
import { FocusMode } from './pages/FocusMode';
import { Guide } from './pages/Guide';
import { Habits } from './pages/Habits';
import { Landing } from './pages/Landing';
import { LifeMetrics } from './pages/LifeMetrics';
import { Planner } from './pages/Planner';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { Setup } from './pages/Setup';
import { TimeTracker } from './pages/TimeTracker';

export default function App() {
  useEffect(() => {
    ensureBootstrap();
  }, []);

  return (
    <ErrorBoundary>
      <ToastProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/guide" element={<Guide />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/app" element={<RequireSetup><AppShell /></RequireSetup>}>
              <Route index element={<Dashboard />} />
              <Route path="planner" element={<Planner />} />
              <Route path="habits" element={<Habits />} />
              <Route path="time" element={<TimeTracker />} />
              <Route path="focus" element={<FocusMode />} />
              <Route path="metrics" element={<LifeMetrics />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="achievements" element={<Achievements />} />
              <Route path="reports" element={<Reports />} />
              <Route path="backup" element={<BackupRestore />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </ToastProvider>
    </ErrorBoundary>
  );
}

function RequireSetup({ children }: { children: ReactNode }) {
  const data = useLifeData();
  useEffect(() => {
    if (data?.settings?.theme) document.documentElement.dataset.theme = data.settings.theme;
    if (data?.settings?.accentColor) document.documentElement.style.setProperty('--accent', data.settings.accentColor);
  }, [data?.settings?.theme, data?.settings?.accentColor]);

  if (!data) return <main className="setup-screen"><div className="loader">Loading LifeXP...</div></main>;
  if (!data.settings?.setupComplete) return <Setup />;
  return children;
}
