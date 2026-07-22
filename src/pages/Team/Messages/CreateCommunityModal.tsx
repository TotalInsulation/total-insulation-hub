import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useCommunities } from '../../../hooks/useCommunities';

export default function CreateCommunityModal({
  channelId,
  onClose,
}: {
  channelId: string;
  onClose: () => void;
}) {
  const { createCommunity } = useCommunities(channelId);
  const [name, setName] = useState('');
  const [allUsers, setAllUsers] = useState<{ id: string; full_name: string }[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('users')
      .select('id, full_name')
      .eq('active', true)
      .order('full_name')
      .then(({ data }) => setAllUsers((data ?? []) as any));
  }, []);

  function toggleUser(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleCreate() {
    if (!name.trim()) {
      setError('Give the group a name.');
      return;
    }
    setSaving(true);
    const { error } = await createCommunity(name.trim(), Array.from(selected));
    setSaving(false);
    if (error) {
      setError(error);
      return;
    }
    onClose();
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end', zIndex: 200 }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: '16px 16px 0 0', padding: 20, width: '100%', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}
      >
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>New group</div>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Group name"
          style={{ padding: '10px 12px', borderRadius: 8, border: '0.5px solid var(--color-border)', fontSize: 13, marginBottom: 12 }}
        />

        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 8 }}>
          Add members
        </div>

        <div style={{ overflowY: 'auto', flex: 1, marginBottom: 12 }}>
          {allUsers.map((u) => (
            <div
              key={u.id}
              onClick={() => toggleUser(u.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', cursor: 'pointer', borderBottom: '0.5px solid var(--color-border)' }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 5,
                  border: selected.has(u.id) ? 'none' : '1.5px solid var(--color-border)',
                  background: selected.has(u.id) ? '#3fa796' : 'transparent',
                }}
              />
              <span style={{ fontSize: 13 }}>{u.full_name}</span>
            </div>
          ))}
        </div>

        {error && <div style={{ color: '#ae272b', fontSize: 12, marginBottom: 8 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: 10, borderRadius: 8, border: '0.5px solid var(--color-border)', background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={saving}
            style={{ flex: 1, padding: 10, borderRadius: 8, border: 'none', background: 'var(--color-primary)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
          >
            {saving ? 'Creating…' : 'Create group'}
          </button>
        </div>
      </div>
    </div>
  );
}
