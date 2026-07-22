import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Variation, VariationStatus } from '../types';

export function useVariations(projectId?: string) {
  const [variations, setVariations] = useState<Variation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVariations = useCallback(async () => {
    setError(null);
    let query = supabase
      .from('variations')
      .select('*, wip_projects(project_name)')
      .order('submitted_date', { ascending: false });

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;

    if (error) {
      setError('Could not load variations.');
      setLoading(false);
      return;
    }

    setVariations((data ?? []) as Variation[]);
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    fetchVariations();

    const channel = supabase
      .channel(`variations-list-${projectId ?? 'all'}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'variations' },
        fetchVariations
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchVariations, projectId]);

  async function createVariation(input: Partial<Variation>) {
    const { error } = await supabase.from('variations').insert(input);
    return { error: error?.message ?? null };
  }

  async function updateVariationStatus(id: string, status: VariationStatus) {
    const patch: Partial<Variation> = { status };
    if (status === 'approved') patch.approved_date = new Date().toISOString().slice(0, 10);
    if (status === 'completed') patch.completed_date = new Date().toISOString().slice(0, 10);

    const { error } = await supabase.from('variations').update(patch).eq('id', id);
    return { error: error?.message ?? null };
  }

  return {
    variations,
    loading,
    error,
    refresh: fetchVariations,
    createVariation,
    updateVariationStatus,
  };
}
