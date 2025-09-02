    import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { AuthRepositoryImpl } from '../../data/repositories/AuthRepositoryImpl';
import { ObserveAuth } from '../../domain/usecases/auth/ObserveAuth';
import { SignOut } from '../../domain/usecases/auth/SignOut';
import type { User } from '../../domain/entities/User';

type CtxValue = {
  user: User | null;
  initializing: boolean;
  signOut: () => Promise<void>;
  patchUser: (patch: Partial<User>) => void;
};

const Ctx = createContext<CtxValue>({
  user: null,
  initializing: true,
  signOut: async () => {},
  patchUser: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const repo = useMemo(() => new AuthRepositoryImpl(), []);
  const observe = useMemo(() => new ObserveAuth(repo), [repo]);
  const signOutUC = useMemo(() => new SignOut(repo), [repo]);

  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  // Boot "eager": carga el usuario actual YA y luego suscríbete
  useEffect(() => {
    let unsub = () => {};
    let mounted = true;

    (async () => {
      try {
        const current = await repo.currentUser();   // ← garantiza doc si falta
        if (!mounted) return;
        setUser(current);
      } catch (e) {
        console.warn('[AuthProvider] currentUser error', e);
      } finally {
        if (mounted) setInitializing(false);
      }

      // Suscripción para cambios posteriores (login/logout/refresh)
      unsub = observe.exec((u) => {
        setUser(u);
      });
    })();

    return () => {
      mounted = false;
      try { unsub(); } catch {}
    };
  }, [repo, observe]);

  const signOut = useCallback(async () => {
    await signOutUC.exec();
  }, [signOutUC]);

  const patchUser = useCallback((patch: Partial<User>) => {
    setUser(prev => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const value = useMemo(
    () => ({ user, initializing, signOut, patchUser }),
    [user, initializing, signOut, patchUser]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useAuth = () => useContext(Ctx);