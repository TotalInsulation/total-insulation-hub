import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface DashboardMetrics {
  activeTendersCount: number;
  wipProjectsCount: number;
  pipelineValue: number;
  pendingVariationsCount: number;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * Pulls the headline numbers for the Home dashboard.
 * Subscribes to realtime changes so the numbers update live when any
 * super admin edits a tender, WIP project, or variation.
 */
export function useDashboardMetrics(): DashboardMetrics {
  const [activeTendersCount, setActiveTendersCount] = useState(0);
  const [wipProjectsCount, setWipProjectsCount] = useState(0);
  const [pipelineValue, setPipelineValue] = useState(0);
  const [pendingVariationsCount, setPendingVariationsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    setError(null);
    try {
      const [tendersRes, wipRes, variationsRes] = await Promise.all([
        supabase
          .from('tenders')
          .select('quoted_value, status', { count: 'exact' })
          .in('status', ['pending', 'submitted']),
        supabase
          .from('wip_projects')
          .select('id', { count: 'exact', head: true }),
        supabase
          .from('variations')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'submitted'),
      ]);

      if (tendersRes.error) throw tendersRes.error;
      if (wipRes.error) throw wipRes.error;
      if (variationsRes.error) throw variationsRes.error;

      const pipeline = (tendersRes.data ?? []).reduce(
        (sum, t) => sum + (t.quoted_value ?? 0),
        0
      );

      setActiveTendersCount(tendersRes.count ?? 0);
      setWipProjectsCount(wipRes.count ?? 0);
      setPendingVariationsCount(variationsRes.count ?? 0);
      setPipelineValue(pipeline);
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
      setError('Could not load dashboard data. Pull down to retry.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();

    const channel = supabase
      .channel('dashboard-metrics')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tenders' },
        fetchMetrics
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'wip_projects' },
        fetchMetrics
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'variations' },
        fetchMetrics
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMetrics]);

  return {
    activeTendersCount,
    wipProjectsCount,
    pipelineValue,
    pendingVariationsCount,
    loading,
    error,
    refresh: fetchMetrics,
  };
}
