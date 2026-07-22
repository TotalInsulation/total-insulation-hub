import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface MonthlySummary {
  monthKey: string; // e.g. "2026-07"
  monthLabel: string; // e.g. "July 2026"
  claimedThisMonth: number;
  invoiceCount: number;
}

export interface MonthClaimDetail {
  id: string;
  projectName: string;
  amount: number;
  invoiceDate: string;
  invoiceNumber: string | null;
}

export interface OverallTotals {
  totalQuotedValue: number;
  totalInvoicedToDate: number;
  totalBalanceRemaining: number;
}

/**
 * Builds a month-by-month breakdown of what was claimed (invoiced), plus
 * running totals across all active WIP projects — the same numbers your
 * Excel WIP sheet totalled by hand at the bottom, but always current and
 * with no new tab needed each month.
 */
export function useMonthlySummary() {
  const [months, setMonths] = useState<MonthlySummary[]>([]);
  const [overall, setOverall] = useState<OverallTotals>({
    totalQuotedValue: 0,
    totalInvoicedToDate: 0,
    totalBalanceRemaining: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [entriesRes, projectsRes] = await Promise.all([
      supabase.from('invoice_entries').select('amount, invoice_date'),
      supabase.from('wip_projects').select('quoted_value, invoiced_to_date'),
    ]);

    const entries = entriesRes.data ?? [];
    const projects = projectsRes.data ?? [];

    const grouped = new Map<string, { total: number; count: number }>();

    entries.forEach((e) => {
      const date = new Date(e.invoice_date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const existing = grouped.get(key) ?? { total: 0, count: 0 };
      existing.total += e.amount;
      existing.count += 1;
      grouped.set(key, existing);
    });

    const monthSummaries: MonthlySummary[] = Array.from(grouped.entries())
      .map(([key, val]) => {
        const [year, month] = key.split('-').map(Number);
        const label = new Date(year, month - 1, 1).toLocaleDateString('en-AU', {
          month: 'long',
          year: 'numeric',
        });
        return {
          monthKey: key,
          monthLabel: label,
          claimedThisMonth: val.total,
          invoiceCount: val.count,
        };
      })
      .sort((a, b) => (a.monthKey < b.monthKey ? 1 : -1));

    const totalQuotedValue = projects.reduce((sum, p) => sum + (p.quoted_value ?? 0), 0);
    const totalInvoicedToDate = projects.reduce((sum, p) => sum + (p.invoiced_to_date ?? 0), 0);

    setMonths(monthSummaries);
    setOverall({
      totalQuotedValue,
      totalInvoicedToDate,
      totalBalanceRemaining: totalQuotedValue - totalInvoicedToDate,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('monthly-summary')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invoice_entries' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wip_projects' }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  return { months, overall, loading };
}

export async function fetchMonthClaimDetail(monthKey: string): Promise<MonthClaimDetail[]> {
  const [year, month] = monthKey.split('-').map(Number);
  const startDate = new Date(year, month - 1, 1).toISOString().slice(0, 10);
  const endDate = new Date(year, month, 0).toISOString().slice(0, 10);

  const { data } = await supabase
    .from('invoice_entries')
    .select('id, amount, invoice_date, invoice_number, wip_projects(project_name)')
    .gte('invoice_date', startDate)
    .lte('invoice_date', endDate)
    .order('amount', { ascending: false });

  return (data ?? []).map((row: any) => ({
    id: row.id,
    projectName: row.wip_projects?.project_name ?? 'Unknown project',
    amount: row.amount,
    invoiceDate: row.invoice_date,
    invoiceNumber: row.invoice_number,
  }));
}
