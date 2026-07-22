import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface NotificationPreferences {
  push_enabled: boolean;
  email_enabled: boolean;
  email_frequency: 'realtime' | 'daily' | 'weekly';
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  do_not_disturb: boolean;
}

const DEFAULTS: NotificationPreferences = {
  push_enabled: true,
  email_enabled: true,
  email_frequency: 'daily',
  quiet_hours_enabled: true,
  quiet_hours_start: '22:00',
  quiet_hours_end: '08:00',
  do_not_disturb: false,
};

export function useNotificationPreferences() {
  const { appUser } = useAuth();
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  const fetchPrefs = useCallback(async () => {
    if (!appUser) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', appUser.id)
      .maybeSingle();

    if (data) {
      setPrefs(data as NotificationPreferences);
    } else {
      // No row yet — create one with defaults
      await supabase.from('notification_preferences').insert({ user_id: appUser.id, ...DEFAULTS });
    }
    setLoading(false);
  }, [appUser]);

  useEffect(() => {
    fetchPrefs();
  }, [fetchPrefs]);

  async function updatePrefs(patch: Partial<NotificationPreferences>) {
    if (!appUser) return;
    setPrefs((prev) => ({ ...prev, ...patch }));
    await supabase
      .from('notification_preferences')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('user_id', appUser.id);
  }

  return { prefs, loading, updatePrefs };
}
