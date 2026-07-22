import React, { useState } from 'react';
import { useVariations } from '../../hooks/useVariations';
import type { VariationStatus } from '../../types';

const STATUS_LABELS: Record<VariationStatus, string> = {
  submitted: 'Submitted',
  approved: 'Approved',
  rejected: 'Rejected',
  completed: 'Completed',
};

const STATUS_COLORS: Record<VariationStatus, { bg: string; text: string }> = {
  submitted: { bg: '#F0F0F0', text: '#555' },
  approved: { bg: '#E8F4F0', text: '#0f6e56' },
  rejected: { bg: '#FFEAEA', text: '#ae272b' },
  completed: { bg: '#1a1a1a', text: '#fff' },
};

function formatMoney(value: number | null): string {
  if (value === null || value === undefined) return '—';
  return `$${value.toLocaleString('en-AU', { maximumFractionDigits: 0 })}`;
}

export default function VariationsList() {
  const { variations, loading, error, updateVariationStatus } = useVariations();
  const [statusFilter, setStatusFilter] = useState<VariationStatus | 'all'>('all');

  const filtered = variations.filter((v) => statusFilter === 'all' || v.status === statusFilter);

  return (
    <div className="app-content">
      <div className="page-header">
        <div className="page-header-subtitle">Business</div>
        <div className="page-header-title">Variations</div>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
        {(['all', 'submitted', 'approved', 'rejected', 'completed'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            style={{
              flexShrink: 0,
              padding: '6px 12px',
              borderRadius: 20,
              border: statusFilter === s ? '1px solid var(--color-primary)' : '0.5px solid var(--color-border)',
              background: statusFilter === s ? 'var(--color-primary-light)' : '#fff',
              color: statusFilter === s ? 'var(--color-primary)' : '#555',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {s === 'all' ? 'All' : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {error && <div className="card" style={{ color: '#ae272b', marginBottom: 12 }}>{error}</div>}
      {loading && <div className="empty-state">Loading variations…</div>}
      {!loading && filtered.length === 0 && <div className="empty-state">No variations found.</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map((v) => {
          const colors = STATUS_COLORS[v.status];
          return (
            <div key={v.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{v.variation_number ?? 'Variation'}</div>
                <span style={{ background: colors.bg, color: colors.text, fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6 }}>
                  {STATUS_LABELS[v.status]}
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 8 }}>{v.description}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{formatMoney(v.cost_impact)}</span>
                {v.status === 'submitted' && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => updateVariationStatus(v.id, 'rejected')}
                      style={{ fontSize: 11, fontWeight: 600, color: '#ae272b', background: 'none', border: '0.5px solid var(--color-border)', borderRadius: 6, padding: '5px 10px', cursor: 'pointer' }}
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => updateVariationStatus(v.id, 'approved')}
                      style={{ fontSize: 11, fontWeight: 600, color: '#fff', background: 'var(--color-primary)', border: 'none', borderRadius: 6, padding: '5px 10px', cursor: 'pointer' }}
                    >
                      Approve
                    </button>
                  </div>
                )}
                {v.status === 'approved' && (
                  <button
                    onClick={() => updateVariationStatus(v.id, 'completed')}
                    style={{ fontSize: 11, fontWeight: 600, color: '#fff', background: '#1a1a1a', border: 'none', borderRadius: 6, padding: '5px 10px', cursor: 'pointer' }}
                  >
                    Mark completed
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
