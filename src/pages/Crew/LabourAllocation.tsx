import React, { useState } from 'react';
import { useWorkers } from '../../hooks/useWorkers';
import { useScheduleJobs } from '../../hooks/useScheduleJobs';
import { useWeeklySchedule } from '../../hooks/useWeeklySchedule';

const DAY_LABELS: Record<string, string> = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
};

function formatWeek(weekStart: string): string {
  const d = new Date(weekStart);
  return d.toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function LabourAllocation() {
  const [stateFilter, setStateFilter] = useState<'NSW' | 'VIC' | 'WA' | 'QLD'>('NSW');
  const { workers } = useWorkers();
  const { jobs } = useScheduleJobs(stateFilter);
  const { availableWeeks, selectedWeek, setSelectedWeek, rows, loading, dayKeys } = useWeeklySchedule(stateFilter);

  const stateWorkers = workers.filter((w) => w.state === stateFilter);
  const jobByCode = new Map(jobs.map((j) => [j.code, j]));
  const rowsByWorker = new Map(rows.map((r) => [r.worker_id, r]));

  // Quick headcount per job code for the selected week, for a glance at coverage
  const headcountByCode: Record<string, number> = {};
  rows.forEach((r) => {
    dayKeys.forEach((day) => {
      const code = r.days?.[day];
      if (code && code !== 'U') {
        headcountByCode[code] = (headcountByCode[code] ?? 0) + 1;
      }
    });
  });

  return (
    <div className="app-content">
      <div className="page-header">
        <div className="page-header-subtitle">Crew</div>
        <div className="page-header-title">Weekly Roster</div>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {(['NSW', 'VIC', 'WA', 'QLD'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStateFilter(s)}
            style={{
              flex: 1,
              padding: '8px 4px',
              borderRadius: 8,
              border: stateFilter === s ? '1px solid var(--color-primary)' : '0.5px solid var(--color-border)',
              background: stateFilter === s ? 'var(--color-primary-light)' : '#fff',
              color: stateFilter === s ? 'var(--color-primary)' : '#555',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {availableWeeks.length > 0 && (
        <select
          value={selectedWeek ?? ''}
          onChange={(e) => setSelectedWeek(e.target.value)}
          style={{ width: '100%', padding: 10, borderRadius: 8, border: '0.5px solid var(--color-border)', fontSize: 13, marginBottom: 16 }}
        >
          {availableWeeks.map((w) => (
            <option key={w} value={w}>Week of {formatWeek(w)}</option>
          ))}
        </select>
      )}

      {loading && <div className="empty-state">Loading roster…</div>}
      {!loading && availableWeeks.length === 0 && (
        <div className="empty-state">No roster published for {stateFilter} yet.</div>
      )}

      {!loading && jobs.length > 0 && (
        <>
          <div className="section-title">Coverage this week</div>
          <div className="card" style={{ marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {jobs.map((j) => (
              <div key={j.code} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, background: j.color + '33' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: j.color }} />
                <span style={{ fontSize: 11, fontWeight: 600 }}>{j.name}</span>
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{headcountByCode[j.code] ?? 0}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="section-title">Roster — {stateFilter}</div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '8px 6px', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: 11 }}>Worker</th>
              {dayKeys.map((d) => (
                <th key={d} style={{ padding: '8px 6px', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: 11 }}>{DAY_LABELS[d]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stateWorkers.map((w) => {
              const schedule = rowsByWorker.get(w.id);
              return (
                <tr key={w.id} style={{ borderTop: '0.5px solid var(--color-border)' }}>
                  <td style={{ padding: '8px 6px', fontWeight: 600, whiteSpace: 'nowrap' }}>{w.name}</td>
                  {dayKeys.map((d) => {
                    const code = schedule?.days?.[d];
                    const job = code ? jobByCode.get(code) : null;
                    const isUnavailable = code === 'U';
                    return (
                      <td key={d} style={{ padding: '4px', textAlign: 'center' }}>
                        {isUnavailable ? (
                          <div style={{ fontSize: 10, color: '#999', fontWeight: 600 }}>Leave</div>
                        ) : job ? (
                          <div
                            title={job.name}
                            style={{
                              background: job.color + '33',
                              color: '#1a1a1a',
                              borderRadius: 6,
                              padding: '4px 2px',
                              fontSize: 10,
                              fontWeight: 700,
                            }}
                          >
                            {job.code}
                          </div>
                        ) : (
                          <span style={{ color: '#ccc' }}>—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 12 }}>
        This mirrors the roster in Orders. To make changes, edit it there —
        updates show up here straight away.
      </div>
    </div>
  );
}
