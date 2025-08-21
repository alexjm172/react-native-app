import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { AuthRepositoryImpl } from '../../data/repositories/AuthRepositoryImpl';
import { ObserveAuth } from '../../domain/usecases/auth/ObserveAuth';
import { SignOut } from '../../domain/usecases/auth/SignOut';
import { User } from '../../domain/entities/User';

type CtxValue = {
  user: User | null;
  initializing: boolean;
  signOut: () => Promise<void>;
};

const Ctx = createContext<CtxValue>({
  user: null,
  initializing: true,
  // no-op por defecto
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const repo = useMemo(() => new AuthRepositoryImpl(), []);
  const observe = useMemo(() => new ObserveAuth(repo), [repo]);
  const signOutUC = useMemo(() => new SignOut(repo), [repo]);

  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsub = observe.exec(u => {
      setUser(u);
      setInitializing(false);
    });
    return () => unsub();
  }, [observe]);

  const signOut = useCallback(async () => {
    await signOutUC.exec();
  }, [signOutUC]);

  const value = useMemo(() => ({ user, initializing, signOut }), [user, initializing, signOut]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useAuth = () => useContext(Ctx);