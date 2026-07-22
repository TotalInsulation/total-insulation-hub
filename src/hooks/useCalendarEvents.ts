import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { CalendarEvent } from '../types';

export function useCalendarEvents() {
  const { appUser } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    const { data } = await supabase
      .from('calendar_events')
      .select('*')
      .order('event_date', { ascending: true });

    setEvents((data ?? []) as CalendarEvent[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEvents();

    const channel = supabase
      .channel('calendar-events')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'calendar_events' }, fetchEvents)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchEvents]);

  async function createEvent(input: {
    title: string;
    description?: string;
    event_date: string;
    event_time?: string;
    location?: string;
    event_type: CalendarEvent['event_type'];
  }) {
    const { error } = await supabase.from('calendar_events').insert({
      ...input,
      created_by: appUser?.id ?? null,
    });
    return { error: error?.message ?? null };
  }

  async function deleteEvent(id: string) {
    const { error } = await supabase.from('calendar_events').delete().eq('id', id);
    return { error: error?.message ?? null };
  }

  return { events, loading, createEvent, deleteEvent };
}
