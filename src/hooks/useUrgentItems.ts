import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface UrgentItem {
  id: string;
  title: string;
  subtitle: string;
  badge: 'URGENT' | 'NEW' | 'ACTION' | 'ETA';
  badgeClass: 'badge-urgent' | 'badge-new' | 'badge-eta' | 'badge-pending';
}

function daysUntil(dateStr: string): number {
  const due = new Date(dateStr);
  const now = new Date();
  due.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - now.getTime()) / 86400000);
}

export function useUrgentItems() {
  const [items, setItems] = useState<UrgentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    const results: UrgentItem[] = [];

    const { data: tenders } = await supabase
      .from('tenders')
      .select('id, project_name, due_date, tender_number')
      .in('status', ['pending', 'submitted'])
      .not('due_date', 'is', null)
      .order('due_date', { ascending: true })
      .limit(20);

    (tenders ?? []).forEach((t) => {
      if (!t.due_date) return;
      const days = daysUntil(t.due_date);
      if (days <= 7) {
        results.push({
          id: `tender-${t.id}`,
          title: `${t.project_name} tender due`,
          subtitle: t.tender_number ?? 'No reference',
          badge: 'URGENT',
          badgeClass: 'badge-urgent',
        });
      }
    });

    const { data: variations } = await supabase
      .from('variations')
      .select('id, variation_number, description, status')
      .eq('status', 'approved')
      .order('approved_date', { ascending: false })
      .limit(5);

    (variations ?? []).forEach((v) => {
      results.push({
        id: `variation-${v.id}`,
        title: `Variation ${v.variation_number ?? ''} approved`,
        subtitle: 'Ready to invoice',
        badge: 'NEW',
        badgeClass: 'badge-new',
      });
    });

    setItems(results.slice(0, 10));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();

    const channel = supabase
      .channel('urgent-items')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tenders' },
        fetchItems
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'variations' },
        fetchItems
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchItems]);

  return { items, loading };
}
