import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useMonthlySummary, fetchMonthClaimDetail, MonthClaimDetail } from '../../hooks/useMonthlySummary';

function formatMoney(value: number): string {
  return `$${value.toLocaleString('en-AU', { maximumFractionDigits: 0 })}`;
}

export default function MonthlySummary() {
  const { months, overall, loading } = useMonthlySummary();
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
  const [detail, setDetail] = useState<MonthClaimDetail[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  async function toggleMonth(monthKey: string) {
    if (expandedMonth === monthKey) {
      setExpandedMonth(null);
      return;
    }
    setExpandedMonth(monthKey);
    setDetailLoading(true);
    const rows = await fetchMonthClaimDetail(monthKey);
    setDetail(rows);
    setDetailLoading(false);
  }

  return (
    <div className="app-content">
      <div className="page-header">
        <div className="page-header-subtitle">Business</div>
        <div className="page-header-title">Monthly Summary</div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 12, fontWeight: 600 }}>
          TOTALS ACROSS ALL PROJECTS
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Total quoted value</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{formatMoney(overall.totalQuotedValue)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Total invoiced to date</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{formatMoney(overall.totalInvoicedToDate)}</div>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Total balance remaining</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: overall.totalBalanceRemaining < 0 ? '#ae272b' : 'var(--color-text)' }}>
              {formatMoney(overall.totalBalanceRemaining)}
            </div>
          </div>
        </div>
      </div>

      <div className="section-title">Claimed by month</div>

      {loading && <div className="empty-state">Loading…</div>}
      {!loading && months.length === 0 && (
        <div className="empty-state">No invoices logged yet. Add some in a project's Invoicing section.</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {months.map((m) => (
          <div key={m.monthKey}>
            <div
              onClick={() => toggleMonth(m.monthKey)}
              className="card"
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{m.monthLabel}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{m.invoiceCount} invoice{m.invoiceCount === 1 ? '' : 's'}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{formatMoney(m.claimedThisMonth)}</div>
                {expandedMonth === m.monthKey ? <ChevronUp size={16} color="#999" /> : <ChevronDown size={16} color="#999" />}
              </div>
            </div>

            {expandedMonth === m.monthKey && (
              <div className="card" style={{ marginTop: 4, background: '#FAFAF8' }}>
                {detailLoading && <div className="empty-state" style={{ padding: 8 }}>Loading…</div>}
                {!detailLoading && detail.length === 0 && (
                  <div className="empty-state" style={{ padding: 8 }}>No claims found.</div>
                )}
                {!detailLoading && detail.map((d, idx) => (
                  <div
                    key={d.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      paddingBottom: idx < detail.length - 1 ? 8 : 0,
                      marginBottom: idx < detail.length - 1 ? 8 : 0,
                      borderBottom: idx < detail.length - 1 ? '0.5px solid var(--color-border)' : 'none',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{d.projectName}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                        {new Date(d.invoiceDate).toLocaleDateString('en-AU')}
                        {d.invoiceNumber ? ` · ${d.invoiceNumber}` : ''}
                      </div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{formatMoney(d.amount)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
