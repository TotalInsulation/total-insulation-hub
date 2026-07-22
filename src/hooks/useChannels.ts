import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Channel } from '../types';

export function useChannels() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('channels')
      .select('*')
      .order('name')
      .then(({ data }) => {
        setChannels((data ?? []) as Channel[]);
        setLoading(false);
      });
  }, []);

  return { channels, loading };
}
