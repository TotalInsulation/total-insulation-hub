import React, { useState } from 'react';
import { Plus, Calendar as CalendarIcon, Trash2 } from 'lucide-react';
import { useCalendarEvents } from '../../../hooks/useCalendarEvents';
import type { CalendarEvent } from '../../../types';

const TYPE_COLORS: Record<CalendarEvent['event_type'], { bg: string; text: string }> = {
  meeting: { bg: '#E8F0FF', text: '#1d4ed8' },
  deadline: { bg: '#FFEAEA', text: '#ae272b' },
  site_visit: { bg: '#E8F4F0', text: '#0f6e56' },
  event: { bg: '#FFF9E6', text: '#8a6d00' },
};

const TYPE_LABELS: Record<CalendarEvent['event_type'], string> = {
  meeting: 'Meeting',
  deadline: 'Deadline',
  site_visit: 'Site visit',
  event: 'Event',
};

export default function CalendarPage() {
  const { events, loading, createEvent, deleteEvent } = useCalendarEvents();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [location, setLocation] = useState('');
  const [eventType, setEventType] = useState<CalendarEvent['event_type']>('meeting');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const upcoming = events.filter((e) => e.event_date >= new Date().toISOString().slice(0, 10));
  const past = events.filter((e) => e.event_date < new Date().toISOString().slice(0, 10));

  async function handleCreate() {
    if (!title.trim() || !eventDate) {
      setError('Give the event a title and date.');
      return;
    }
    setSaving(true);
    setError(null);
    const { error } = await createEvent({
      title: title.trim(),
      description: description.trim() || undefined,
      event_date: eventDate,
      event_time: eventTime || undefined,
      location: location.trim() || undefined,
      event_type: eventType,
    });
    setSaving(false);
    if (error) {
      setError(error);
      return;
    }
    setShowForm(false);
    setTitle('');
    setEventDate('');
    setEventTime('');
    setLocation('');
    setDescription('');
  }

  function renderEvent(e: CalendarEvent) {
    const colors = TYPE_COLORS[e.event_type];
    return (
      <div key={e.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{e.title}</span>
            <span style={{ background: colors.bg, color: colors.text, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6 }}>
              {TYPE_LABELS[e.event_type]}
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
            {new Date(e.event_date).toLocaleDateString('en-AU', { weekday: 'short', day: '2-digit', month: 'short' })}
            {e.event_time ? ` · ${e.event_time.slice(0, 5)}` : ''}
            {e.location ? ` · ${e.location}` : ''}
          </div>
          {e.description && <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>{e.description}</div>}
        </div>
        <button onClick={() => deleteEvent(e.id)} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}>
          <Trash2 size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="app-content">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="page-header-subtitle">Team</div>
          <div className="page-header-title">Calendar</div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          <Plus size={16} /> New event
        </button>
      </div>

      {loading && <div className="empty-state">Loading…</div>}

      <div className="section-title">Upcoming</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {upcoming.length === 0 && <div className="empty-state">Nothing scheduled.</div>}
        {upcoming.map(renderEvent)}
      </div>

      {past.length > 0 && (
        <>
          <div className="section-title">Past</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, opacity: 0.6 }}>
            {past.map(renderEvent)}
          </div>
        </>
      )}

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end', zIndex: 200 }} onClick={() => setShowForm(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: '16px 16px 0 0', padding: 20, width: '100%', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>New event</div>

            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title" style={{ width: '100%', padding: 10, borderRadius: 8, border: '0.5px solid var(--color-border)', fontSize: 13, marginBottom: 10 }} />

            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} style={{ flex: 1, padding: 10, borderRadius: 8, border: '0.5px solid var(--color-border)', fontSize: 13 }} />
              <input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} style={{ flex: 1, padding: 10, borderRadius: 8, border: '0.5px solid var(--color-border)', fontSize: 13 }} />
            </div>

            <select value={eventType} onChange={(e) => setEventType(e.target.value as CalendarEvent['event_type'])} style={{ width: '100%', padding: 10, borderRadius: 8, border: '0.5px solid var(--color-border)', fontSize: 13, marginBottom: 10 }}>
              <option value="meeting">Meeting</option>
              <option value="deadline">Deadline</option>
              <option value="site_visit">Site visit</option>
              <option value="event">Event</option>
            </select>

            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location (optional)" style={{ width: '100%', padding: 10, borderRadius: 8, border: '0.5px solid var(--color-border)', fontSize: 13, marginBottom: 10 }} />

            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Notes (optional)" rows={3} style={{ width: '100%', padding: 10, borderRadius: 8, border: '0.5px solid var(--color-border)', fontSize: 13, marginBottom: 10, resize: 'none' }} />

            {error && <div style={{ color: '#ae272b', fontSize: 12, marginBottom: 10 }}>{error}</div>}

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: 10, borderRadius: 8, border: '0.5px solid var(--color-border)', background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Cancel</button>
              <button onClick={handleCreate} disabled={saving} style={{ flex: 1, padding: 10, borderRadius: 8, border: 'none', background: 'var(--color-primary)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                {saving ? 'Saving…' : 'Create event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
