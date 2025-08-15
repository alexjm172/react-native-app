import { useEffect, useState, useCallback } from 'react';
import { getInitialRegion, saveRegion, radiusFromRegion, type Region } from '../../core/location';
import type { Articulo } from '../../domain/entities/Articulo';
import type { GetArticulosByGeoUseCase } from '../../domain/usecases/GetArticuloByGeoUseCase';

export function useMapaVM(getByGeo: GetArticulosByGeoUseCase) {
  const [region, setRegion] = useState<Region | null>(null);
  const [items, setItems] = useState<Articulo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

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

  return { region, items, loading, error, onRegionChangeComplete };
}