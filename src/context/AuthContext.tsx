import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  createAccount,
  readAccount,
  readSession,
  resetPassword,
  verifyAccount,
  writeSession,
  type Account,
} from '../services/authService';

export type AuthStatus = 'loading' | 'signedOut' | 'signedIn';

export interface AuthContextValue {
  status: AuthStatus;
  account: Account | null;
  /** Resolves to an error message, or null on success. */
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (name: string, email: string, password: string, birthday: string) => Promise<string | null>;
  resetPassword: (name: string, birthday: string, newPassword: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [account, setAccount] = useState<Account | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [stored, session] = await Promise.all([readAccount(), readSession()]);
      if (!alive) return;
      if (stored && session === stored.email) {
        setAccount(stored);
        setStatus('signedIn');
      } else {
        // No stored account, or the session was cleared: needs the sign-in page.
        if (session !== null) await writeSession(null);
        setAccount(null);
        setStatus('signedOut');
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await verifyAccount(email, password);
    if (!result.ok) return result.error;
    setAccount(result.account);
    setStatus('signedIn');
    return null;
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string, birthday: string) => {
    const result = await createAccount(name, email, password, birthday);
    if (!result.ok) return result.error;
    setAccount(result.account);
    setStatus('signedIn');
    return null;
  }, []);

  const resetUserPassword = useCallback(async (name: string, birthday: string, newPassword: string) => {
    const result = await resetPassword(name, birthday, newPassword);
    if (!result.ok) return result.error;
    setAccount(result.account);
    setStatus('signedIn');
    return null;
  }, []);

  const signOut = useCallback(async () => {
    await writeSession(null);
    setAccount(null);
    setStatus('signedOut');
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ status, account, signIn, signUp, resetPassword: resetUserPassword, signOut }),
    [status, account, signIn, signUp, resetUserPassword, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

/** First word of the stored display name, for the greeting. */
export const firstName = (account: Account | null): string =>
  account?.name.trim().split(/\s+/)[0] ?? '';