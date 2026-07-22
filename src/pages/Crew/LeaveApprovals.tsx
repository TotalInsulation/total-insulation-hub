import React from 'react';
import { Check, X } from 'lucide-react';
import { useLeaveRequests } from '../../hooks/useLeaveRequests';
import { useWorkers } from '../../hooks/useWorkers';
import { useAuth } from '../../contexts/AuthContext';

const REASON_LABELS: Record<string, string> = {
  annual: 'Annual leave',
  sick: 'Sick leave',
  comp: 'Comp time',
  other: 'Other',
};

export default function LeaveApprovals() {
  const { requests, updateStatus } = useLeaveRequests();
  const { workers } = useWorkers();
  const { appUser } = useAuth();

  const workerName = (id: number) => workers.find((w) => w.id === id)?.name ?? 'Unknown';

  const pending = requests.filter((r) => r.status === 'pending');
  const decided = requests.filter((r) => r.status !== 'pending');

  return (
    <div className="app-content">
      <div className="page-header">
        <div className="page-header-subtitle">Crew</div>
        <div className="page-header-title">Leave Approvals</div>
      </div>

      <div className="section-title">Pending</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {pending.length === 0 && <div className="empty-state">No leave requests waiting.</div>}
        {pending.map((r) => (
          <div key={r.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{workerName(r.worker_id)}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                  {REASON_LABELS[r.reason]} · {new Date(r.start_date).toLocaleDateString('en-AU')} – {new Date(r.end_date).toLocaleDateString('en-AU')}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => updateStatus(r.id, 'rejected', appUser!.id)}
                  style={{ background: '#FFEAEA', color: '#ae272b', border: 'none', borderRadius: 6, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={16} />
                </button>
                <button
                  onClick={() => updateStatus(r.id, 'approved', appUser!.id)}
                  style={{ background: '#E8F4F0', color: '#0f6e56', border: 'none', borderRadius: 6, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Check size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="section-title">History</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {decided.length === 0 && <div className="empty-state">No history yet.</div>}
        {decided.map((r) => (
          <div key={r.id} className="card" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{workerName(r.worker_id)}</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                {REASON_LABELS[r.reason]} · {new Date(r.start_date).toLocaleDateString('en-AU')} – {new Date(r.end_date).toLocaleDateString('en-AU')}
              </div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: r.status === 'approved' ? '#0f6e56' : '#ae272b', alignSelf: 'center' }}>
              {r.status === 'approved' ? 'Approved' : 'Rejected'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
