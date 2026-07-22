import React, { useState } from 'react';
import { useWorkers } from '../../hooks/useWorkers';
import { useLabourAllocations } from '../../hooks/useLabourAllocations';
import { useWipProjects } from '../../hooks/useWipProjects';

export default function ScheduleManagement() {
  const { workers } = useWorkers();
  const { allocations } = useLabourAllocations();
  const { projects } = useWipProjects();
  const [search, setSearch] = useState('');

  const projectName = (id: string) => projects.find((p) => p.id === id)?.project_name ?? 'Unknown project';

  const filteredWorkers = workers.filter((w) => w.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="app-content">
      <div className="page-header">
        <div className="page-header-subtitle">Crew</div>
        <div className="page-header-title">Schedule Management</div>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name"
        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '0.5px solid var(--color-border)', fontSize: 13, marginBottom: 16 }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filteredWorkers.map((w) => {
          const schedule = allocations
            .filter((a) => a.worker_id === w.id)
            .sort((a, b) => a.allocation_start_date.localeCompare(b.allocation_start_date));

          return (
            <div key={w.id} className="card">
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: schedule.length > 0 ? 8 : 0 }}>
                {w.name} <span style={{ fontWeight: 400, color: 'var(--color-text-muted)', fontSize: 11 }}>· {w.state}</span>
              </div>
              {schedule.length === 0 && <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>No upcoming allocations.</div>}
              {schedule.map((a, idx) => (
                <div
                  key={a.id}
                  style={{
                    fontSize: 12,
                    color: 'var(--color-text-muted)',
                    paddingTop: idx > 0 ? 6 : 0,
                    marginTop: idx > 0 ? 6 : 0,
                    borderTop: idx > 0 ? '0.5px solid var(--color-border)' : 'none',
                  }}
                >
                  {projectName(a.project_id)} · {new Date(a.allocation_start_date).toLocaleDateString('en-AU')} – {new Date(a.allocation_end_date).toLocaleDateString('en-AU')}
                  {a.role ? ` · ${a.role}` : ''}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
