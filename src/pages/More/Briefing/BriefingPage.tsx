import React, { useEffect, useState } from 'react';
import { useDailyBriefing } from '../../../hooks/useDailyBriefing';

export default function BriefingPage() {
  const { briefings, todaysBriefing, loading, postBriefing } = useDailyBriefing();
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(todaysBriefing?.content ?? '');
  }, [todaysBriefing]);

  async function handlePost() {
    if (!draft.trim()) return;
    setSaving(true);
    await postBriefing(draft.trim());
    setSaving(false);
  }

  const history = briefings.filter((b) => b.id !== todaysBriefing?.id);

  return (
    <div className="app-content">
      <div className="page-header">
        <div className="page-header-subtitle">More</div>
        <div className="page-header-title">Daily Briefing</div>
      </div>

      <div className="section-title">Today</div>
      <div className="card" style={{ marginBottom: 20 }}>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={6}
          placeholder="Today's priorities, crew allocation, deliveries expected, anything the team needs to know…"
          style={{ width: '100%', border: 'none', outline: 'none', fontSize: 13, fontFamily: 'inherit', resize: 'none', marginBottom: 10 }}
        />
        <button
          onClick={handlePost}
          disabled={saving}
          style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          {saving ? 'Posting…' : todaysBriefing ? 'Update briefing' : 'Post briefing'}
        </button>
      </div>

      <div className="section-title">History</div>
      {loading && <div className="empty-state">Loading…</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {history.length === 0 && <div className="empty-state">No past briefings yet.</div>}
        {history.map((b) => (
          <div key={b.id} className="card">
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6 }}>
              {new Date(b.briefing_date).toLocaleDateString('en-AU', { weekday: 'long', day: '2-digit', month: 'short' })}
            </div>
            <div style={{ fontSize: 13, whiteSpace: 'pre-wrap' }}>{b.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
