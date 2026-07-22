import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Paperclip, Send, Trash2, Users } from 'lucide-react';
import { useMessages } from '../../../hooks/useMessages';
import { useAuth } from '../../../contexts/AuthContext';
import type { Community, Message } from '../../../types';

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
}

export default function ChatThread({
  community,
  onBack,
}: {
  community: Community;
  onBack: () => void;
}) {
  const { appUser } = useAuth();
  const { messages, loading, sendMessage, sendMedia, canEdit, deleteMessage } =
    useMessages(community.id);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  async function handleSend() {
    if (!draft.trim() || sending) return;
    setSending(true);
    await sendMessage(draft);
    setDraft('');
    setSending(false);
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    await sendMedia(file, isImage ? 'photo' : 'document');
    e.target.value = '';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '14px 16px',
          background: '#fff',
          borderBottom: '0.5px solid var(--color-border)',
        }}
      >
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
          <ArrowLeft size={18} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{community.name}</div>
        </div>
        <Users size={16} color="#999" />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading && <div className="empty-state">Loading messages…</div>}
        {!loading && messages.length === 0 && (
          <div className="empty-state">No messages yet. Say hello.</div>
        )}

        {messages.map((m: Message) => {
          const isMine = m.user_id === appUser?.id;
          return (
            <div
              key={m.id}
              style={{
                alignSelf: isMine ? 'flex-end' : 'flex-start',
                maxWidth: '78%',
              }}
            >
              {!isMine && (
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 2, marginLeft: 4 }}>
                  {m.sender?.full_name ?? 'Unknown'}
                </div>
              )}
              <div
                style={{
                  background: isMine ? 'var(--color-primary)' : '#fff',
                  color: isMine ? '#fff' : 'var(--color-text)',
                  border: isMine ? 'none' : '0.5px solid var(--color-border)',
                  borderRadius: 14,
                  padding: '8px 12px',
                  fontSize: 13,
                }}
              >
                {m.message_type === 'photo' && m.media_urls[0] && (
                  <img src={m.media_urls[0]} alt="Shared photo" style={{ maxWidth: '100%', borderRadius: 8, marginBottom: m.content ? 6 : 0 }} />
                )}
                {m.message_type === 'document' && m.media_urls[0] && (
                  <a href={m.media_urls[0]} target="_blank" rel="noreferrer" style={{ color: isMine ? '#fff' : 'var(--color-primary)', textDecoration: 'underline', fontSize: 12 }}>
                    View document
                  </a>
                )}
                {m.content && <div>{m.content}</div>}
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 2, marginLeft: isMine ? 0 : 4, justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
                  {formatTime(m.created_at)}{m.edited_at ? ' · edited' : ''}
                </span>
                {isMine && canEdit(m) && (
                  <button
                    onClick={() => deleteMessage(m.id)}
                    style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', padding: 0, display: 'flex' }}
                  >
                    <Trash2 size={11} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      <div style={{ display: 'flex', gap: 8, padding: 12, background: '#fff', borderTop: '0.5px solid var(--color-border)' }}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{ background: 'none', border: '0.5px solid var(--color-border)', borderRadius: 8, width: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Paperclip size={16} color="#666" />
        </button>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Message"
          style={{ flex: 1, padding: '10px 12px', borderRadius: 20, border: '0.5px solid var(--color-border)', fontSize: 13 }}
        />
        <button
          onClick={handleSend}
          disabled={sending}
          style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 8, width: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
