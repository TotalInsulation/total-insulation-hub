import React, { useState } from 'react';
import { Folder, ExternalLink } from 'lucide-react';
import { useTenders } from '../../hooks/useTenders';
import { useWipProjects } from '../../hooks/useWipProjects';

export default function DocumentsList() {
  const { tenders } = useTenders();
  const { projects } = useWipProjects();
  const [tab, setTab] = useState<'tenders' | 'projects'>('projects');

  const entries =
    tab === 'tenders'
      ? tenders.filter((t) => t.onedrive_folder_link || t.procore_link)
      : projects.filter((p) => p.onedrive_folder_link || p.procore_link);

  return (
    <div className="app-content">
      <div className="page-header">
        <div className="page-header-subtitle">Business</div>
        <div className="page-header-title">Documents</div>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        <button
          onClick={() => setTab('projects')}
          style={{ flex: 1, padding: 10, borderRadius: 8, border: tab === 'projects' ? '1px solid var(--color-primary)' : '0.5px solid var(--color-border)', background: tab === 'projects' ? 'var(--color-primary-light)' : '#fff', color: tab === 'projects' ? 'var(--color-primary)' : '#555', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
        >
          WIP Projects
        </button>
        <button
          onClick={() => setTab('tenders')}
          style={{ flex: 1, padding: 10, borderRadius: 8, border: tab === 'tenders' ? '1px solid var(--color-primary)' : '0.5px solid var(--color-border)', background: tab === 'tenders' ? 'var(--color-primary-light)' : '#fff', color: tab === 'tenders' ? 'var(--color-primary)' : '#555', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
        >
          Tenders
        </button>
      </div>

      {entries.length === 0 && <div className="empty-state">No document links added yet.</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {entries.map((e: any) => (
          <div key={e.id} className="card">
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>{e.project_name}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {e.onedrive_folder_link && (
                <a href={e.onedrive_folder_link} target="_blank" rel="noreferrer" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12, fontWeight: 600, padding: 8, borderRadius: 6, border: '0.5px solid var(--color-border)', textDecoration: 'none', color: 'var(--color-text)' }}>
                  <Folder size={14} /> OneDrive
                </a>
              )}
              {e.procore_link && (
                <a href={e.procore_link} target="_blank" rel="noreferrer" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12, fontWeight: 600, padding: 8, borderRadius: 6, border: '0.5px solid var(--color-border)', textDecoration: 'none', color: 'var(--color-text)' }}>
                  <ExternalLink size={14} /> Procore
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
