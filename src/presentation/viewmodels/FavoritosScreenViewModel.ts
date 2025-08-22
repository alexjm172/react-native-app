import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Articulo } from '../../domain/entities/Articulo';

// DI internas (para simplificar la pantalla)
import { useAuth } from '../../app/providers/AuthProvider';
import { ArticuloRepositoryImpl } from '../../data/repositories/ArticuloRepositoryImpl';
import { UserRepositoryImpl } from '../../data/repositories/UserRepositoryImpl';
import { GetFavoritosUseCase } from '../../domain/usecases/GetFavoritosUseCase';
import { ToggleFavoriteUseCase } from '../../domain/usecases/ToggleFavoritoUseCase';

const TAG = '[FavoritosVM]';
const log = (...args: any[]) => { if (__DEV__) console.log(TAG, ...args); };

export function FavoritosScreenViewModel() {
  // usuario actual
  const { user } = useAuth();
  const currentUid = user?.id;

  // DI (repos + usecases) aquí dentro para limpiar la pantalla
  const artRepo   = useMemo(() => new ArticuloRepositoryImpl(), []);
  const usrRepo   = useMemo(() => new UserRepositoryImpl(), []);
  const getFavsUC = useMemo(() => new GetFavoritosUseCase(usrRepo, artRepo), [usrRepo, artRepo]);
  const toggleUC  = useMemo(() => new ToggleFavoriteUseCase(usrRepo), [usrRepo]);

  const [items, setItems] = useState<Articulo[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    log('load() start', { currentUid });
    if (!currentUid) {
      log('load() skipped: no currentUid');
      setItems([]);
      setFavorites(new Set());
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await getFavsUC.execute(currentUid);
      log('load() success. artículos recibidos:', list.length, list.map(a => a.id));
      setItems(list);
      const favSet = new Set(list.map(a => a.id));
      setFavorites(favSet);
      log('load() favorites set →', [...favSet]);
    } catch (e: any) {
      log('load() error:', e?.message ?? e);
      setError(e?.message ?? 'Error cargando favoritos');
    } finally {
      setLoading(false);
      log('load() end');
    }
  }, [currentUid, getFavsUC]);

  useEffect(() => {
    log('useEffect init. currentUid:', currentUid);
    load();
  }, [load, currentUid]);

  /** Alterna favorito; devuelve true si queda como favorito, false si se quita */
  const onToggleFavorite = useCallback(async (articuloId: string): Promise<boolean> => {
    log('onToggleFavorite() called', { currentUid, articuloId });
    if (!currentUid) {
      log('onToggleFavorite() aborted: no currentUid');
      return true;
    }

    const willBeFav = !favorites.has(articuloId);
    log('onToggleFavorite() willBeFav?', willBeFav, 'favoritesBefore:', [...favorites]);

    // Optimista para el icono
    setFavorites(prev => {
      const next = new Set(prev);
      if (willBeFav) next.add(articuloId);
      else next.delete(articuloId);
      log('onToggleFavorite() optimistic favorites →', [...next]);
      return next;
    });

    try {
      log('onToggleFavorite() calling toggleUC.execute', { uid: currentUid, articuloId });
      await toggleUC.execute(currentUid, articuloId);
      log('onToggleFavorite() backend OK. final willBeFav:', willBeFav);
      return willBeFav;
    } catch (e) {
      log('onToggleFavorite() backend ERROR, reverting.', e ?? e);
      // Revertimos
      setFavorites(prev => {
        const next = new Set(prev);
        if (willBeFav) next.delete(articuloId);
        else next.add(articuloId);
        log('onToggleFavorite() reverted favorites →', [...next]);
        return next;
      });
      return !willBeFav;
    }
  }, [currentUid, toggleUC, favorites]);

  // Quita localmente un artículo de la lista (se llama tras animación)
  const removeLocal = useCallback((articuloId: string) => {
    log('removeLocal()', { articuloId, itemsBefore: items.map(a => a.id) });
    setItems(prev => {
      const next = prev.filter(a => a.id !== articuloId);
      log('removeLocal() itemsAfter:', next.map(a => a.id));
      return next;
    });
    setFavorites(prev => {
      const next = new Set(prev);
      next.delete(articuloId);
      log('removeLocal() favoritesAfter:', [...next]);
      return next;
    });
  }, [items]);

  return { items, favorites, loading, error, reload: load, onToggleFavorite, removeLocal };
}