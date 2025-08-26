// src/presentation/viewmodels/ObtenidosViewModel.ts
import { useCallback, useEffect, useMemo, useState } from 'react';
import { UserRepositoryImpl } from '../../data/repositories/UserRepositoryImpl';
import { ArticuloRepositoryImpl } from '../../data/repositories/ArticuloRepositoryImpl';
import { GetComprasItemsUseCase } from '../../domain/usecases/GetComprasItemsUseCase';
import type { PurchasedItem } from '../../domain/entities/PurchasedItem';

const fmt = (d: Date) =>
  d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

export function useObtenidosVM(uid?: string) {
  const [items, setItems] = useState<PurchasedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string|null>(null);

  const uc = useMemo(() => {
    const u = new UserRepositoryImpl();
    const a = new ArticuloRepositoryImpl();
    return new GetComprasItemsUseCase(u, a);
  }, []);

  const load = useCallback(async () => {
    if (!uid) { setItems([]); return; }
    setLoading(true); setError(null);
    try {
      const list = await uc.execute(uid);
      setItems(list);
    } catch (e: any) {
      setError(e?.message ?? 'Error cargando tus compras');
    } finally {
      setLoading(false);
    }
  }, [uid, uc]);

  useEffect(() => { load(); }, [load]);

  const statusOf = useCallback((from: Date, to: Date) => {
    const now = new Date();
    if (now < from) return 'future' as const;
    if (now > to)   return 'past'   as const;
    return 'active' as const;
  }, []);

  const isActive = useCallback((from: Date, to: Date) => statusOf(from, to) === 'active', [statusOf]);
  const periodText = useCallback((from: Date, to: Date) => `${fmt(from)} — ${fmt(to)}`, []);

  return {
    items, loading, error, reload: load,
    isActive, periodText, statusOf,
  };
}