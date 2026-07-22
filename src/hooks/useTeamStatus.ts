import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface TeamMemberStatus {
  userId: string;
  fullName: string;
  isOnline: boolean;
  currentActivity: string | null;
  lastActiveAt: string;
}

function formatLastActive(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 2) return 'Active now';
  if (mins < 60) return `Last active ${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `Last active ${hours}hr${hours > 1 ? 's' : ''} ago`;
  const days = Math.round(hours / 24);
  return `Last active ${days}d ago`;
}

/**
 * Super admin (Jordan/Nelson) view of every worker's online status.
 * Reads the online_status table joined with users, for both office and
 * onsite crew.
 */
export function useTeamStatus() {
  const [members, setMembers] = useState<TeamMemberStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    const { data, error } = await supabase
      .from('online_status')
      .select('user_id, is_online, current_activity, last_active_at, users(full_name)')
      .order('last_active_at', { ascending: false });

    if (error) {
      console.error('Failed to load team status', error);
      setLoading(false);
      return;
    }

    const mapped: TeamMemberStatus[] = (data ?? []).map((row: any) => ({
      userId: row.user_id,
      fullName: row.users?.full_name ?? 'Unknown',
      isOnline: row.is_online,
      currentActivity: row.current_activity,
      lastActiveAt: row.last_active_at,
    }));

    setMembers(mapped);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStatus();

    const channel = supabase
      .channel('team-status')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'online_status' },
        fetchStatus
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchStatus]);

  return { members, loading, formatLastActive };
}
