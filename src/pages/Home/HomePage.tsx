import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useDashboardMetrics } from '../../hooks/useDashboardMetrics';
import { useUrgentItems } from '../../hooks/useUrgentItems';
import { useTeamStatus } from '../../hooks/useTeamStatus';

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

export default function HomePage() {
  const { appUser } = useAuth();
  const metrics = useDashboardMetrics();
  const { items: urgentItems, loading: urgentLoading } = useUrgentItems();
  const { members, loading: teamLoading, formatLastActive } = useTeamStatus();

  const firstName = appUser?.full_name?.split(' ')[0] ?? 'there';

  return (
    <div className="app-content">
      <div className="page-header">
        <div className="page-header-subtitle">Welcome back</div>
        <div className="page-header-title">{firstName}</div>
      </div>

      {metrics.error && (
        <div className="card" style={{ marginBottom: 16, color: '#ae272b' }}>
          {metrics.error}
        </div>
      )}

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-number">
            {metrics.loading ? '—' : metrics.activeTendersCount}
          </div>
          <div className="metric-label">Active Tenders</div>
        </div>
        <div className="metric-card">
          <div className="metric-number">
            {metrics.loading ? '—' : metrics.wipProjectsCount}
          </div>
          <div className="metric-label">WIP Projects</div>
        </div>
        <div className="metric-card">
          <div className="metric-number">
            {metrics.loading ? '—' : metrics.pendingVariationsCount}
          </div>
          <div className="metric-label">Pending Variations</div>
        </div>
        <div className="metric-card">
          <div className="metric-number">
            {metrics.loading ? '—' : formatCurrency(metrics.pipelineValue)}
          </div>
          <div className="metric-label">Pipeline Value</div>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div className="section-title">Urgent items</div>
        <div className="urgent-list">
          {urgentLoading && <div className="empty-state">Loading…</div>}
          {!urgentLoading && urgentItems.length === 0 && (
            <div className="empty-state">Nothing urgent right now.</div>
          )}
          {urgentItems.map((item) => (
            <div className="urgent-item" key={item.id}>
              <div>
                <div className="urgent-title">{item.title}</div>
                <div className="urgent-subtitle">{item.subtitle}</div>
              </div>
              <div className={`badge ${item.badgeClass}`}>{item.badge}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="section-title">Team status (you &amp; Nelson only)</div>
        <div className="card">
          {teamLoading && <div className="empty-state">Loading…</div>}
          {!teamLoading && members.length === 0 && (
            <div className="empty-state">No activity data yet.</div>
          )}
          {members.map((m, idx) => (
            <div
              key={m.userId}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                paddingBottom: idx < members.length - 1 ? 12 : 0,
                marginBottom: idx < members.length - 1 ? 12 : 0,
                borderBottom:
                  idx < members.length - 1 ? '0.5px solid var(--color-border)' : 'none',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: '#595649',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {m.fullName
                  .split(' ')
                  .map((p) => p[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{m.fullName}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                  {m.currentActivity ?? formatLastActive(m.lastActiveAt)}
                </div>
              </div>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: m.isOnline ? '#3fa796' : '#999',
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
