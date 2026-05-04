import type { BackupPayload } from '../types';

export function downloadBlob(filename: string, contents: BlobPart, type = 'application/json') {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function toCsv<T extends Record<string, unknown>>(rows: T[]) {
  if (!rows.length) return '';
  const keys = Array.from(rows.reduce((set, row) => {
    Object.keys(row).forEach((key) => set.add(key));
    return set;
  }, new Set<string>()));
  const escape = (value: unknown) => {
    const text = Array.isArray(value) || typeof value === 'object' ? JSON.stringify(value ?? '') : String(value ?? '');
    return `"${text.replaceAll('"', '""')}"`;
  };
  return [keys.join(','), ...rows.map((row) => keys.map((key) => escape(row[key])).join(','))].join('\n');
}

export function backupSummary(payload: BackupPayload) {
  return {
    habits: payload.habits?.length ?? 0,
    habitCompletions: payload.habitCompletions?.length ?? 0,
    timeEntries: payload.timeEntries?.length ?? 0,
    todoItems: payload.todoItems?.length ?? 0,
    timetableBlocks: payload.timetableBlocks?.length ?? 0,
    metricDefinitions: payload.metricDefinitions?.length ?? 0,
    metricLogs: payload.metricLogs?.length ?? 0,
    achievements: payload.achievements?.length ?? 0,
    exportedAt: payload.exportedAt,
    schemaVersion: payload.schemaVersion,
  };
}
