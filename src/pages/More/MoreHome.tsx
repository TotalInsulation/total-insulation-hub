import React, { useState } from 'react';
import BriefingPage from './Briefing/BriefingPage';
import VideoCallPage from './VideoCallPage';
import SettingsPage from './Settings/SettingsPage';

type SubTab = 'briefing' | 'video' | 'settings';

export default function MoreHome() {
  const [subTab, setSubTab] = useState<SubTab>('briefing');

  const tabs: { key: SubTab; label: string }[] = [
    { key: 'briefing', label: 'Briefing' },
    { key: 'video', label: 'Video' },
    { key: 'settings', label: 'Settings' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', gap: 4, padding: '12px 16px 0', background: '#fff', borderBottom: '0.5px solid var(--color-border)' }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setSubTab(t.key)}
            style={{
              flex: 1,
              padding: '10px 4px',
              background: 'none',
              border: 'none',
              borderBottom: subTab === t.key ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: subTab === t.key ? 'var(--color-primary)' : '#999',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {subTab === 'briefing' && <BriefingPage />}
      {subTab === 'video' && <VideoCallPage />}
      {subTab === 'settings' && <SettingsPage />}
    </div>
  );
}
