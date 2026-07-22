import React, { useState } from 'react';
import { ArrowLeft, Hash, Plus, Users } from 'lucide-react';
import { useChannels } from '../../../hooks/useChannels';
import { useCommunities } from '../../../hooks/useCommunities';
import type { Channel, Community } from '../../../types';
import ChatThread from './ChatThread';
import CreateCommunityModal from './CreateCommunityModal';

function communityIcon(type: Community['community_type']) {
  if (type === 'job') return '🏗️';
  if (type === 'inductions') return '📋';
  if (type === 'general') return '💬';
  return '👥';
}

export default function MessagesHome() {
  const { channels, loading: channelsLoading } = useChannels();
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const { communities, loading: communitiesLoading } = useCommunities(
    selectedChannel?.id ?? null
  );

  if (selectedCommunity) {
    return (
      <ChatThread
        community={selectedCommunity}
        onBack={() => setSelectedCommunity(null)}
      />
    );
  }

  if (selectedChannel) {
    return (
      <div className="app-content">
        <button
          onClick={() => setSelectedChannel(null)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: 13, fontWeight: 600, marginTop: 12, marginBottom: 16, cursor: 'pointer', padding: 0 }}
        >
          <ArrowLeft size={16} /> All channels
        </button>

        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="page-header-title">{selectedChannel.name}</div>
          <button
            onClick={() => setShowCreate(true)}
            style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          >
            <Plus size={14} /> New group
          </button>
        </div>

        {communitiesLoading && <div className="empty-state">Loading…</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {communities.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedCommunity(c)}
              className="card"
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
            >
              <div style={{ fontSize: 20 }}>{communityIcon(c.community_type)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</div>
                {c.community_type === 'job' && (
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Job chat</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {showCreate && (
          <CreateCommunityModal
            channelId={selectedChannel.id}
            onClose={() => setShowCreate(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="app-content">
      <div className="page-header">
        <div className="page-header-subtitle">Team</div>
        <div className="page-header-title">Messages</div>
      </div>

      {channelsLoading && <div className="empty-state">Loading…</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {channels.map((c) => (
          <div
            key={c.id}
            onClick={() => setSelectedChannel(c)}
            className="card"
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Hash size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{c.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
