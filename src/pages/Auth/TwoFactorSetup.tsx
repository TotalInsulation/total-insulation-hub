import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { generateTotpSetup, verifyTotpCode, generateBackupCodes } from '../../lib/twoFactor';

type Step = 'loading' | 'scan' | 'verify' | 'backup-codes' | 'error';

export default function TwoFactorSetup({ onComplete }: { onComplete: () => void }) {
  const { session, markTwoFaVerified } = useAuth();
  const [step, setStep] = useState<Step>('loading');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [secretBase32, setSecretBase32] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function init() {
      if (!session?.user.email) return;
      try {
        const setup = await generateTotpSetup(session.user.email);
        setQrCodeDataUrl(setup.qrCodeDataUrl);
        setSecretBase32(setup.secretBase32);
        setStep('scan');
      } catch (err) {
        console.error(err);
        setStep('error');
      }
    }
    init();
  }, [session]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!verifyTotpCode(secretBase32, code)) {
      setError('That code didn\'t match. Check the time on your phone and try again.');
      return;
    }

    setSaving(true);
    const codes = generateBackupCodes();

    const { error: dbError } = await supabase.from('user_2fa').upsert(
      {
        user_id: session!.user.id,
        secret_base32: secretBase32,
        enabled: true,
        backup_codes: codes,
        backup_codes_used: [],
      },
      { onConflict: 'user_id' }
    );

    setSaving(false);

    if (dbError) {
      setError('Could not save 2FA setup. Try again.');
      return;
    }

    setBackupCodes(codes);
    setStep('backup-codes');
  }

  function handleFinish() {
    markTwoFaVerified();
    onComplete();
  }

  if (step === 'loading') {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <p>Setting up two-factor authentication…</p>
        </div>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <p className="auth-error">
            Something went wrong setting up 2FA. Refresh and try again.
          </p>
        </div>
      </div>
    );
  }

  if (step === 'backup-codes') {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <h1 className="auth-title">Save your backup codes</h1>
          <p className="auth-subtitle">
            If you lose your phone, use one of these codes to sign in. Each code
            works once. Store them somewhere safe.
          </p>
          <div className="backup-codes-grid">
            {backupCodes.map((c) => (
              <code key={c} className="backup-code">
                {c}
              </code>
            ))}
          </div>
          <button className="auth-submit" onClick={handleFinish}>
            I've saved these codes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h1 className="auth-title">Set up two-factor authentication</h1>
        <p className="auth-subtitle">
          Scan this QR code with Microsoft Authenticator or Google Authenticator.
        </p>
        {qrCodeDataUrl && (
          <img src={qrCodeDataUrl} alt="2FA QR code" className="qr-code" />
        )}
        <p className="auth-subtitle-small">
          Can't scan? Enter this code manually: <code>{secretBase32}</code>
        </p>

        <form onSubmit={handleVerify} className="auth-form">
          <label className="auth-label" htmlFor="totp-code">
            Enter the 6-digit code from your app
          </label>
          <input
            id="totp-code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            className="auth-input auth-input-code"
            placeholder="123456"
          />
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" className="auth-submit" disabled={saving}>
            {saving ? 'Verifying…' : 'Verify and enable 2FA'}
          </button>
        </form>
      </div>
    </div>
  );
}
