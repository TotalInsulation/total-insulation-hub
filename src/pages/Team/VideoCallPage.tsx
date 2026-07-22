import React from 'react';
import { Video } from 'lucide-react';

export default function VideoCallPage() {
  return (
    <div className="app-content">
      <div className="page-header">
        <div className="page-header-subtitle">More</div>
        <div className="page-header-title">Video Calling</div>
      </div>

      <div className="card" style={{ textAlign: 'center', padding: 30 }}>
        <Video size={32} color="var(--color-primary)" style={{ marginBottom: 12 }} />
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Uses Microsoft Teams</div>
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 16 }}>
          Video calls happen in Teams, since that's where your files and
          calendar already live. Start a call there and it'll show up on
          everyone's calendar.
        </div>
        <a
          href="https://teams.microsoft.com/"
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'inline-block',
            background: 'var(--color-primary)',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Open Microsoft Teams
        </a>
      </div>
    </div>
  );
}
