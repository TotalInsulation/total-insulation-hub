import React, { useState } from 'react';
import { Plus, AlertTriangle, Trash2 } from 'lucide-react';
import { useWorkers } from '../../hooks/useWorkers';
import { useWipProjects } from '../../hooks/useWipProjects';
import { useLabourAllocations } from '../../hooks/useLabourAllocations';

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('en-AU', { day: '2-digit', month: 'short' });
}

export default function LabourAllocation() {
  const { workers } = useWorkers();
  const { projects } = useWipProjects();
  const { allocations, findConflicts, createAllocation, deleteAllocation } = useLabourAllocations();

  const [showForm, setShowForm] = useState(false);
  const [workerId, setWorkerId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [role, setRole] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const conflictPreview =
    workerId && startDate && endDate
      ? findConflicts(Number(workerId), startDate, endDate)
      : [];

  async function handleCreate() {
    if (!workerId || !projectId || !startDate || !endDate) {
      setError('Fill in worker, project, and both dates.');
      return;
    }

    setSaving(true);
    setError(null);

    const { error } = await createAllocation({
      worker_id: Number(workerId),
      project_id: projectId,
      allocation_start_date: startDate,
      allocation_end_date: endDate,
      role,
    });

    setSaving(false);

    if (error) {
      setError(error);
      return;
    }

    setShowForm(false);
    setWorkerId('');
    setProjectId('');
    setRole('');
    setStartDate('');
    setEndDate('');
  }

  const workerName = (id: number) => workers.find((w) => w.id === id)?.name ?? 'Unknown';
  const projectName = (id: string) => projects.find((p) => p.id === id)?.project_name ?? 'Unknown';

  // Simple utilisation: how many active allocations does each worker have right now
  const today = new Date().toISOString().slice(0, 10);
  const utilisation = workers.map((w) => {
    const active = allocations.filter(
      (a) => a.worker_id === w.id && a.allocation_start_date <= today && a.allocation_end_date >= today
    );
    return { worker: w, activeCount: active.length, projects: active.map((a) => projectName(a.project_id)) };
  });

  return (
    <div className="app-content">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="page-header-subtitle">Crew</div>
          <div className="page-header-title">Labour Allocation</div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          <Plus size={16} /> Allocate
        </button>
      </div>

      <div className="section-title">Crew utilisation today</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {utilisation.map((u) => (
          <div key={u.worker.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{u.worker.name}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{u.worker.state}</div>
              </div>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: u.activeCount === 0 ? '#999' : u.activeCount === 1 ? '#3fa796' : '#ae272b',
                }}
              />
            </div>
            {u.projects.length > 0 && (
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 6 }}>
                {u.projects.join(', ')}
                {u.activeCount > 1 && (
                  <span style={{ color: '#ae272b', fontWeight: 600 }}> · double-booked</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="section-title">All allocations</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {allocations.length === 0 && <div className="empty-state">No allocations yet.</div>}
        {allocations.map((a) => (
          <div key={a.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{workerName(a.worker_id)}</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                {projectName(a.project_id)} · {formatDate(a.allocation_start_date)} – {formatDate(a.allocation_end_date)}
                {a.role ? ` · ${a.role}` : ''}
              </div>
            </div>
            <button onClick={() => deleteAllocation(a.id)} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}>
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end', zIndex: 200 }} onClick={() => setShowForm(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: '16px 16px 0 0', padding: 20, width: '100%' }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Allocate crew</div>

            <select value={workerId} onChange={(e) => setWorkerId(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '0.5px solid var(--color-border)', fontSize: 13, marginBottom: 10 }}>
              <option value="">Select worker</option>
              {workers.map((w) => (
                <option key={w.id} value={w.id}>{w.name} ({w.state})</option>
              ))}
            </select>

            <select value={projectId} onChange={(e) => setProjectId(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '0.5px solid var(--color-border)', fontSize: 13, marginBottom: 10 }}>
              <option value="">Select project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.project_name}</option>
              ))}
            </select>

            <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role (e.g. installer, supervisor)" style={{ width: '100%', padding: 10, borderRadius: 8, border: '0.5px solid var(--color-border)', fontSize: 13, marginBottom: 10 }} />

            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ flex: 1, padding: 10, borderRadius: 8, border: '0.5px solid var(--color-border)', fontSize: 13 }} />
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ flex: 1, padding: 10, borderRadius: 8, border: '0.5px solid var(--color-border)', fontSize: 13 }} />
            </div>

            {conflictPreview.length > 0 && (
              <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', background: '#FFF0ED', color: '#ae272b', padding: 10, borderRadius: 8, fontSize: 12, marginBottom: 10 }}>
                <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>Already allocated to {conflictPreview.length} other project(s) in this date range.</span>
              </div>
            )}

            {error && <div style={{ color: '#ae272b', fontSize: 12, marginBottom: 10 }}>{error}</div>}

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: 10, borderRadius: 8, border: '0.5px solid var(--color-border)', background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Cancel</button>
              <button onClick={handleCreate} disabled={saving} style={{ flex: 1, padding: 10, borderRadius: 8, border: 'none', background: 'var(--color-primary)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                {saving ? 'Saving…' : 'Allocate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
