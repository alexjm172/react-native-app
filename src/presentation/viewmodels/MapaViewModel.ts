import { useEffect, useState, useCallback } from 'react';
import { getInitialRegion, saveRegion, radiusFromRegion, type Region } from '../../core/location';
import type { Articulo } from '../../domain/entities/Articulo';
import type { GetArticulosByGeoUseCase } from '../../domain/usecases/GetArticuloByGeoUseCase';
import type { ToggleFavoriteUseCase } from '../../domain/usecases/ToggleFavoritoUseCase';
import { UserRepositoryImpl } from '../../data/repositories/UserRepositoryImpl';

export function useMapaVM(
  getByGeo: GetArticulosByGeoUseCase,
  currentUid?: string,
  toggleFavUC?: ToggleFavoriteUseCase,
  // para propagar al Auth inmediatamente 
  patchUser?: (patch: Partial<{ favoritos: string[] }>) => void,
  // lista actual desde Auth → reaccionar a cambios externos (Home/Favoritos) 
  favoritesFromAuth?: string[],
) {
  const [region, setRegion] = useState<Region | null>(null);
  const [items, setItems] = useState<Articulo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const fetchArticulos = useCallback(async (r: Region) => {
    setLoading(true);
    setError(null);
    try {
      const list = await getByGeo.execute({
        latitude: r.latitude,
        longitude: r.longitude,
        radiusMeters: radiusFromRegion(r),
      });
      setItems(list);
    } catch (e: any) {
      setError(e?.message ?? 'Error al cargar artículos cercanos');
    } finally {
      setLoading(false);
    }
  }, [getByGeo]);

  useEffect(() => {
    (async () => {
      const r = await getInitialRegion();
      setRegion(r);
      fetchArticulos(r);
    })();
  }, [fetchArticulos]);

  const onRegionChangeComplete = useCallback((r: Region) => {
    setRegion(r);
    saveRegion(r).catch(() => {});
    fetchArticulos(r);
  }, [fetchArticulos]);

  // Escucha cambios del Auth (cuando Home/Favoritos alteren favoritos)
  useEffect(() => {
    if (favoritesFromAuth) setFavorites(new Set(favoritesFromAuth));
  }, [favoritesFromAuth]);

  // Carga inicial desde Firestore (y propaga a Auth)
  const refreshFavorites = useCallback(async () => {
    if (!currentUid) {
      setFavorites(new Set());
      patchUser?.({ favoritos: [] });
      return;
    }
    const urepo = new UserRepositoryImpl();
    const u = await urepo.getById(currentUid);
    const list = u?.favoritos ?? [];
    setFavorites(new Set(list));
    patchUser?.({ favoritos: list });
  }, [currentUid, patchUser]);

  useEffect(() => { refreshFavorites(); }, [refreshFavorites]);

  const onToggleFavorite = useCallback(async (articuloId: string) => {
    if (!currentUid || !toggleFavUC) return;

    // Optimista + reflejo en Auth
    let nextList: string[] = [];
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(articuloId) ? next.delete(articuloId) : next.add(articuloId);
      nextList = Array.from(next);
      return next;
    });
    patchUser?.({ favoritos: nextList });

    try {
      await toggleFavUC.execute(currentUid, articuloId);
    } catch {
      setFavorites(prev => {
        const next = new Set(prev);
        next.has(articuloId) ? next.delete(articuloId) : next.add(articuloId);
        nextList = Array.from(next);
        return next;
      });
      patchUser?.({ favoritos: nextList });
    }
  }, [currentUid, toggleFavUC, patchUser]);

  return {
    region, items, loading, error, onRegionChangeComplete,
    favorites, onToggleFavorite, refreshFavorites,
  };
}