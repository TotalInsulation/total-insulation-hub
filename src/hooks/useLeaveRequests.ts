import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface LeaveRequest {
  id: string;
  worker_id: number;
  start_date: string;
  end_date: string;
  reason: 'annual' | 'sick' | 'comp' | 'other';
  status: 'pending' | 'approved' | 'rejected';
  approved_by: string | null;
  approved_date: string | null;
  created_at: string;
}

export function useLeaveRequests() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    const { data } = await supabase
      .from('leave_requests')
      .select('*')
      .order('created_at', { ascending: false });

    setRequests((data ?? []) as LeaveRequest[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRequests();

    const channel = supabase
      .channel('leave-requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leave_requests' }, fetchRequests)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRequests]);

  async function updateStatus(id: string, status: 'approved' | 'rejected', approvedBy: string) {
    const { error } = await supabase
      .from('leave_requests')
      .update({
        status,
        approved_by: approvedBy,
        approved_date: new Date().toISOString().slice(0, 10),
      })
      .eq('id', id);

    return { error: error?.message ?? null };
  }

  async function createRequest(input: {
    worker_id: number;
    start_date: string;
    end_date: string;
    reason: LeaveRequest['reason'];
  }) {
    const { error } = await supabase.from('leave_requests').insert(input);
    return { error: error?.message ?? null };
  }

  return { requests, loading, updateStatus, createRequest };
}
