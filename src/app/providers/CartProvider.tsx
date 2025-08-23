import React, { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthProvider';

const STORAGE_PREFIX = 'cart_ids_v1';
const keyFor = (uid?: string | null) => (uid ? `${STORAGE_PREFIX}:${uid}` : '');

type CartCtx = {
  ids: string[];
  count: number;
  has: (id: string) => boolean;
  add: (id: string) => void;
  remove: (id: string) => void;
  toggle: (id: string) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx>({
  ids: [],
  count: 0,
  has: () => false,
  add: () => {},
  remove: () => {},
  toggle: () => {},
  clear: () => {},
});

export const CartProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { user } = useAuth();
  const uid = user?.id ?? null;

  const [ids, setIds] = useState<string[]>([]);
  const prevUidRef = useRef<string | null>(null);

  // Reacciona a cambios de usuario (login / logout / switch)
  useEffect(() => {
    const prevUid = prevUidRef.current;
    prevUidRef.current = uid;

    // Logout: borra el carrito del usuario anterior y limpia estado
    if (prevUid && !uid) {
      AsyncStorage.removeItem(keyFor(prevUid)).catch(() => {});
      setIds([]);
      return;
    }

    // Login o cambio de usuario: carga su carrito
    (async () => {
      if (!uid) {
        // invitado: carrito en memoria (no persistimos)
        setIds([]);
        return;
      }

      // (Opcional) migración de clave legacy global -> clave por usuario
      try {
        const legacy = await AsyncStorage.getItem(STORAGE_PREFIX);
        if (legacy) {
          await AsyncStorage.setItem(keyFor(uid), legacy);
          await AsyncStorage.removeItem(STORAGE_PREFIX);
        }
      } catch {}

      try {
        const raw = await AsyncStorage.getItem(keyFor(uid));
        setIds(raw ? JSON.parse(raw) : []);
      } catch {
        setIds([]);
      }
    })();
  }, [uid]);

  // Persiste SOLO si hay usuario
  useEffect(() => {
    if (!uid) return;
    AsyncStorage.setItem(keyFor(uid), JSON.stringify(ids)).catch(() => {});
  }, [ids, uid]);

  const has = useCallback((id: string) => ids.includes(id), [ids]);
  const add = useCallback((id: string) => setIds(prev => (prev.includes(id) ? prev : [...prev, id])), []);
  const remove = useCallback((id: string) => setIds(prev => prev.filter(x => x !== id)), []);
  const toggle = useCallback((id: string) => setIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])), []);
  const clear = useCallback(() => {
    setIds([]);
    if (uid) AsyncStorage.removeItem(keyFor(uid)).catch(() => {});
  }, [uid]);

  const value = useMemo(() => ({ ids, count: ids.length, has, add, remove, toggle, clear }), [ids, has, add, remove, toggle, clear]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useCart = () => useContext(Ctx);