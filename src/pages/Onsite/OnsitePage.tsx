import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';

const ORDERS_APP_URL = import.meta.env.VITE_ORDERS_APP_URL as string | undefined;

export default function OnsitePage() {
  const [loadFailed, setLoadFailed] = useState(false);

  if (!ORDERS_APP_URL) {
    return (
      <div className="app-content">
        <div className="page-header">
          <div className="page-header-title">Onsite</div>
        </div>
        <div className="card empty-state">
          VITE_ORDERS_APP_URL isn't set. In Netlify, go to Site configuration
          → Environment variables, add VITE_ORDERS_APP_URL set to
          https://orders.totalinsulation.com.au/, then trigger a new deploy.
          This tab will show it directly once that's done.
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px 16px', background: '#fff', borderBottom: '0.5px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end' }}>
        <a
          href={ORDERS_APP_URL}
          target="_blank"
          rel="noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'none' }}
        >
          <ExternalLink size={14} /> Open in new tab
        </a>
      </div>

      {loadFailed ? (
        <div className="app-content">
          <div className="card empty-state">
            This site can't be shown embedded here. Use "Open in new tab"
            above instead — the Orders app itself is unaffected either way.
          </div>
        </div>
      ) : (
        <iframe
          src={ORDERS_APP_URL}
          title="Onsite - Orders & Scheduling"
          style={{ flex: 1, width: '100%', border: 'none' }}
          onError={() => setLoadFailed(true)}
        />
      )}
    </div>
  );
}

