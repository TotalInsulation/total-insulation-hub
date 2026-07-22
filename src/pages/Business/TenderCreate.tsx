import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTenders } from '../../hooks/useTenders';
import { useAuth } from '../../contexts/AuthContext';

export default function TenderCreate({
  onBack,
  onCreated,
}: {
  onBack: () => void;
  onCreated: () => void;
}) {
  const { createTender } = useTenders();
  const { appUser } = useAuth();
  const [projectName, setProjectName] = useState('');
  const [client, setClient] = useState('');
  const [tenderNumber, setTenderNumber] = useState('');
  const [state, setState] = useState('VIC');
  const [quotedValue, setQuotedValue] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [procoreLink, setProcoreLink] = useState('');
  const [onedriveLink, setOnedriveLink] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!projectName.trim() || !client.trim()) {
      setError('Project name and client are required.');
      return;
    }

    setSaving(true);
    setError(null);

    const { error: createError } = await createTender({
      project_name: projectName.trim(),
      client: client.trim(),
      tender_number: tenderNumber.trim() || null,
      state: state as any,
      quoted_value: quotedValue ? Number(quotedValue) : null,
      due_date: dueDate || null,
      contact_name: contactName.trim() || null,
      contact_phone: contactPhone.trim() || null,
      contact_email: contactEmail.trim() || null,
      procore_link: procoreLink.trim() || null,
      onedrive_folder_link: onedriveLink.trim() || null,
      notes: notes.trim() || null,
      status: 'pending',
      created_by: appUser?.id ?? null,
    });

    setSaving(false);

    if (createError) {
      setError(createError);
      return;
    }

    onCreated();
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 8,
    border: '0.5px solid var(--color-border)',
    fontSize: 13,
    marginBottom: 12,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    marginBottom: 4,
    display: 'block',
  };

  return (
    <div className="app-content">
      <button
        onClick={onBack}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: 13, fontWeight: 600, marginTop: 12, marginBottom: 16, cursor: 'pointer', padding: 0 }}
      >
        <ArrowLeft size={16} /> Cancel
      </button>

      <div className="page-header">
        <div className="page-header-title">New Tender</div>
      </div>

      <form onSubmit={handleSubmit}>
        <label style={labelStyle}>Project name *</label>
        <input style={inputStyle} value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="e.g. VS8 Appin Insulation" />

        <label style={labelStyle}>Client *</label>
        <input style={inputStyle} value={client} onChange={(e) => setClient(e.target.value)} placeholder="e.g. Howden" />

        <label style={labelStyle}>Tender / reference number</label>
        <input style={inputStyle} value={tenderNumber} onChange={(e) => setTenderNumber(e.target.value)} placeholder="e.g. L006220-7-13-01" />

        <label style={labelStyle}>State</label>
        <select style={inputStyle} value={state} onChange={(e) => setState(e.target.value)}>
          <option value="NSW">NSW</option>
          <option value="VIC">VIC</option>
          <option value="WA">WA</option>
          <option value="QLD">QLD</option>
        </select>

        <label style={labelStyle}>Quoted value ($)</label>
        <input style={inputStyle} type="number" value={quotedValue} onChange={(e) => setQuotedValue(e.target.value)} placeholder="e.g. 3800000" />

        <label style={labelStyle}>Due date</label>
        <input style={inputStyle} type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />

        <label style={labelStyle}>Contact name</label>
        <input style={inputStyle} value={contactName} onChange={(e) => setContactName(e.target.value)} />

        <label style={labelStyle}>Contact phone</label>
        <input style={inputStyle} value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />

        <label style={labelStyle}>Contact email</label>
        <input style={inputStyle} type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />

        <label style={labelStyle}>Procore link</label>
        <input style={inputStyle} value={procoreLink} onChange={(e) => setProcoreLink(e.target.value)} placeholder="https://...procore.com/..." />

        <label style={labelStyle}>OneDrive folder link</label>
        <input style={inputStyle} value={onedriveLink} onChange={(e) => setOnedriveLink(e.target.value)} placeholder="https://...sharepoint.com/..." />

        <label style={labelStyle}>Notes (what was allowed for)</label>
        <textarea
          style={{ ...inputStyle, resize: 'none' }}
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        {error && <div style={{ color: 'var(--color-primary)', fontSize: 12, marginBottom: 12 }}>{error}</div>}

        <button
          type="submit"
          disabled={saving}
          style={{
            width: '100%',
            padding: 12,
            background: 'var(--color-primary)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {saving ? 'Creating…' : 'Create tender'}
        </button>
      </form>
    </div>
  );
}
