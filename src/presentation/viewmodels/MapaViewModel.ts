import { useEffect, useState, useCallback } from 'react';
import {
  getInitialRegion,
  saveRegion,
  radiusFromRegion,
  type Region,
} from '../../core/location';
import type { Articulo } from '../../domain/entities/Articulo';
import type { GetArticulosByGeoUseCase } from '../../domain/usecases/GetArticuloByGeoUseCase';
import type { ToggleFavoriteUseCase } from '../../domain/usecases/ToggleFavoritoUseCase';
import { UserRepositoryImpl } from '../../data/repositories/UserRepositoryImpl';

/**
 * VM de mapa:
 * - Carga artículos por región
 * - Mantiene y sincroniza favoritos con Auth (patchUser diferido para evitar setState-during-render)
 */
export function useMapaVM(
  getByGeo: GetArticulosByGeoUseCase,
  currentUid?: string,
  toggleFavUC?: ToggleFavoriteUseCase,
  patchUser?: (patch: Partial<{ favoritos: string[] }>) => void,
  authFavorites?: string[] | null,
) {
  const [region, setRegion] = useState<Region | null>(null);
  const [items, setItems] = useState<Articulo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // favoritos locales sincronizados con Auth
  const [favorites, setFavorites] = useState<Set<string>>(new Set(authFavorites ?? []));
  useEffect(() => {
    setFavorites(new Set(authFavorites ?? []));
  }, [authFavorites]);

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

  // refresco manual desde Firestore si hiciera falta
  const refreshFavorites = useCallback(async () => {
    if (!currentUid) {
      setFavorites(new Set());
      return;
    }
    const urepo = new UserRepositoryImpl();
    const u = await urepo.getById(currentUid);
    setFavorites(new Set(u?.favoritos ?? []));
    // reflejar en auth sin bloquear el render
    Promise.resolve().then(() => patchUser?.({ favoritos: u?.favoritos ?? [] }));
  }, [currentUid, patchUser]);

  // toggle optimista + patchUser diferido (evita el warning)
  const onToggleFavorite = useCallback(async (articuloId: string) => {
    if (!currentUid || !toggleFavUC) return;

    const next = new Set(favorites);
    next.has(articuloId) ? next.delete(articuloId) : next.add(articuloId);

    // optimista
    setFavorites(next);
    Promise.resolve().then(() => patchUser?.({ favoritos: Array.from(next) }));

    try {
      await toggleFavUC.execute(currentUid, articuloId);
    } catch {
      // revertir
      const revert = new Set(next);
      revert.has(articuloId) ? revert.delete(articuloId) : revert.add(articuloId);
      setFavorites(revert);
      Promise.resolve().then(() => patchUser?.({ favoritos: Array.from(revert) }));
    }
  }, [currentUid, toggleFavUC, favorites, patchUser]);

  return {
    region,
    items,
    loading,
    error,
    onRegionChangeComplete,

    favorites,
    onToggleFavorite,
    refreshFavorites,
  };
}