import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Task } from '../types';

export function useTasks() {
  const { appUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .order('due_date', { ascending: true, nullsFirst: false });

    setTasks((data ?? []) as Task[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTasks();

    const channel = supabase
      .channel('tasks-list')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchTasks)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTasks]);

  async function createTask(input: {
    title: string;
    description?: string;
    assigned_to: string[];
    due_date?: string;
    priority: Task['priority'];
  }) {
    const { error } = await supabase.from('tasks').insert({
      ...input,
      created_by: appUser?.id,
      status: 'pending',
    });
    return { error: error?.message ?? null };
  }

  async function updateTaskStatus(id: string, status: Task['status']) {
    const { error } = await supabase.from('tasks').update({ status }).eq('id', id);
    return { error: error?.message ?? null };
  }

  return { tasks, loading, createTask, updateTaskStatus };
}
