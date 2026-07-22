import React, { useState } from 'react';
import LabourAllocation from './LabourAllocation';
import JobProgressGantt from './JobProgressGantt';
import ScheduleManagement from './ScheduleManagement';
import LeaveApprovals from './LeaveApprovals';

type SubTab = 'labour' | 'gantt' | 'schedule' | 'leave';

export default function CrewHome() {
  const [subTab, setSubTab] = useState<SubTab>('labour');

  const tabs: { key: SubTab; label: string }[] = [
    { key: 'labour', label: 'Labour' },
    { key: 'gantt', label: 'Gantt' },
    { key: 'schedule', label: 'Schedule' },
    { key: 'leave', label: 'Leave' },
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

      {subTab === 'labour' && <LabourAllocation />}
      {subTab === 'gantt' && <JobProgressGantt />}
      {subTab === 'schedule' && <ScheduleManagement />}
      {subTab === 'leave' && <LeaveApprovals />}
    </div>
  );
}
