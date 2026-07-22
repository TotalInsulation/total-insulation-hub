import React, { useState } from 'react';
import TendersList from './TendersList';
import WipProjectsList from './WipProjectsList';
import VariationsList from './VariationsList';
import DocumentsList from './DocumentsList';
import MonthlySummary from './MonthlySummary';

type SubTab = 'tenders' | 'wip' | 'variations' | 'documents' | 'monthly';

export default function BusinessHome() {
  const [subTab, setSubTab] = useState<SubTab>('tenders');

  const tabs: { key: SubTab; label: string }[] = [
    { key: 'tenders', label: 'Tenders' },
    { key: 'wip', label: 'WIP' },
    { key: 'monthly', label: 'Monthly' },
    { key: 'variations', label: 'Variations' },
    { key: 'documents', label: 'Documents' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        style={{
          display: 'flex',
          gap: 4,
          padding: '12px 16px 0',
          background: '#fff',
          borderBottom: '0.5px solid var(--color-border)',
        }}
      >
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

      {subTab === 'tenders' && <TendersList />}
      {subTab === 'wip' && <WipProjectsList />}
      {subTab === 'monthly' && <MonthlySummary />}
      {subTab === 'variations' && <VariationsList />}
      {subTab === 'documents' && <DocumentsList />}
    </div>
  );
}
