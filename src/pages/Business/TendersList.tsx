import React, { useMemo, useState } from 'react';
import { ExternalLink, FileText, Plus, Search } from 'lucide-react';
import { useTenders } from '../../hooks/useTenders';
import type { Tender, TenderStatus } from '../../types';
import TenderDetail from './TenderDetail';
import TenderCreate from './TenderCreate';

const STATUS_LABELS: Record<TenderStatus, string> = {
  pending: 'Pending',
  submitted: 'Submitted',
  won: 'Won',
  lost: 'Lost',
  no_works: 'No Works',
};

const STATUS_COLORS: Record<TenderStatus, { bg: string; text: string }> = {
  pending: { bg: '#F0F0F0', text: '#555' },
  submitted: { bg: '#1a1a1a', text: '#fff' },
  won: { bg: '#FFF9E6', text: '#8a6d00' },
  lost: { bg: '#FFEAEA', text: '#ae272b' },
  no_works: { bg: '#FFEAEA', text: '#ae272b' },
};

function formatMoney(value: number | null): string {
  if (value === null || value === undefined) return '—';
  return `$${value.toLocaleString('en-AU', { maximumFractionDigits: 0 })}`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-AU', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
  });
}

export default function TendersList() {
  const { tenders, loading, error } = useTenders();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TenderStatus | 'all'>('all');
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const filtered = useMemo(() => {
    return tenders.filter((t) => {
      const matchesSearch =
        search.trim() === '' ||
        t.project_name.toLowerCase().includes(search.toLowerCase()) ||
        t.client.toLowerCase().includes(search.toLowerCase()) ||
        (t.tender_number ?? '').toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tenders, search, statusFilter]);

  if (selectedTender) {
    return (
      <TenderDetail
        tender={selectedTender}
        onBack={() => setSelectedTender(null)}
      />
    );
  }

  if (showCreate) {
    return (
      <TenderCreate
        onBack={() => setShowCreate(false)}
        onCreated={() => setShowCreate(false)}
      />
    );
  }

  return (
    <div className="app-content">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="page-header-subtitle">Business</div>
          <div className="page-header-title">Tenders</div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{
            background: 'var(--color-primary)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Plus size={16} /> New
        </button>
      </div>

      <div style={{ position: 'relative', marginBottom: 12 }}>
        <Search
          size={16}
          style={{ position: 'absolute', left: 12, top: 12, color: '#999' }}
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, client, or reference"
          style={{
            width: '100%',
            padding: '10px 12px 10px 34px',
            borderRadius: 8,
            border: '0.5px solid var(--color-border)',
            fontSize: 13,
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
        {(['all', 'pending', 'submitted', 'won', 'lost', 'no_works'] as const).map((s) => (
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
      {loading && <div className="empty-state">Loading tenders…</div>}
      {!loading && filtered.length === 0 && (
        <div className="empty-state">No tenders match this search.</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map((tender) => {
          const colors = STATUS_COLORS[tender.status];
          return (
            <div
              key={tender.id}
              onClick={() => setSelectedTender(tender)}
              className="card"
              style={{ cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{tender.project_name}</div>
                <span
                  style={{
                    background: colors.bg,
                    color: colors.text,
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 6,
                    whiteSpace: 'nowrap',
                    marginLeft: 8,
                  }}
                >
                  {STATUS_LABELS[tender.status]}
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 4 }}>
                {tender.client} · {tender.state ?? '—'}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                <span style={{ fontWeight: 600 }}>{formatMoney(tender.quoted_value)}</span>
                <span style={{ color: 'var(--color-text-muted)' }}>Due {formatDate(tender.due_date)}</span>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                {tender.notes && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--color-text-muted)' }}>
                    <FileText size={12} /> Notes
                  </span>
                )}
                {tender.procore_link && (
                  <a
                    href={tender.procore_link}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--color-primary)' }}
                  >
                    <ExternalLink size={12} /> Procore
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
