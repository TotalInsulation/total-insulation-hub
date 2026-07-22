import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { ModuleKey } from '../types';

export interface ManagedSuperAdmin {
  id: string;
  full_name: string;
  is_owner: boolean;
  permissions: Record<ModuleKey, boolean>;
}

const MODULES: ModuleKey[] = ['business', 'crew', 'team_online_tracker', 'more'];

export function useModulePermissionsAdmin() {
  const [admins, setAdmins] = useState<ManagedSuperAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdmins = useCallback(async () => {
    const [usersRes, permsRes] = await Promise.all([
      supabase.from('users').select('id, full_name, is_owner').eq('role', 'super_admin'),
      supabase.from('module_permissions').select('user_id, module_key, can_access'),
    ]);

    const users = usersRes.data ?? [];
    const perms = permsRes.data ?? [];

    const mapped: ManagedSuperAdmin[] = users.map((u) => {
      const permissions: Record<ModuleKey, boolean> = {
        business: true,
        crew: true,
        team_online_tracker: true,
        more: true,
      };
      perms
        .filter((p) => p.user_id === u.id)
        .forEach((p) => {
          permissions[p.module_key as ModuleKey] = p.can_access;
        });

      return {
        id: u.id,
        full_name: u.full_name ?? 'Unknown',
        is_owner: u.is_owner,
        permissions,
      };
    });

    setAdmins(mapped);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  async function toggleModule(userId: string, moduleKey: ModuleKey, canAccess: boolean, updatedBy: string) {
    await supabase.from('module_permissions').upsert(
      {
        user_id: userId,
        module_key: moduleKey,
        can_access: canAccess,
        updated_by: updatedBy,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,module_key' }
    );
    fetchAdmins();
  }

  return { admins, loading, toggleModule, modules: MODULES };
}
