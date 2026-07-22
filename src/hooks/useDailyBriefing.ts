import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface DailyBriefing {
  id: string;
  briefing_date: string;
  content: string;
  created_by: string | null;
  created_at: string;
}

export function useDailyBriefing() {
  const { appUser } = useAuth();
  const [briefings, setBriefings] = useState<DailyBriefing[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBriefings = useCallback(async () => {
    const { data } = await supabase
      .from('daily_briefings')
      .select('*')
      .order('briefing_date', { ascending: false })
      .limit(30);

    setBriefings((data ?? []) as DailyBriefing[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBriefings();

    const channel = supabase
      .channel('daily-briefings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_briefings' }, fetchBriefings)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchBriefings]);

  const today = new Date().toISOString().slice(0, 10);
  const todaysBriefing = briefings.find((b) => b.briefing_date === today) ?? null;

  async function postBriefing(content: string) {
    if (!appUser) return { error: 'Not signed in' };

    if (todaysBriefing) {
      const { error } = await supabase
        .from('daily_briefings')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', todaysBriefing.id);
      return { error: error?.message ?? null };
    }

    const { error } = await supabase.from('daily_briefings').insert({
      briefing_date: today,
      content,
      created_by: appUser.id,
    });
    return { error: error?.message ?? null };
  }

  return { briefings, todaysBriefing, loading, postBriefing };
}
