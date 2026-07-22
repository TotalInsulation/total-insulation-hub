import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { isDeviceTrusted } from '../../lib/deviceTrust';
import Login from './Login';
import TwoFactorSetup from './TwoFactorSetup';
import TwoFactorVerify from './TwoFactorVerify';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const {
    session,
    appUser,
    loading,
    isSuperAdmin,
    requires2fa,
    twoFaVerified,
    markTwoFaVerified,
  } = useAuth();
  const [checking2faEnrollment, setChecking2faEnrollment] = useState(true);
  const [has2faRow, setHas2faRow] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function check() {
      if (!session?.user || !isSuperAdmin) {
        setChecking2faEnrollment(false);
        return;
      }
      const { data } = await supabase
        .from('user_2fa')
        .select('enabled')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (!mounted) return;

      const enabled = Boolean(data?.enabled);
      setHas2faRow(enabled);

      // If this device was verified within the last 24 hours, skip the
      // 2FA prompt for this session automatically.
      if (enabled) {
        const trusted = await isDeviceTrusted(session.user.id);
        if (trusted && mounted) {
          markTwoFaVerified();
        }
      }

      setChecking2faEnrollment(false);
    }

    check();
    return () => {
      mounted = false;
    };
  }, [session, isSuperAdmin, twoFaVerified, markTwoFaVerified]);

  if (loading || checking2faEnrollment) {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <p>Loading…</p>
        </div>
      </div>
    );
  }

  if (!session || !appUser) {
    return <Login />;
  }

  // Super admins must enroll in 2FA if they haven't already
  if (isSuperAdmin && !has2faRow) {
    return <TwoFactorSetup onComplete={() => setHas2faRow(true)} />;
  }

  // Super admins must verify 2FA each session
  if (isSuperAdmin && requires2fa) {
    return <TwoFactorVerify />;
  }

  return <>{children}</>;
}
