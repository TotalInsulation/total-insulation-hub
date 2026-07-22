import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { verifyTotpCode } from '../../lib/twoFactor';
import { trustThisDeviceFor24Hours } from '../../lib/deviceTrust';

export default function TwoFactorVerify() {
  const { session, markTwoFaVerified } = useAuth();
  const [code, setCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setChecking(true);

    const { data, error: fetchError } = await supabase
      .from('user_2fa')
      .select('secret_base32, backup_codes, backup_codes_used')
      .eq('user_id', session!.user.id)
      .single();

    if (fetchError || !data) {
      setChecking(false);
      setError('Could not verify 2FA. Try again.');
      return;
    }

    if (useBackupCode) {
      const normalized = code.trim().toUpperCase();
      const isValidUnused =
        data.backup_codes.includes(normalized) &&
        !data.backup_codes_used.includes(normalized);

      if (!isValidUnused) {
        setChecking(false);
        setError('That backup code is invalid or already used.');
        return;
      }

      await supabase
        .from('user_2fa')
        .update({
          backup_codes_used: [...data.backup_codes_used, normalized],
        })
        .eq('user_id', session!.user.id);

      await trustThisDeviceFor24Hours(session!.user.id);
      setChecking(false);
      markTwoFaVerified();
      return;
    }

    const valid = verifyTotpCode(data.secret_base32, code);

    if (!valid) {
      setChecking(false);
      setError('Incorrect code. Try again.');
      return;
    }

    await trustThisDeviceFor24Hours(session!.user.id);
    setChecking(false);
    markTwoFaVerified();
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h1 className="auth-title">Enter your 2FA code</h1>
        <p className="auth-subtitle">
          Open your authenticator app and enter the current 6-digit code.
        </p>

        <form onSubmit={handleVerify} className="auth-form">
          <input
            type="text"
            inputMode={useBackupCode ? 'text' : 'numeric'}
            maxLength={useBackupCode ? 11 : 6}
            required
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="auth-input auth-input-code"
            placeholder={useBackupCode ? 'XXXXX-XXXXX' : '123456'}
          />
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" className="auth-submit" disabled={checking}>
            {checking ? 'Checking…' : 'Verify'}
          </button>
        </form>

        <button
          className="auth-link-button"
          onClick={() => {
            setUseBackupCode((v) => !v);
            setError(null);
            setCode('');
          }}
        >
          {useBackupCode ? 'Use authenticator app instead' : 'Use a backup code instead'}
        </button>
      </div>
    </div>
  );
}
