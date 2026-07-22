import React, { useState, useEffect } from 'react';
import MessagesHome from './Messages/MessagesHome';
import CalendarPage from './Calendar/CalendarPage';
import TasksPage from './Tasks/TasksPage';
import VideoCallPage from './VideoCallPage';

type SubTab = 'messages' | 'calendar' | 'tasks' | 'video';

const SUBTAB_KEY = 'ti_hub_team_subtab';

export default function TeamHome() {
  const [subTab, setSubTab] = useState<SubTab>(() => {
    const saved = sessionStorage.getItem(SUBTAB_KEY);
    return (saved as SubTab) || 'messages';
  });

  useEffect(() => {
    function handleNavigate(e: Event) {
      const detail = (e as CustomEvent<{ tab: string; subTab?: string }>).detail;
      if (detail.tab === 'team' && detail.subTab) {
        setSubTab(detail.subTab as SubTab);
      }
    }
    window.addEventListener('ti-navigate', handleNavigate);
    return () => window.removeEventListener('ti-navigate', handleNavigate);
  }, []);

  function handleSubTabClick(tab: SubTab) {
    setSubTab(tab);
    sessionStorage.setItem(SUBTAB_KEY, tab);
  }

  const tabs: { key: SubTab; label: string }[] = [
    { key: 'messages', label: 'Messages' },
    { key: 'calendar', label: 'Calendar' },
    { key: 'tasks', label: 'Tasks' },
    { key: 'video', label: 'Video' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', gap: 4, padding: '12px 16px 0', background: '#fff', borderBottom: '0.5px solid var(--color-border)' }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => handleSubTabClick(t.key)}
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

      {subTab === 'messages' && <MessagesHome />}
      {subTab === 'calendar' && <CalendarPage />}
      {subTab === 'tasks' && <TasksPage />}
      {subTab === 'video' && <VideoCallPage />}
    </div>
  );
}
