import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface LabourAllocation {
  id: string;
  worker_id: number;
  project_id: string;
  allocation_start_date: string;
  allocation_end_date: string;
  role: string | null;
  notes: string | null;
}

export function useLabourAllocations() {
  const [allocations, setAllocations] = useState<LabourAllocation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllocations = useCallback(async () => {
    const { data } = await supabase
      .from('labour_allocations')
      .select('*')
      .order('allocation_start_date', { ascending: true });

    setAllocations((data ?? []) as LabourAllocation[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAllocations();

    const channel = supabase
      .channel('labour-allocations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'labour_allocations' }, fetchAllocations)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAllocations]);

  function findConflicts(workerId: number, startDate: string, endDate: string, excludeId?: string) {
    return allocations.filter((a) => {
      if (a.worker_id !== workerId) return false;
      if (a.id === excludeId) return false;
      return a.allocation_start_date <= endDate && a.allocation_end_date >= startDate;
    });
  }

  async function createAllocation(input: {
    worker_id: number;
    project_id: string;
    allocation_start_date: string;
    allocation_end_date: string;
    role: string;
    notes?: string;
  }) {
    const { error } = await supabase.from('labour_allocations').insert(input);
    return { error: error?.message ?? null };
  }

  async function deleteAllocation(id: string) {
    const { error } = await supabase.from('labour_allocations').delete().eq('id', id);
    return { error: error?.message ?? null };
  }

  return { allocations, loading, findConflicts, createAllocation, deleteAllocation };
}
