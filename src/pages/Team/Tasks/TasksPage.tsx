import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useTasks } from '../../../hooks/useTasks';
import type { Task } from '../../../types';

const STATUS_LABELS: Record<Task['status'], string> = {
  pending: 'Pending',
  in_progress: 'In progress',
  completed: 'Completed',
  on_hold: 'On hold',
};

const PRIORITY_COLORS: Record<Task['priority'], { bg: string; text: string }> = {
  low: { bg: '#F0F0F0', text: '#555' },
  medium: { bg: '#FFF9E6', text: '#8a6d00' },
  high: { bg: '#FFEAEA', text: '#ae272b' },
};

export default function TasksPage() {
  const { tasks, loading, createTask, updateTaskStatus } = useTasks();
  const [users, setUsers] = useState<{ id: string; full_name: string }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState<Set<string>>(new Set());
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from('users')
      .select('id, full_name')
      .eq('active', true)
      .then(({ data }) => setUsers((data ?? []) as any));
  }, []);

  function toggleAssignee(id: string) {
    setAssignedTo((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleCreate() {
    if (!title.trim() || assignedTo.size === 0) {
      setError('Give it a title and assign to at least one person.');
      return;
    }
    setSaving(true);
    setError(null);
    const { error } = await createTask({
      title: title.trim(),
      description: description.trim() || undefined,
      assigned_to: Array.from(assignedTo),
      due_date: dueDate || undefined,
      priority,
    });
    setSaving(false);
    if (error) {
      setError(error);
      return;
    }
    setShowForm(false);
    setTitle('');
    setDescription('');
    setAssignedTo(new Set());
    setDueDate('');
    setPriority('medium');
  }

  const userName = (id: string) => users.find((u) => u.id === id)?.full_name ?? 'Unknown';

  const grouped: Record<Task['status'], Task[]> = {
    pending: [],
    in_progress: [],
    completed: [],
    on_hold: [],
  };
  tasks.forEach((t) => grouped[t.status].push(t));

  return (
    <div className="app-content">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="page-header-subtitle">Team</div>
          <div className="page-header-title">Tasks</div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          <Plus size={16} /> New task
        </button>
      </div>

      {loading && <div className="empty-state">Loading…</div>}

      {(['pending', 'in_progress', 'completed', 'on_hold'] as const).map((status) => (
        <div key={status} style={{ marginBottom: 20 }}>
          <div className="section-title">{STATUS_LABELS[status]} ({grouped[status].length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {grouped[status].length === 0 && <div className="empty-state">Nothing here.</div>}
            {grouped[status].map((t) => {
              const colors = PRIORITY_COLORS[t.priority];
              return (
                <div key={t.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{t.title}</span>
                    <span style={{ background: colors.bg, color: colors.text, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6 }}>
                      {t.priority}
                    </span>
                  </div>
                  {t.description && <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 6 }}>{t.description}</div>}
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 8 }}>
                    {t.assigned_to.map(userName).join(', ')}
                    {t.due_date ? ` · Due ${new Date(t.due_date).toLocaleDateString('en-AU')}` : ''}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {(['pending', 'in_progress', 'completed', 'on_hold'] as const)
                      .filter((s) => s !== status)
                      .map((s) => (
                        <button
                          key={s}
                          onClick={() => updateTaskStatus(t.id, s)}
                          style={{ fontSize: 11, fontWeight: 600, padding: '5px 10px', borderRadius: 6, border: '0.5px solid var(--color-border)', background: '#fff', cursor: 'pointer' }}
                        >
                          {STATUS_LABELS[s]}
                        </button>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end', zIndex: 200 }} onClick={() => setShowForm(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: '16px 16px 0 0', padding: 20, width: '100%', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>New task</div>

            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" style={{ width: '100%', padding: 10, borderRadius: 8, border: '0.5px solid var(--color-border)', fontSize: 13, marginBottom: 10 }} />

            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" rows={3} style={{ width: '100%', padding: 10, borderRadius: 8, border: '0.5px solid var(--color-border)', fontSize: 13, marginBottom: 10, resize: 'none' }} />

            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6 }}>Assign to</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => toggleAssignee(u.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 20,
                    border: assignedTo.has(u.id) ? '1px solid var(--color-primary)' : '0.5px solid var(--color-border)',
                    background: assignedTo.has(u.id) ? 'var(--color-primary-light)' : '#fff',
                    color: assignedTo.has(u.id) ? 'var(--color-primary)' : '#555',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {u.full_name}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={{ flex: 1, padding: 10, borderRadius: 8, border: '0.5px solid var(--color-border)', fontSize: 13 }} />
              <select value={priority} onChange={(e) => setPriority(e.target.value as Task['priority'])} style={{ flex: 1, padding: 10, borderRadius: 8, border: '0.5px solid var(--color-border)', fontSize: 13 }}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {error && <div style={{ color: '#ae272b', fontSize: 12, marginBottom: 10 }}>{error}</div>}

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: 10, borderRadius: 8, border: '0.5px solid var(--color-border)', background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Cancel</button>
              <button onClick={handleCreate} disabled={saving} style={{ flex: 1, padding: 10, borderRadius: 8, border: 'none', background: 'var(--color-primary)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                {saving ? 'Creating…' : 'Create task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
