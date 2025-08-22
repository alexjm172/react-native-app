import { useMemo, useState } from 'react';
import { Platform } from 'react-native';
import type { Articulo } from '../../domain/entities/Articulo';

export function ArticuloDetailViewModel(articulo?: Articulo) {
  // Normaliza imágenes
  const images = useMemo<string[]>(() => {
    if (!articulo) return [];
    const a: any = articulo;
    if (Array.isArray(a.imagenes)) return a.imagenes.filter(Boolean);
    if (Array.isArray(a.fotos)) return a.fotos.filter(Boolean);
    if (typeof a.imagen === 'string' && a.imagen.length > 0) return [a.imagen];
    return [];
  }, [articulo]);

  const hasImages = images.length > 0;

  // Valoraciones
  const { avgRating, ratingCount } = useMemo(() => {
    const vals = (articulo?.valoraciones ?? []).filter((n) => typeof n === 'number') as number[];
    const count = vals.length;
    const avg = count ? vals.reduce((s, n) => s + n, 0) / count : 0;
    return { avgRating: avg, ratingCount: count };
  }, [articulo]);

  // Etiquetas legibles
  const categoriaLabel = useMemo(() => String(articulo?.categoria ?? ''), [articulo?.categoria]);
  const estadoLabel    = useMemo(() => String(articulo?.estado ?? ''), [articulo?.estado]);

  // Precios presentes
  const precios = useMemo(() => ({
    hora:   articulo?.precioPorHora,
    dia:    articulo?.precioPorDia,
    semana: articulo?.precioPorSemana,
  }), [articulo?.precioPorHora, articulo?.precioPorDia, articulo?.precioPorSemana]);

  const hasLocation = !!(articulo && typeof articulo.latitud === 'number' && typeof articulo.longitud === 'number');

  // Fullscreen
  const [fullVisible, setFullVisible] = useState(false);
  const [fullIndex, setFullIndex] = useState(0);
  const openFull  = (i: number) => { setFullIndex(i); setFullVisible(true); };
  const closeFull = () => setFullVisible(false);

  const isIOS = Platform.OS === 'ios';

  return {
    images, hasImages,
    fullVisible, fullIndex, openFull, closeFull, setFullIndex,
    avgRating, ratingCount,
    categoriaLabel, estadoLabel,
    precios,
    hasLocation,
    isIOS,
  };
}