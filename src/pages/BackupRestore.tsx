import { useState } from 'react';
import { Download, FileSpreadsheet, Trash2, Upload } from 'lucide-react';
import { db, exportAllData, importBackup } from '../db/lifexpDb';
import { useLifeData } from '../hooks/useLifeData';
import { backupSummary, downloadBlob, toCsv } from '../utils/export';
import { useToast } from '../components/Toast';
import type { BackupPayload } from '../types';

export function BackupRestore() {
  const data = useLifeData();
  const toast = useToast();
  const [preview, setPreview] = useState<ReturnType<typeof backupSummary> | null>(null);
  const [payload, setPayload] = useState<BackupPayload | null>(null);
  const [mode, setMode] = useState<'merge' | 'replace'>('merge');
  if (!data?.settings) return null;

  const exportBackup = async () => {
    const backup = await exportAllData();
    downloadBlob(`lifexp-backup-${backup.exportedAt.slice(0, 10)}.json`, JSON.stringify(backup, null, 2));
    await db.settings.update('settings', { lastBackupAt: backup.exportedAt });
    toast('Full LifeXP backup downloaded.');
  };

  const importFile = async (file?: File) => {
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text()) as BackupPayload;
      setPreview(backupSummary(parsed));
      setPayload(parsed);
      toast('Import preview ready.', 'info');
    } catch {
      toast('That file is not a valid LifeXP JSON backup.', 'warning');
    }
  };

  const applyImport = async () => {
    if (!payload) return;
    const backup = await exportAllData();
    downloadBlob(`lifexp-before-import-${backup.exportedAt.slice(0, 10)}.json`, JSON.stringify(backup, null, 2));
    await importBackup(payload, mode);
    toast(`Backup imported with ${mode} mode.`);
    setPayload(null);
    setPreview(null);
  };

  const exportCsv = async (name: keyof BackupPayload) => {
    const backup = await exportAllData();
    const rows = backup[name];
    if (!Array.isArray(rows)) return;
    downloadBlob(`lifexp-${name}.csv`, toCsv(rows as unknown as Record<string, unknown>[]), 'text/csv');
    toast(`${name} CSV exported.`);
  };

  const clearAll = async () => {
    const phrase = window.prompt('Type DELETE LIFEXP DATA to clear every local record.');
    if (phrase !== 'DELETE LIFEXP DATA') return toast('Clear cancelled.', 'info');
    await db.delete();
    window.location.reload();
  };

  return (
    <main className="page-grid">
      <section className="panel span-2">
        <div className="panel-title">
          <div><h2>Data Backup / Restore</h2><p>LifeXP never traps your data. Export everything as JSON or individual CSVs.</p></div>
        </div>
        <div className="backup-hero">
          <div><strong>Last backup</strong><span>{data.settings.lastBackupAt ? data.settings.lastBackupAt.slice(0, 10) : 'Not yet'}</span></div>
          <button className="btn primary" onClick={exportBackup}><Download size={16} /> Full backup download</button>
        </div>
      </section>

      <section className="panel">
        <div className="panel-title"><div><h3>Restore from backup</h3><p>Preview first, then merge or replace.</p></div></div>
        <label className="file-drop">
          <Upload size={24} />
          <span>Select LifeXP JSON backup</span>
          <input type="file" accept="application/json" onChange={(e) => importFile(e.target.files?.[0])} />
        </label>
        {preview ? (
          <div className="import-preview">
            <pre>{JSON.stringify(preview, null, 2)}</pre>
            <label>Import mode<select value={mode} onChange={(e) => setMode(e.target.value as 'merge' | 'replace')}><option value="merge">Merge with current data</option><option value="replace">Replace current data</option></select></label>
            <button className="btn primary" onClick={applyImport}>Apply import</button>
          </div>
        ) : null}
      </section>

      <section className="panel">
        <div className="panel-title"><div><h3>CSV exports</h3><p>Open your records in spreadsheets.</p></div></div>
        <div className="action-grid">
          {['habits', 'habitCompletions', 'timeEntries', 'todoItems', 'timetableBlocks', 'metricDefinitions', 'metricLogs', 'achievements', 'reports'].map((name) => (
            <button key={name} className="quick-action" onClick={() => exportCsv(name as keyof BackupPayload)}><FileSpreadsheet /> {name}</button>
          ))}
        </div>
      </section>

      <section className="panel danger-zone">
        <div className="panel-title"><div><h3>Danger zone</h3><p>Strong confirmation required.</p></div></div>
        <button className="btn danger" onClick={clearAll}><Trash2 size={16} /> Clear all local data</button>
      </section>
    </main>
  );
}
