import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';

const ISSUER = 'Total Insulation Hub';

/**
 * Generates a new TOTP secret and returns the secret plus a QR code data URL
 * the user scans with Microsoft Authenticator / Google Authenticator.
 */
export async function generateTotpSetup(userEmail: string) {
  const secret = new OTPAuth.Secret({ size: 20 });

  const totp = new OTPAuth.TOTP({
    issuer: ISSUER,
    label: userEmail,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret,
  });

  const otpauthUrl = totp.toString();
  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

  return {
    secretBase32: secret.base32,
    otpauthUrl,
    qrCodeDataUrl,
  };
}

/**
 * Verifies a 6-digit code against a stored base32 secret.
 * Allows a window of 1 step (30s) either side to account for clock drift.
 */
export function verifyTotpCode(secretBase32: string, code: string): boolean {
  try {
    const totp = new OTPAuth.TOTP({
      issuer: ISSUER,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secretBase32),
    });

    const delta = totp.validate({ token: code.trim(), window: 1 });
    return delta !== null;
  } catch {
    return false;
  }
}

/**
 * Generates a set of one-time backup codes (used if the user loses their device).
 * Store only the hashed versions server-side in production; for now these are
 * generated client-side and shown once for the user to save.
 */
export function generateBackupCodes(count = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = Array.from({ length: 10 }, () =>
      Math.floor(Math.random() * 36).toString(36)
    )
      .join('')
      .toUpperCase();
    codes.push(`${code.slice(0, 5)}-${code.slice(5)}`);
  }
  return codes;
}
