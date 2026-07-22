import React, { useState } from 'react';
import { ArrowLeft, ExternalLink, FileText, Folder, Plus, Check } from 'lucide-react';
import { useTenders, useTenderOutstandingItems } from '../../hooks/useTenders';
import type { Tender, TenderStatus } from '../../types';

const STATUS_OPTIONS: TenderStatus[] = ['pending', 'submitted', 'won', 'lost', 'no_works'];
const STATUS_LABELS: Record<TenderStatus, string> = {
  pending: 'Pending',
  submitted: 'Submitted',
  won: 'Won',
  lost: 'Lost',
  no_works: 'No Works',
};

function formatMoney(value: number | null): string {
  if (value === null || value === undefined) return '—';
  return `$${value.toLocaleString('en-AU', { maximumFractionDigits: 0 })}`;
}

export default function TenderDetail({
  tender,
  onBack,
}: {
  tender: Tender;
  onBack: () => void;
}) {
  const { updateTenderStatus, updateTender } = useTenders();
  const { items, addItem, toggleComplete } = useTenderOutstandingItems(tender.id);
  const [showNotes, setShowNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState(tender.notes ?? '');
  const [savingNotes, setSavingNotes] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemOwner, setNewItemOwner] = useState('');

  async function handleStatusChange(status: TenderStatus) {
    await updateTenderStatus(tender.id, status);
  }

  async function handleSaveNotes() {
    setSavingNotes(true);
    await updateTender(tender.id, { notes: notesDraft });
    setSavingNotes(false);
    setShowNotes(false);
  }

  async function handleAddItem() {
    if (!newItemName.trim()) return;
    await addItem(newItemName.trim(), newItemOwner.trim(), null);
    setNewItemName('');
    setNewItemOwner('');
  }

  return (
    <div className="app-content">
      <button
        onClick={onBack}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: 13, fontWeight: 600, marginTop: 12, marginBottom: 16, cursor: 'pointer', padding: 0 }}
      >
        <ArrowLeft size={16} /> Back to tenders
      </button>

      <div className="page-header" style={{ marginBottom: 12 }}>
        <div className="page-header-title">{tender.project_name}</div>
        <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
          {tender.client} {tender.tender_number ? `· ${tender.tender_number}` : ''}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 2 }}>Quoted value</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{formatMoney(tender.quoted_value)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 2 }}>Due date</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>
              {tender.due_date ? new Date(tender.due_date).toLocaleDateString('en-AU') : '—'}
            </div>
          </div>
        </div>

        {(tender.contact_name || tender.contact_phone || tender.contact_email) && (
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 12 }}>
            {tender.contact_name} {tender.contact_phone ? `· ${tender.contact_phone}` : ''}{' '}
            {tender.contact_email ? `· ${tender.contact_email}` : ''}
          </div>
        )}

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              style={{
                padding: '6px 12px',
                borderRadius: 20,
                border: tender.status === s ? '1px solid var(--color-primary)' : '0.5px solid var(--color-border)',
                background: tender.status === s ? 'var(--color-primary)' : '#fff',
                color: tender.status === s ? '#fff' : '#555',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => setShowNotes(true)}
          className="card"
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
        >
          <FileText size={16} /> Notes
        </button>
        {tender.procore_link && (
          <a
            href={tender.procore_link}
            target="_blank"
            rel="noreferrer"
            className="card"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, fontWeight: 600, textDecoration: 'none', color: 'var(--color-text)' }}
          >
            <ExternalLink size={16} /> Procore
          </a>
        )}
        {tender.onedrive_folder_link && (
          <a
            href={tender.onedrive_folder_link}
            target="_blank"
            rel="noreferrer"
            className="card"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, fontWeight: 600, textDecoration: 'none', color: 'var(--color-text)' }}
          >
            <Folder size={16} /> OneDrive
          </a>
        )}
      </div>

      <div className="section-title">Outstanding items</div>
      <div className="card" style={{ marginBottom: 16 }}>
        {items.length === 0 && (
          <div className="empty-state" style={{ padding: 8 }}>No outstanding items.</div>
        )}
        {items.map((item, idx) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              paddingBottom: idx < items.length - 1 ? 10 : 0,
              marginBottom: idx < items.length - 1 ? 10 : 0,
              borderBottom: idx < items.length - 1 ? '0.5px solid var(--color-border)' : 'none',
            }}
          >
            <button
              onClick={() => toggleComplete(item.id, !item.completed)}
              style={{
                width: 20,
                height: 20,
                borderRadius: 5,
                border: item.completed ? 'none' : '1.5px solid var(--color-border)',
                background: item.completed ? '#3fa796' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              {item.completed && <Check size={13} color="#fff" />}
            </button>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: item.completed ? 'line-through' : 'none',
                  color: item.completed ? 'var(--color-text-muted)' : 'var(--color-text)',
                }}
              >
                {item.item_name}
              </div>
              {item.owner && (
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{item.owner}</div>
              )}
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', gap: 6, marginTop: 12, paddingTop: items.length > 0 ? 12 : 0, borderTop: items.length > 0 ? '0.5px solid var(--color-border)' : 'none' }}>
          <input
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="New item"
            style={{ flex: 2, padding: '8px 10px', borderRadius: 6, border: '0.5px solid var(--color-border)', fontSize: 12 }}
          />
          <input
            value={newItemOwner}
            onChange={(e) => setNewItemOwner(e.target.value)}
            placeholder="Owner"
            style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: '0.5px solid var(--color-border)', fontSize: 12 }}
          />
          <button
            onClick={handleAddItem}
            style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 6, padding: '0 12px', cursor: 'pointer' }}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {showNotes && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'flex-end',
            zIndex: 200,
          }}
          onClick={() => setShowNotes(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '16px 16px 0 0',
              padding: 20,
              width: '100%',
              maxHeight: '70vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>
              What was allowed for
            </div>
            <textarea
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              rows={8}
              style={{
                width: '100%',
                border: '0.5px solid var(--color-border)',
                borderRadius: 8,
                padding: 10,
                fontSize: 13,
                fontFamily: 'inherit',
                resize: 'none',
              }}
              placeholder="Scope, exclusions, notes on what this tender/job allowed for…"
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button
                onClick={() => setShowNotes(false)}
                style={{ flex: 1, padding: 10, borderRadius: 8, border: '0.5px solid var(--color-border)', background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNotes}
                disabled={savingNotes}
                style={{ flex: 1, padding: 10, borderRadius: 8, border: 'none', background: 'var(--color-primary)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
              >
                {savingNotes ? 'Saving…' : 'Save notes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
