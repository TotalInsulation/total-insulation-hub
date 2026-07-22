import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Tender, TenderStatus } from '../types';

export function useTenders() {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTenders = useCallback(async () => {
    setError(null);
    const { data, error } = await supabase
      .from('tenders')
      .select('*')
      .order('due_date', { ascending: true, nullsFirst: false });

    if (error) {
      setError('Could not load tenders.');
      setLoading(false);
      return;
    }

    setTenders((data ?? []) as Tender[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTenders();

    const channel = supabase
      .channel('tenders-list')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tenders' },
        fetchTenders
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTenders]);

  async function createTender(input: Partial<Tender>) {
    const { error } = await supabase.from('tenders').insert(input);
    return { error: error?.message ?? null };
  }

  async function updateTender(id: string, input: Partial<Tender>) {
    const { error } = await supabase.from('tenders').update(input).eq('id', id);
    return { error: error?.message ?? null };
  }

  async function updateTenderStatus(id: string, status: TenderStatus) {
    return updateTender(id, { status });
  }

  return {
    tenders,
    loading,
    error,
    refresh: fetchTenders,
    createTender,
    updateTender,
    updateTenderStatus,
  };
}

export function useTenderOutstandingItems(tenderId: string | null) {
  const [items, setItems] = useState<
    { id: string; item_name: string; owner: string | null; due_date: string | null; completed: boolean }[]
  >([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    if (!tenderId) {
      setItems([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from('tender_outstanding_items')
      .select('*')
      .eq('tender_id', tenderId)
      .order('created_at', { ascending: true });

    setItems(data ?? []);
    setLoading(false);
  }, [tenderId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  async function addItem(itemName: string, owner: string, dueDate: string | null) {
    if (!tenderId) return;
    await supabase.from('tender_outstanding_items').insert({
      tender_id: tenderId,
      item_name: itemName,
      owner,
      due_date: dueDate,
    });
    fetchItems();
  }

  async function toggleComplete(itemId: string, completed: boolean) {
    await supabase
      .from('tender_outstanding_items')
      .update({ completed })
      .eq('id', itemId);
    fetchItems();
  }

  return { items, loading, addItem, toggleComplete, refresh: fetchItems };
}
