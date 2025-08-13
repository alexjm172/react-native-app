import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AuthRepositoryImpl } from '../../data/repositories/AuthRepositoryImpl';
import { ObserveAuth } from '../../domain/usecases/auth/ObserveAuth';
import { User } from '../../domain/entities/User';

type State = { user: User | null; initializing: boolean };
const Ctx = createContext<State>({ user: null, initializing: true });

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const repo = useMemo(() => new AuthRepositoryImpl(), []);
  const observe = useMemo(() => new ObserveAuth(repo), [repo]);
  const [state, setState] = useState<State>({ user: null, initializing: true });

  useEffect(() => {
    const unsub = observe.exec(u => setState({ user: u, initializing: false }));
    return () => unsub();
  }, [observe]);

  return <Ctx.Provider value={state}>{children}</Ctx.Provider>;
};

export const useAuth = () => useContext(Ctx);