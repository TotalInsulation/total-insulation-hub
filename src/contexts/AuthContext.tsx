import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { AppUser } from '../types';

interface AuthContextValue {
  session: Session | null;
  appUser: AppUser | null;
  loading: boolean;
  isSuperAdmin: boolean;
  requires2fa: boolean;
  twoFaVerified: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  markTwoFaVerified: () => void;
  refreshAppUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [twoFaVerified, setTwoFaVerified] = useState(false);
  const [has2faEnabled, setHas2faEnabled] = useState(false);

  const loadAppUser = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Failed to load user profile', error);
      setAppUser(null);
      return;
    }

    setAppUser(data as AppUser);

    // Check whether 2FA is enabled for this user (only matters for super admins,
    // but we check regardless in case role changes).
    const { data: twoFaRow } = await supabase
      .from('user_2fa')
      .select('enabled')
      .eq('user_id', userId)
      .maybeSingle();

    setHas2faEnabled(Boolean(twoFaRow?.enabled));
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session?.user) {
        loadAppUser(data.session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setTwoFaVerified(false);
        if (newSession?.user) {
          loadAppUser(newSession.user.id);
        } else {
          setAppUser(null);
        }
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [loadAppUser]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setAppUser(null);
    setTwoFaVerified(false);
  }, []);

  const markTwoFaVerified = useCallback(() => {
    setTwoFaVerified(true);
  }, []);

  const refreshAppUser = useCallback(async () => {
    if (session?.user) {
      await loadAppUser(session.user.id);
    }
  }, [session, loadAppUser]);

  const isSuperAdmin = appUser?.role === 'super_admin';

  // Super admins must complete 2FA verification each session before
  // reaching the Hub. Non-super-admins are not gated (Orders app only).
  const requires2fa = isSuperAdmin && has2faEnabled && !twoFaVerified;

  const value: AuthContextValue = {
    session,
    appUser,
    loading,
    isSuperAdmin,
    requires2fa,
    twoFaVerified,
    signIn,
    signOut,
    markTwoFaVerified,
    refreshAppUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
