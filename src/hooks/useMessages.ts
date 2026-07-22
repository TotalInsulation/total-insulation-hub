import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Message, MessageType } from '../types';

const EDIT_WINDOW_MS = 15 * 60 * 1000;

export function useMessages(communityId: string | null) {
  const { appUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    if (!communityId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    // Full history is always returned — there's no "joined at" cutoff, so a
    // new member sees everything from when the community was created.
    const { data } = await supabase
      .from('messages')
      .select('*, sender:users(id, full_name, photo_url)')
      .eq('community_id', communityId)
      .order('created_at', { ascending: true });

    setMessages((data ?? []) as unknown as Message[]);
    setLoading(false);
  }, [communityId]);

  useEffect(() => {
    fetchMessages();

    if (!communityId) return;

    const channel = supabase
      .channel(`messages-${communityId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages', filter: `community_id=eq.${communityId}` },
        fetchMessages
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMessages, communityId]);

  async function sendMessage(content: string, mentions: string[] = []) {
    if (!communityId || !appUser) return { error: 'Not ready' };
    if (!content.trim()) return { error: 'Message is empty' };

    const { error } = await supabase.from('messages').insert({
      community_id: communityId,
      user_id: appUser.id,
      content: content.trim(),
      message_type: 'text' as MessageType,
      mentions,
    });

    return { error: error?.message ?? null };
  }

  async function sendMedia(file: File, messageType: MessageType, caption?: string) {
    if (!communityId || !appUser) return { error: 'Not ready' };

    const path = `${communityId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('chat-media')
      .upload(path, file);

    if (uploadError) return { error: uploadError.message };

    const { data: urlData } = supabase.storage.from('chat-media').getPublicUrl(path);

    const { error } = await supabase.from('messages').insert({
      community_id: communityId,
      user_id: appUser.id,
      content: caption ?? null,
      message_type: messageType,
      media_urls: [urlData.publicUrl],
    });

    return { error: error?.message ?? null };
  }

  function canEdit(message: Message): boolean {
    if (message.user_id !== appUser?.id) return false;
    return Date.now() - new Date(message.created_at).getTime() < EDIT_WINDOW_MS;
  }

  async function editMessage(messageId: string, newContent: string) {
    const { error } = await supabase
      .from('messages')
      .update({ content: newContent, edited_at: new Date().toISOString() })
      .eq('id', messageId);
    return { error: error?.message ?? null };
  }

  async function deleteMessage(messageId: string) {
    const { error } = await supabase.from('messages').delete().eq('id', messageId);
    return { error: error?.message ?? null };
  }

  return {
    messages,
    loading,
    sendMessage,
    sendMedia,
    canEdit,
    editMessage,
    deleteMessage,
  };
}
