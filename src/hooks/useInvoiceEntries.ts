import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface InvoiceEntry {
  id: string;
  project_id: string;
  invoice_number: string | null;
  amount: number;
  invoice_date: string;
  notes: string | null;
  created_at: string;
}

export function useInvoiceEntries(projectId: string) {
  const [entries, setEntries] = useState<InvoiceEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    const { data } = await supabase
      .from('invoice_entries')
      .select('*')
      .eq('project_id', projectId)
      .order('invoice_date', { ascending: false });

    setEntries((data ?? []) as InvoiceEntry[]);
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    fetchEntries();

    // wip_projects also updates here because the database trigger recalculates
    // invoiced_to_date the moment an entry changes — the parent list/detail
    // hooks for wip_projects will pick that up via their own realtime subscription.
    const channel = supabase
      .channel(`invoice-entries-${projectId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'invoice_entries', filter: `project_id=eq.${projectId}` },
        fetchEntries
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchEntries, projectId]);

  async function addEntry(amount: number, invoiceNumber: string, invoiceDate: string, notes: string) {
    const { error } = await supabase.from('invoice_entries').insert({
      project_id: projectId,
      amount,
      invoice_number: invoiceNumber || null,
      invoice_date: invoiceDate,
      notes: notes || null,
    });
    return { error: error?.message ?? null };
  }

  async function deleteEntry(id: string) {
    const { error } = await supabase.from('invoice_entries').delete().eq('id', id);
    return { error: error?.message ?? null };
  }

  return { entries, loading, addEntry, deleteEntry };
}
