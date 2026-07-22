import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface ScheduleRow {
  id: number;
  worker_id: number;
  week_start: string;
  days: Record<string, string>;
}

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri'] as const;

/**
 * Reads directly from the Orders app's "schedules" table — the same weekly
 * roster crew already see there. Nothing is duplicated; this is read-only
 * from the Hub's side (editing the roster still happens in Orders).
 */
export function useWeeklySchedule(state: string) {
  const [availableWeeks, setAvailableWeeks] = useState<string[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
  const [rows, setRows] = useState<ScheduleRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWeeks = useCallback(async () => {
    const { data } = await supabase
      .from('schedules')
      .select('week_start')
      .eq('state', state)
      .order('week_start', { ascending: true });

    const unique = Array.from(new Set((data ?? []).map((r) => r.week_start)));
    setAvailableWeeks(unique);

    // Default to the closest upcoming week, or the latest available
    const today = new Date().toISOString().slice(0, 10);
    const upcoming = unique.find((w) => w >= today);
    setSelectedWeek(upcoming ?? unique[unique.length - 1] ?? null);
  }, [state]);

  useEffect(() => {
    fetchWeeks();
  }, [fetchWeeks]);

  const fetchRows = useCallback(async () => {
    if (!selectedWeek) {
      setRows([]);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('schedules')
      .select('id, worker_id, week_start, days')
      .eq('state', state)
      .eq('week_start', selectedWeek);

    setRows((data ?? []) as ScheduleRow[]);
    setLoading(false);
  }, [state, selectedWeek]);

  useEffect(() => {
    setLoading(true);
    fetchRows();

    const channel = supabase
      .channel(`schedules-${state}-${selectedWeek}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'schedules' }, fetchRows)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRows, state, selectedWeek]);

  return { availableWeeks, selectedWeek, setSelectedWeek, rows, loading, dayKeys: DAY_KEYS };
}
