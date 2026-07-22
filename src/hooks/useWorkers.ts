import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface Worker {
  id: number;
  state: string;
  name: string;
  email: string | null;
  phone: string | null;
  active: boolean;
  is_admin: boolean;
}

/**
 * Reads directly from the Orders app's existing "workers" table. Nothing is
 * duplicated — adding or editing a worker in Orders shows up here as soon
 * as this refetches (or instantly, via the realtime subscription below).
 */
export function useWorkers() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchWorkers() {
      const { data, error } = await supabase
        .from('workers')
        .select('id, state, name, email, phone, active, is_admin')
        .eq('active', true)
        .order('name');

      if (!mounted) return;
      if (!error) setWorkers((data ?? []) as Worker[]);
      setLoading(false);
    }

    fetchWorkers();

    const channel = supabase
      .channel('workers-list')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workers' }, fetchWorkers)
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return { workers, loading };
}
