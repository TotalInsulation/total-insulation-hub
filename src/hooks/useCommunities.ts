import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Community } from '../types';

export function useCommunities(channelId: string | null) {
  const { appUser } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCommunities = useCallback(async () => {
    if (!channelId) {
      setCommunities([]);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('communities')
      .select('*')
      .eq('channel_id', channelId)
      .eq('archived', false)
      .order('community_type', { ascending: true })
      .order('name', { ascending: true });

    setCommunities((data ?? []) as Community[]);
    setLoading(false);
  }, [channelId]);

  useEffect(() => {
    fetchCommunities();

    const channel = supabase
      .channel(`communities-${channelId ?? 'none'}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'communities' },
        fetchCommunities
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchCommunities, channelId]);

  async function createCommunity(name: string, memberIds: string[]) {
    if (!channelId) return { error: 'No channel selected' };

    const { data, error } = await supabase
      .from('communities')
      .insert({
        channel_id: channelId,
        name,
        community_type: 'custom',
        created_by: appUser?.id ?? null,
      })
      .select()
      .single();

    if (error) return { error: error.message };

    const membersToAdd = Array.from(new Set([...memberIds, appUser?.id].filter(Boolean))) as string[];

    if (membersToAdd.length > 0) {
      await supabase.from('community_members').insert(
        membersToAdd.map((userId) => ({
          community_id: data.id,
          user_id: userId,
          role: userId === appUser?.id ? 'admin' : 'member',
        }))
      );
    }

    return { error: null };
  }

  return { communities, loading, refresh: fetchCommunities, createCommunity };
}

export function useCommunityMembers(communityId: string | null) {
  const [members, setMembers] = useState<{ id: string; user_id: string; role: string; full_name?: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    if (!communityId) {
      setMembers([]);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('community_members')
      .select('id, user_id, role, users(full_name)')
      .eq('community_id', communityId);

    const mapped = (data ?? []).map((row: any) => ({
      id: row.id,
      user_id: row.user_id,
      role: row.role,
      full_name: row.users?.full_name,
    }));

    setMembers(mapped);
    setLoading(false);
  }, [communityId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  async function addMember(userId: string) {
    if (!communityId) return;
    await supabase.from('community_members').insert({ community_id: communityId, user_id: userId });
    fetchMembers();
  }

  async function removeMember(userId: string) {
    if (!communityId) return;
    await supabase
      .from('community_members')
      .delete()
      .eq('community_id', communityId)
      .eq('user_id', userId);
    fetchMembers();
  }

  return { members, loading, addMember, removeMember, refresh: fetchMembers };
}
