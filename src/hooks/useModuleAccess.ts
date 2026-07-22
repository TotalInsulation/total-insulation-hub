import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { ModuleKey } from '../types';

const ALL_MODULES: ModuleKey[] = ['business', 'crew', 'team_online_tracker', 'more'];

/**
 * Owners (Jordan and Nelson) always have full access and can never be
 * restricted. Other super admins (e.g. Ben, Margie) default to full access
 * unless an owner has explicitly turned a module off for them.
 */
export function useModuleAccess() {
  const { appUser } = useAuth();
  const [restricted, setRestricted] = useState<Set<ModuleKey>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchPermissions = useCallback(async () => {
    if (!appUser || appUser.is_owner) {
      setRestricted(new Set());
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('module_permissions')
      .select('module_key, can_access')
      .eq('user_id', appUser.id);

    const blocked = new Set<ModuleKey>(
      (data ?? [])
        .filter((row) => row.can_access === false)
        .map((row) => row.module_key as ModuleKey)
    );

    setRestricted(blocked);
    setLoading(false);
  }, [appUser]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  function canAccess(module: ModuleKey): boolean {
    if (!appUser) return false;
    if (appUser.is_owner) return true;
    return !restricted.has(module);
  }

  return { canAccess, loading, allModules: ALL_MODULES, refresh: fetchPermissions };
}
