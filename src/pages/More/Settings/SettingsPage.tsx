import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotificationPreferences } from '../../../hooks/useNotificationPreferences';
import { useModulePermissionsAdmin } from '../../../hooks/useModulePermissionsAdmin';
import type { ModuleKey } from '../../../types';

const MODULE_LABELS: Record<ModuleKey, string> = {
  business: 'Business',
  crew: 'Crew',
  team_online_tracker: 'Online Tracker',
  more: 'More',
};

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: 42,
        height: 24,
        borderRadius: 12,
        border: 'none',
        background: checked ? 'var(--color-primary)' : '#ddd',
        position: 'relative',
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 2,
          left: checked ? 20 : 2,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: '#fff',
          transition: 'left 0.15s',
        }}
      />
    </button>
  );
}

export default function SettingsPage() {
  const { appUser, signOut } = useAuth();
  const { prefs, updatePrefs } = useNotificationPreferences();
  const { admins, toggleModule } = useModulePermissionsAdmin();

  return (
    <div className="app-content">
      <div className="page-header">
        <div className="page-header-subtitle">More</div>
        <div className="page-header-title">Settings</div>
      </div>

      <div className="section-title">Profile</div>
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{appUser?.full_name}</div>
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{appUser?.email}</div>
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
          {appUser?.is_owner ? 'Owner' : 'Super Admin'}
        </div>
      </div>

      <div className="section-title">Notifications</div>
      <div className="card" style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13 }}>Push notifications</span>
          <Toggle checked={prefs.push_enabled} onChange={(v) => updatePrefs({ push_enabled: v })} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13 }}>Email notifications</span>
          <Toggle checked={prefs.email_enabled} onChange={(v) => updatePrefs({ email_enabled: v })} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13 }}>Quiet hours (10pm–8am)</span>
          <Toggle checked={prefs.quiet_hours_enabled} onChange={(v) => updatePrefs({ quiet_hours_enabled: v })} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13 }}>Do not disturb</span>
          <Toggle checked={prefs.do_not_disturb} onChange={(v) => updatePrefs({ do_not_disturb: v })} />
        </div>
      </div>

      {appUser?.is_owner && (
        <>
          <div className="section-title">Access control (owners only)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {admins
              .filter((a) => !a.is_owner)
              .map((a) => (
                <div key={a.id} className="card">
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>{a.full_name}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {(['business', 'crew', 'team_online_tracker', 'more'] as ModuleKey[]).map((m) => (
                      <div key={m} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12 }}>{MODULE_LABELS[m]}</span>
                        <Toggle
                          checked={a.permissions[m]}
                          onChange={(v) => toggleModule(a.id, m, v, appUser.id)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            {admins.filter((a) => !a.is_owner).length === 0 && (
              <div className="empty-state">No other super admins yet.</div>
            )}
          </div>
        </>
      )}

      <button
        onClick={signOut}
        style={{ width: '100%', padding: 12, borderRadius: 8, border: '0.5px solid var(--color-border)', background: '#fff', color: '#ae272b', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
      >
        Sign out
      </button>
    </div>
  );
}
