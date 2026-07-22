import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { WipProject } from '../types';

export function useWipProjects() {
  const [projects, setProjects] = useState<WipProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setError(null);
    const { data, error } = await supabase
      .from('wip_projects')
      .select('*')
      .order('planned_completion_date', { ascending: true, nullsFirst: false });

    if (error) {
      setError('Could not load WIP projects.');
      setLoading(false);
      return;
    }

    setProjects((data ?? []) as WipProject[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProjects();

    const channel = supabase
      .channel('wip-projects-list')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'wip_projects' },
        fetchProjects
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchProjects]);

  async function createProject(input: Partial<WipProject>) {
    const { error } = await supabase.from('wip_projects').insert(input);
    return { error: error?.message ?? null };
  }

  async function updateProject(id: string, input: Partial<WipProject>) {
    const { error } = await supabase.from('wip_projects').update(input).eq('id', id);
    return { error: error?.message ?? null };
  }

  return { projects, loading, error, refresh: fetchProjects, createProject, updateProject };
}

export function useProjectCrew(projectId: string | null) {
  const [crew, setCrew] = useState<
    { id: string; crew_member_id: string; role: string | null; start_date: string | null; end_date: string | null; full_name?: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  const fetchCrew = useCallback(async () => {
    if (!projectId) {
      setCrew([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from('project_crew_assignments')
      .select('id, crew_member_id, role, start_date, end_date, users(full_name)')
      .eq('project_id', projectId);

    const mapped = (data ?? []).map((row: any) => ({
      id: row.id,
      crew_member_id: row.crew_member_id,
      role: row.role,
      start_date: row.start_date,
      end_date: row.end_date,
      full_name: row.users?.full_name,
    }));

    setCrew(mapped);
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    fetchCrew();
  }, [fetchCrew]);

  return { crew, loading, refresh: fetchCrew };
}
