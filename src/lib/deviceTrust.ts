import { supabase } from './supabase';

const DEVICE_ID_KEY = 'ti_hub_device_id';
const TRUST_HOURS = 24;

function getOrCreateDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

/**
 * Checks whether this browser/device already has a valid 24hr trust window
 * for the given user. If true, the 2FA prompt can be skipped.
 */
export async function isDeviceTrusted(userId: string): Promise<boolean> {
  const deviceToken = getOrCreateDeviceId();

  const { data, error } = await supabase
    .from('trusted_devices')
    .select('expires_at')
    .eq('user_id', userId)
    .eq('device_token', deviceToken)
    .maybeSingle();

  if (error || !data) return false;

  return new Date(data.expires_at).getTime() > Date.now();
}

/**
 * Called right after a successful 2FA verification. Marks this device as
 * trusted for the next 24 hours so the user isn't prompted again until then.
 */
export async function trustThisDeviceFor24Hours(userId: string): Promise<void> {
  const deviceToken = getOrCreateDeviceId();
  const expiresAt = new Date(Date.now() + TRUST_HOURS * 60 * 60 * 1000).toISOString();

  await supabase.from('trusted_devices').upsert(
    {
      user_id: userId,
      device_token: deviceToken,
      expires_at: expiresAt,
    },
    { onConflict: 'user_id,device_token' }
  );
}
