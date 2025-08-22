import { useCallback, useEffect, useState } from 'react';
import type { Articulo } from '../../domain/entities/Articulo';
import { GetArticulosByIds } from '../../domain/usecases/GetArticulosByIdsUseCase';

export function useMisProductosVM(getByIds: GetArticulosByIds, ids?: string[]) {
  const [items, setItems] = useState<Articulo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string|null>(null);

  const load = useCallback(async () => {
    const listIds = ids ?? [];
    if (listIds.length === 0) {
      setItems([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await getByIds.execute(listIds); // ✅ ahora pasamos IDs (no uid)
      setItems(list);
    } catch (e: any) {
      setError(e?.message ?? 'Error cargando tus artículos');
    } finally {
      setLoading(false);
    }
  }, [getByIds, JSON.stringify(ids)]); // deps seguras cuando cambien los ids

  useEffect(() => { load(); }, [load]);

  return { items, loading, error, reload: load };
}