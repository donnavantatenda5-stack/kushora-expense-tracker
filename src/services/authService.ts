import AsyncStorage from '@react-native-async-storage/async-storage';
import { hashPassword, newSalt, safeEqual } from '../utils/hash';

export interface Account {
  /** Display name, used for the greeting. */
  name: string;
  /** Login id, always stored lowercased and trimmed. */
  email: string;
  /** Birth date used as an account recovery check. */
  birthday?: string;
  salt: string;
  digest: string;
  createdAt: string;
}

const ACCOUNT_KEY = 'et_account';
const SESSION_KEY = 'et_session';

export const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export function normalizeBirthday(value: string): string | null {
  const trimmed = value.trim();
  const match = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (!match) return null;

  const month = Number(match[1]);
  const day = Number(match[2]);
  const year = Number(match[3]);

  if (!Number.isFinite(month) || !Number.isFinite(day) || !Number.isFinite(year)) return null;

  const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const parsed = new Date(`${iso}T00:00:00`);

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getFullYear() !== year ||
    parsed.getMonth() + 1 !== month ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return iso;
}

async function readJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw === null ? null : (JSON.parse(raw) as T);
  } catch {
    return null;
  }
}

export async function readAccount(): Promise<Account | null> {
  const account = await readJson<Account>(ACCOUNT_KEY);
  if (!account || typeof account.digest !== 'string' || typeof account.salt !== 'string') {
    return null;
  }

  if (account.birthday && !normalizeBirthday(account.birthday)) {
    return null;
  }

  return account;
}

/** The email of the signed-in account, if any. Session-only, not persisted beyond the key. */
export async function readSession(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

export async function writeSession(email: string | null): Promise<void> {
  try {
    if (email === null) await AsyncStorage.removeItem(SESSION_KEY);
    else await AsyncStorage.setItem(SESSION_KEY, email);
  } catch {
    /* storage unavailable */
  }
}

export async function clearLocalAccount(): Promise<void> {
  await AsyncStorage.multiRemove([ACCOUNT_KEY, SESSION_KEY]);
}

export type AuthResult = { ok: true; account: Account } | { ok: false; error: string };

export async function createAccount(
  name: string,
  email: string,
  password: string,
  birthday: string,
): Promise<AuthResult> {
  const cleanName = name.trim();
  const id = normalizeEmail(email);
  const normalizedBirthday = normalizeBirthday(birthday);

  if (cleanName.length < 2) return { ok: false, error: 'Enter your name.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(id)) return { ok: false, error: 'Enter a valid email address.' };
  if (!normalizedBirthday) return { ok: false, error: 'Use your birthday as MM/DD/YYYY.' };
  if (password.length < 6) return { ok: false, error: 'Password must be at least 6 characters.' };

  if (await readAccount()) {
    return { ok: false, error: 'An account already exists on this device. Sign in instead.' };
  }

  const salt = newSalt();
  const account: Account = {
    name: cleanName,
    email: id,
    birthday: normalizedBirthday,
    salt,
    // Off the render path, and the loop is deliberately expensive.
    digest: hashPassword(password, salt),
    createdAt: new Date().toISOString(),
  };

  try {
    await AsyncStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
  } catch {
    return { ok: false, error: 'Could not save the account on this device.' };
  }
  await writeSession(id);
  return { ok: true, account };
}

export async function verifyAccount(email: string, password: string): Promise<AuthResult> {
  const account = await readAccount();
  const id = normalizeEmail(email);

  if (!account) {
    return { ok: false, error: 'No account on this device yet. Create one first.' };
  }
  if (account.email !== id || !safeEqual(hashPassword(password, account.salt), account.digest)) {
    // Same message either way, so the form does not reveal which part was wrong.
    return { ok: false, error: 'Email or password is incorrect.' };
  }

  await writeSession(id);
  return { ok: true, account };
}

export async function resetPassword(
  name: string,
  birthday: string,
  newPassword: string,
): Promise<AuthResult> {
  const account = await readAccount();
  const normalizedName = name.trim();
  const normalizedBirthday = normalizeBirthday(birthday);

  if (!account) {
    return { ok: false, error: 'No account on this device yet. Create one first.' };
  }
  if (!account.birthday) {
    return { ok: false, error: 'This account was created before birthday recovery was enabled.' };
  }
  if (!normalizedBirthday) {
    return { ok: false, error: 'Use your birthday as MM/DD/YYYY.' };
  }
  if (normalizedName.length < 2) {
    return { ok: false, error: 'Enter your name.' };
  }
  if (newPassword.length < 6) {
    return { ok: false, error: 'Password must be at least 6 characters.' };
  }

  const nameMatches = account.name.trim().toLowerCase() === normalizedName.toLowerCase();
  const birthdayMatches = account.birthday === normalizedBirthday;
  if (!nameMatches || !birthdayMatches) {
    return { ok: false, error: 'Name or birthday does not match the saved account.' };
  }

  const salt = newSalt();
  const updated: Account = {
    ...account,
    salt,
    digest: hashPassword(newPassword, salt),
    createdAt: new Date().toISOString(),
  };

  try {
    await AsyncStorage.setItem(ACCOUNT_KEY, JSON.stringify(updated));
  } catch {
    return { ok: false, error: 'Could not save the new password on this device.' };
  }

  await writeSession(account.email);
  return { ok: true, account: updated };
}