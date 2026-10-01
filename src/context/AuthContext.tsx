import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  changePassword as changePasswordOnDevice,
  createAccount,
  readAccount,
  readSession,
  resetAccount as clearAccountOnDevice,
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
  signUp: (name: string, email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  /** Resolves to an error message, or null on success. */
  changePassword: (currentPassword: string, newPassword: string) => Promise<string | null>;
  /** Clears the local account and signs out. Transactions are kept. */
  resetAccount: () => Promise<void>;
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

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const result = await createAccount(name, email, password);
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

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    const result = await changePasswordOnDevice(currentPassword, newPassword);
    if (!result.ok) return result.error;
    setAccount(result.account);
    return null;
  }, []);

  // Dropping the account flips status to signedOut, which the root gate turns
  // into a redirect to the sign-in screen. The expense keys are untouched, so
  // the transactions are still there on the other side of the re-registration.
  const resetAccount = useCallback(async () => {
    await clearAccountOnDevice();
    setAccount(null);
    setStatus('signedOut');
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ status, account, signIn, signUp, signOut, changePassword, resetAccount }),
    [status, account, signIn, signUp, signOut, changePassword, resetAccount],
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