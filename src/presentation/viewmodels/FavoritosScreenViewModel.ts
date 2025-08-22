import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Articulo } from '../../domain/entities/Articulo';

import { useAuth } from '../../app/providers/AuthProvider';
import { ArticuloRepositoryImpl } from '../../data/repositories/ArticuloRepositoryImpl';
import { UserRepositoryImpl } from '../../data/repositories/UserRepositoryImpl';

import { GetArticulosByIds } from '../../domain/usecases/GetArticulosByIdsUseCase';
import { ToggleFavoriteUseCase } from '../../domain/usecases/ToggleFavoritoUseCase';

export function FavoritosScreenViewModel() {
  // Usuario actual del contexto
  const { user } = useAuth();
  const currentUid = user?.id;

  // DI mínima aquí para simplificar la pantalla
  const artRepo  = useMemo(() => new ArticuloRepositoryImpl(), []);
  const getByIds = useMemo(() => new GetArticulosByIds(artRepo), [artRepo]);

  const usrRepo  = useMemo(() => new UserRepositoryImpl(), []);
  const toggleUC = useMemo(() => new ToggleFavoriteUseCase(usrRepo), [usrRepo]);

  const [items, setItems] = useState<Articulo[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    // ⚠️ Tomamos los IDs directamente del usuario en memoria
    const ids = user?.favoritos ?? [];
    if (!ids.length) {
      setItems([]);
      setFavorites(new Set());
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await getByIds.execute(ids);
      setItems(list);
      setFavorites(new Set(ids)); // estado del icono
    } catch (e: any) {
      setError(e?.message ?? 'Error cargando favoritos');
    } finally {
      setLoading(false);
    }
  }, [user?.favoritos, getByIds]);

  // carga inicial + cuando cambie la lista de favoritos del usuario en Auth
  useEffect(() => { load(); }, [load]);

  /** Alterna favorito; devuelve true si queda como favorito, false si se quita */
  const onToggleFavorite = useCallback(async (articuloId: string): Promise<boolean> => {
    if (!currentUid) return true;

    const willBeFav = !favorites.has(articuloId);

    // Optimista para el icono
    setFavorites(prev => {
      const next = new Set(prev);
      willBeFav ? next.add(articuloId) : next.delete(articuloId);
      return next;
    });

    try {
      await toggleUC.execute(currentUid, articuloId);
      return willBeFav;
    } catch {
      // Revertir si falla
      setFavorites(prev => {
        const next = new Set(prev);
        willBeFav ? next.delete(articuloId) : next.add(articuloId);
        return next;
      });
      return !willBeFav;
    }
  }, [currentUid, toggleUC, favorites]);

  // Quita localmente un artículo de la lista (lo llama la vista tras la animación)
  const removeLocal = useCallback((articuloId: string) => {
    setItems(prev => prev.filter(a => a.id !== articuloId));
    setFavorites(prev => {
      const next = new Set(prev);
      next.delete(articuloId);
      return next;
    });
  }, []);

  return { items, favorites, loading, error, reload: load, onToggleFavorite, removeLocal };
}