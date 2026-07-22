import React, { useState } from 'react';
import MessagesHome from './Messages/MessagesHome';
import CalendarPage from './Calendar/CalendarPage';
import TasksPage from './Tasks/TasksPage';

type SubTab = 'messages' | 'calendar' | 'tasks';

export default function TeamHome() {
  const [subTab, setSubTab] = useState<SubTab>('messages');

  const tabs: { key: SubTab; label: string }[] = [
    { key: 'messages', label: 'Messages' },
    { key: 'calendar', label: 'Calendar' },
    { key: 'tasks', label: 'Tasks' },
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

      {subTab === 'messages' && <MessagesHome />}
      {subTab === 'calendar' && <CalendarPage />}
      {subTab === 'tasks' && <TasksPage />}
    </div>
  );
}
