import React, { useMemo, useState } from 'react';
import { ArrowLeft, ExternalLink, Folder, Plus, Search, Trash2 } from 'lucide-react';
import { useWipProjects, useProjectCrew } from '../../hooks/useWipProjects';
import { useVariations } from '../../hooks/useVariations';
import { useInvoiceEntries } from '../../hooks/useInvoiceEntries';
import type { WipProject } from '../../types';

function formatMoney(value: number | null): string {
  if (value === null || value === undefined) return '—';
  return `$${value.toLocaleString('en-AU', { maximumFractionDigits: 0 })}`;
}

function InvoiceLog({ project }: { project: WipProject }) {
  const { entries, addEntry, deleteEntry } = useInvoiceEntries(project.id);
  const [amount, setAmount] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const balance = (project.quoted_value ?? 0) - project.invoiced_to_date;

  async function handleAdd() {
    const value = Number(amount);
    if (!value || value <= 0) {
      setError('Enter a valid invoice amount.');
      return;
    }
    setSaving(true);
    setError(null);
    const { error } = await addEntry(value, invoiceNumber, invoiceDate, notes);
    setSaving(false);
    if (error) {
      setError(error);
      return;
    }
    setAmount('');
    setInvoiceNumber('');
    setNotes('');
  }

  return (
    <>
      <div className="section-title">Invoicing</div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Invoiced to date</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{formatMoney(project.invoiced_to_date)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Balance remaining</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: balance < 0 ? '#ae272b' : 'var(--color-text)' }}>
              {formatMoney(balance)}
            </div>
          </div>
        </div>

        {entries.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            {entries.map((e, idx) => (
              <div
                key={e.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: idx < entries.length - 1 ? 8 : 0,
                  marginBottom: idx < entries.length - 1 ? 8 : 0,
                  borderBottom: idx < entries.length - 1 ? '0.5px solid var(--color-border)' : 'none',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{formatMoney(e.amount)}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                    {new Date(e.invoice_date).toLocaleDateString('en-AU')}
                    {e.invoice_number ? ` · ${e.invoice_number}` : ''}
                  </div>
                </div>
                <button
                  onClick={() => deleteEntry(e.id)}
                  style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            placeholder="Amount claimed *"
            style={{ flex: 2, minWidth: 110, padding: '8px 10px', borderRadius: 6, border: '0.5px solid var(--color-border)', fontSize: 12 }}
          />
          <input
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            placeholder="Invoice # (optional)"
            style={{ flex: 2, minWidth: 110, padding: '8px 10px', borderRadius: 6, border: '0.5px solid var(--color-border)', fontSize: 12 }}
          />
          <input
            value={invoiceDate}
            onChange={(e) => setInvoiceDate(e.target.value)}
            type="date"
            style={{ flex: 2, minWidth: 130, padding: '8px 10px', borderRadius: 6, border: '0.5px solid var(--color-border)', fontSize: 12 }}
          />
          <button
            onClick={handleAdd}
            disabled={saving}
            style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 6, padding: '0 14px', cursor: 'pointer' }}
          >
            <Plus size={16} />
          </button>
        </div>
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 6 }}>
          Invoice number is optional — enter just the amount to claim this month.
        </div>
        {error && <div style={{ color: '#ae272b', fontSize: 11, marginTop: 8 }}>{error}</div>}
      </div>
    </>
  );
}

function DatesEditor({ project }: { project: WipProject }) {
  const { updateProject } = useWipProjects();
  const [contractStart, setContractStart] = useState(project.contract_start_date ?? '');
  const [siteStart, setSiteStart] = useState(project.start_date ?? '');
  const [completion, setCompletion] = useState(project.planned_completion_date ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await updateProject(project.id, {
      contract_start_date: contractStart || null,
      start_date: siteStart || null,
      planned_completion_date: completion || null,
    });
    setSaving(false);
  }

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 10 }}>Key dates</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div>
          <label style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>Contract start</label>
          <input type="date" value={contractStart} onChange={(e) => setContractStart(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 6, border: '0.5px solid var(--color-border)', fontSize: 12 }} />
        </div>
        <div>
          <label style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>Site start</label>
          <input type="date" value={siteStart} onChange={(e) => setSiteStart(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 6, border: '0.5px solid var(--color-border)', fontSize: 12 }} />
        </div>
        <div>
          <label style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>Planned completion</label>
          <input type="date" value={completion} onChange={(e) => setCompletion(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 6, border: '0.5px solid var(--color-border)', fontSize: 12 }} />
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{ marginTop: 4, background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
        >
          {saving ? 'Saving…' : 'Save dates'}
        </button>
      </div>
    </div>
  );
}

function ProjectDetail({ project, onBack }: { project: WipProject; onBack: () => void }) {
  const { crew } = useProjectCrew(project.id);
  const { variations } = useVariations(project.id);

  const spendPct = project.quoted_value
    ? Math.round((project.actual_spend / project.quoted_value) * 100)
    : 0;

  return (
    <div className="app-content">
      <button
        onClick={onBack}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: 13, fontWeight: 600, marginTop: 12, marginBottom: 16, cursor: 'pointer', padding: 0 }}
      >
        <ArrowLeft size={16} /> Back to WIP
      </button>

      <div className="page-header">
        <div className="page-header-title">{project.project_name}</div>
        <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
          {project.client} · {project.state} {project.current_stage ? `· ${project.current_stage}` : ''}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Completion</span>
          <span style={{ fontSize: 12, fontWeight: 700 }}>{project.completion_percentage}%</span>
        </div>
        <div style={{ height: 8, background: '#f0f0f0', borderRadius: 4, marginBottom: 16 }}>
          <div style={{ height: 8, width: `${project.completion_percentage}%`, background: 'var(--color-primary)', borderRadius: 4 }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Quoted value</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{formatMoney(project.quoted_value)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Actual spend ({spendPct}%)</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{formatMoney(project.actual_spend)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Completion date</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>
              {project.planned_completion_date ? new Date(project.planned_completion_date).toLocaleDateString('en-AU') : '—'}
            </div>
          </div>
        </div>
      </div>

      <InvoiceLog project={project} />

      <DatesEditor project={project} />

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {project.procore_link && (
          <a href={project.procore_link} target="_blank" rel="noreferrer" className="card" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, fontWeight: 600, textDecoration: 'none', color: 'var(--color-text)' }}>
            <ExternalLink size={16} /> Procore
          </a>
        )}
        {project.onedrive_folder_link && (
          <a href={project.onedrive_folder_link} target="_blank" rel="noreferrer" className="card" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, fontWeight: 600, textDecoration: 'none', color: 'var(--color-text)' }}>
            <Folder size={16} /> OneDrive
          </a>
        )}
      </div>

      <div className="section-title">Crew assigned</div>
      <div className="card" style={{ marginBottom: 16 }}>
        {crew.length === 0 && <div className="empty-state" style={{ padding: 8 }}>No crew assigned yet.</div>}
        {crew.map((c, idx) => (
          <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: idx < crew.length - 1 ? 8 : 0, marginBottom: idx < crew.length - 1 ? 8 : 0, borderBottom: idx < crew.length - 1 ? '0.5px solid var(--color-border)' : 'none' }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{c.full_name ?? 'Unknown'}</span>
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{c.role ?? ''}</span>
          </div>
        ))}
      </div>

      <div className="section-title">Variations</div>
      <div className="card">
        {variations.length === 0 && <div className="empty-state" style={{ padding: 8 }}>No variations on this project.</div>}
        {variations.map((v, idx) => (
          <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: idx < variations.length - 1 ? 8 : 0, marginBottom: idx < variations.length - 1 ? 8 : 0, borderBottom: idx < variations.length - 1 ? '0.5px solid var(--color-border)' : 'none' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{v.variation_number ?? 'Variation'}</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{v.description}</div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700 }}>{formatMoney(v.cost_impact)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WipProjectsList() {
  const { projects, loading, error } = useWipProjects();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<WipProject | null>(null);

  const filtered = useMemo(() => {
    return projects.filter(
      (p) =>
        search.trim() === '' ||
        p.project_name.toLowerCase().includes(search.toLowerCase()) ||
        p.client.toLowerCase().includes(search.toLowerCase())
    );
  }, [projects, search]);

  if (selected) {
    return <ProjectDetail project={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="app-content">
      <div className="page-header">
        <div className="page-header-subtitle">Business</div>
        <div className="page-header-title">WIP Projects</div>
      </div>

      <div style={{ position: 'relative', marginBottom: 16 }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#999' }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or client"
          style={{ width: '100%', padding: '10px 12px 10px 34px', borderRadius: 8, border: '0.5px solid var(--color-border)', fontSize: 13 }}
        />
      </div>

      {error && <div className="card" style={{ color: '#ae272b', marginBottom: 12 }}>{error}</div>}
      {loading && <div className="empty-state">Loading projects…</div>}
      {!loading && filtered.length === 0 && <div className="empty-state">No projects found.</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map((p) => (
          <div key={p.id} onClick={() => setSelected(p)} className="card" style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{p.project_name}</div>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary)' }}>{p.completion_percentage}%</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 6 }}>
              {p.client} · {p.state} {p.current_stage ? `· ${p.current_stage}` : ''}
            </div>
            <div style={{ height: 6, background: '#f0f0f0', borderRadius: 3 }}>
              <div style={{ height: 6, width: `${p.completion_percentage}%`, background: 'var(--color-primary)', borderRadius: 3 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
