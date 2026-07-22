import React from 'react';
import { useWipProjects } from '../../hooks/useWipProjects';
import { useLabourAllocations } from '../../hooks/useLabourAllocations';
import { useWorkers } from '../../hooks/useWorkers';

const DAY_MS = 86400000;

export default function JobProgressGantt() {
  const { projects } = useWipProjects();
  const { allocations } = useLabourAllocations();
  const { workers } = useWorkers();

  const activeProjects = projects.filter((p) => p.start_date && p.planned_completion_date);

  if (activeProjects.length === 0) {
    return (
      <div className="app-content">
        <div className="page-header">
          <div className="page-header-subtitle">Crew</div>
          <div className="page-header-title">Job Progress</div>
        </div>
        <div className="empty-state">No projects with start and completion dates yet.</div>
      </div>
    );
  }

  const allDates = activeProjects.flatMap((p) => [
    new Date(p.start_date!).getTime(),
    new Date(p.planned_completion_date!).getTime(),
  ]);
  const minDate = Math.min(...allDates);
  const maxDate = Math.max(...allDates);
  const totalSpan = maxDate - minDate || DAY_MS;

  const todayOffset = ((Date.now() - minDate) / totalSpan) * 100;

  return (
    <div className="app-content">
      <div className="page-header">
        <div className="page-header-subtitle">Crew</div>
        <div className="page-header-title">Job Progress</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {activeProjects.map((p) => {
          const start = new Date(p.start_date!).getTime();
          const end = new Date(p.planned_completion_date!).getTime();
          const leftPct = ((start - minDate) / totalSpan) * 100;
          const widthPct = ((end - start) / totalSpan) * 100;

          const crewOnProject = allocations
            .filter((a) => a.project_id === p.id)
            .map((a) => workers.find((w) => w.id === a.worker_id)?.name)
            .filter(Boolean);

          return (
            <div key={p.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{p.project_name}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{p.completion_percentage}%</div>
              </div>

              <div style={{ position: 'relative', height: 24, background: '#f0f0f0', borderRadius: 6, marginBottom: 8 }}>
                <div
                  style={{
                    position: 'absolute',
                    left: `${leftPct}%`,
                    width: `${Math.max(widthPct, 2)}%`,
                    height: '100%',
                    background: 'var(--color-primary)',
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: 6,
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${p.completion_percentage}%`,
                      background: 'rgba(255,255,255,0.3)',
                      borderRadius: 6,
                      position: 'absolute',
                      left: 0,
                      top: 0,
                    }}
                  />
                </div>
                {todayOffset >= 0 && todayOffset <= 100 && (
                  <div
                    style={{
                      position: 'absolute',
                      left: `${todayOffset}%`,
                      top: -4,
                      bottom: -4,
                      width: 2,
                      background: '#1a1a1a',
                    }}
                  />
                )}
              </div>

              <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                {new Date(p.start_date!).toLocaleDateString('en-AU')} → {new Date(p.planned_completion_date!).toLocaleDateString('en-AU')}
                {crewOnProject.length > 0 && ` · ${crewOnProject.join(', ')}`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
