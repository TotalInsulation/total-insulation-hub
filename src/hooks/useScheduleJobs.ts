import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface ScheduleJob {
  id: number;
  state: string;
  code: string;
  name: string;
  color: string;
  active: boolean;
}

export function useScheduleJobs(state: string) {
  const [jobs, setJobs] = useState<ScheduleJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    supabase
      .from('schedule_jobs')
      .select('id, state, code, name, color, active')
      .eq('state', state)
      .eq('active', true)
      .then(({ data }) => {
        if (!mounted) return;
        setJobs((data ?? []) as ScheduleJob[]);
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [state]);

  return { jobs, loading };
}
