import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Articulo } from '../../domain/entities/Articulo';
import { useAuth } from '../../app/providers/AuthProvider';
import { ArticuloRepositoryImpl } from '../../data/repositories/ArticuloRepositoryImpl';
import { UserRepositoryImpl } from '../../data/repositories/UserRepositoryImpl';
import { GetArticulosByIds } from '../../domain/usecases/GetArticulosByIdsUseCase';
import { ToggleFavoriteUseCase } from '../../domain/usecases/ToggleFavoritoUseCase';

export function FavoritosScreenViewModel() {
  const { user, patchUser } = useAuth();
  const currentUid = user?.id;

  const artRepo  = useMemo(() => new ArticuloRepositoryImpl(), []);
  const getByIds = useMemo(() => new GetArticulosByIds(artRepo), [artRepo]);

  const usrRepo  = useMemo(() => new UserRepositoryImpl(), []);
  const toggleUC = useMemo(() => new ToggleFavoriteUseCase(usrRepo), [usrRepo]);

  const [items, setItems] = useState<Articulo[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    const ids = user?.favoritos ?? [];
    if (!ids.length) { setItems([]); setFavorites(new Set()); return; }
    setLoading(true); setError(null);
    try {
      const list = await getByIds.execute(ids);
      setItems(list);
      setFavorites(new Set(ids));
    } catch (e: any) {
      setError(e?.message ?? 'Error cargando favoritos');
    } finally {
      setLoading(false);
    }
  }, [user?.favoritos, getByIds]);

  useEffect(() => { load(); }, [load]);

  const onToggleFavorite = useCallback(async (articuloId: string): Promise<boolean> => {
    if (!currentUid) return true;

    const willBeFav = !favorites.has(articuloId);

    // 1) optimista local
    const next = new Set(favorites);
    willBeFav ? next.add(articuloId) : next.delete(articuloId);
    setFavorites(next);

    try {
      // 2) remoto
      await toggleUC.execute(currentUid, articuloId);
      // 3) reflejar en Auth *fuera* de cualquier setState/callback
      patchUser({ favoritos: Array.from(next) });
      return willBeFav;
    } catch {
      // revertir
      const revert = new Set(next);
      willBeFav ? revert.delete(articuloId) : revert.add(articuloId);
      setFavorites(revert);
      patchUser({ favoritos: Array.from(revert) });
      return !willBeFav;
    }
  }, [currentUid, favorites, toggleUC, patchUser]);

  const removeLocal = useCallback((articuloId: string) => {
    setItems(prev => prev.filter(a => a.id !== articuloId));
    setFavorites(prev => {
      const n = new Set(prev); n.delete(articuloId); return n;
    });
  }, []);

  return { items, favorites, loading, error, reload: load, onToggleFavorite, removeLocal };
}