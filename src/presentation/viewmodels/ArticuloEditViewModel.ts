import { useCallback, useMemo, useState } from 'react';
import { DeviceEventEmitter } from 'react-native';
import type { Articulo } from '../../domain/entities/Articulo';
import { Categoria } from '../../domain/entities/enums/Categoria';
import { Estado } from '../../domain/entities/enums/Estado';
import { UpdateArticuloWithImagesUseCase } from '../../domain/usecases/UpdateArticuloWithImagesUseCase';

type Errors = Partial<Record<
  'nombre'|'categoria'|'estado'|'latitud'|'longitud'|'precios',
  string
>>;

const toNum = (s: string): number | undefined => {
  if (s == null || s.trim() === '') return undefined;
  const n = Number(s.replace(',', '.'));
  return Number.isFinite(n) ? n : undefined;
};

type Options = {
  /** callback opcional cuando se guarda con éxito */
  onSaved?: (a: Articulo) => void;
};

export function useArticuloEditVM(
  initial: Articulo,
  updateUC: UpdateArticuloWithImagesUseCase,
  opts?: Options
) {
  // ======= Campos base
  const [nombre, setNombre] = useState(initial?.nombre ?? '');
  const [marca, setMarca] = useState(initial?.marca ?? '');
  const [categoria, setCategoria] = useState<Categoria>(initial?.categoria ?? Categoria.COCINA);
  const [estado, setEstado] = useState<Estado>(initial?.estado ?? Estado.NUEVO);

  const [precioDia, setPrecioDia] = useState(initial?.precioPorDia != null ? String(initial.precioPorDia) : '');
  const [precioHora, setPrecioHora] = useState(initial?.precioPorHora != null ? String(initial.precioPorHora) : '');
  const [precioSemana, setPrecioSemana] = useState(initial?.precioPorSemana != null ? String(initial.precioPorSemana) : '');

  const [latitud, setLatitud] = useState(initial?.latitud != null ? String(initial.latitud) : '');
  const [longitud, setLongitud] = useState(initial?.longitud != null ? String(initial.longitud) : '');

  // ======= Imágenes
  const [existingUrls] = useState<string[]>(Array.isArray(initial?.imagenes) ? initial.imagenes : []);
  const [removedUrls, setRemovedUrls] = useState<Set<string>>(new Set());
  const [newLocalUris, setNewLocalUris] = useState<string[]>([]);

  // ======= UI
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  // ======= Derivados
  const hasCategoryChange = useMemo(
    () => (initial?.categoria ?? '') !== categoria,
    [initial?.categoria, categoria]
  );

  const dirty = useMemo(() => {
    const asNum = (v: any) => (v == null ? '' : String(v));
    const baseDirty =
      nombre !== (initial?.nombre ?? '') ||
      (marca || '') !== (initial?.marca || '') ||
      categoria !== initial?.categoria ||
      estado !== initial?.estado ||
      asNum(precioDia) !== asNum(initial?.precioPorDia) ||
      asNum(precioHora) !== asNum(initial?.precioPorHora) ||
      asNum(precioSemana) !== asNum(initial?.precioPorSemana) ||
      asNum(latitud) !== asNum(initial?.latitud) ||
      asNum(longitud) !== asNum(initial?.longitud);

    const imgsDirty = removedUrls.size > 0 || newLocalUris.length > 0;
    return baseDirty || imgsDirty;
  }, [
    initial,
    nombre, marca, categoria, estado,
    precioDia, precioHora, precioSemana,
    latitud, longitud,
    removedUrls, newLocalUris
  ]);

  const validate = useCallback((): boolean => {
    const e: Errors = {};
    if (!nombre.trim()) e.nombre = 'El nombre es obligatorio';
    if (!categoria) e.categoria = 'Selecciona una categoría';
    if (!estado) e.estado = 'Selecciona un estado';

    const nDia = toNum(precioDia);
    const nHora = toNum(precioHora);
    const nSem = toNum(precioSemana);
    if (precioDia && nDia === undefined) e.precios = 'Precio/día no válido';
    if (precioHora && nHora === undefined) e.precios = 'Precio/hora no válido';
    if (precioSemana && nSem === undefined) e.precios = 'Precio/semana no válido';

    const nLat = toNum(latitud);
    const nLng = toNum(longitud);
    if (latitud && nLat === undefined) e.latitud = 'Latitud no válida';
    if (longitud && nLng === undefined) e.longitud = 'Longitud no válida';

    setErrors(e);
    return Object.keys(e).length === 0;
  }, [nombre, categoria, estado, precioDia, precioHora, precioSemana, latitud, longitud]);

  const snapshot = useCallback((): Articulo => {
    const nDia = toNum(precioDia);
    const nHora = toNum(precioHora);
    const nSem = toNum(precioSemana);
    const nLat = toNum(latitud);
    const nLng = toNum(longitud);

    return {
      ...initial,
      nombre: nombre.trim(),
      marca: marca.trim() || undefined,
      categoria,
      estado,
      precioPorDia: nDia,
      precioPorHora: nHora,
      precioPorSemana: nSem,
      latitud: nLat ?? initial.latitud,
      longitud: nLng ?? initial.longitud,
    };
  }, [
    initial,
    nombre, marca, categoria, estado,
    precioDia, precioHora, precioSemana,
    latitud, longitud
  ]);

  const canSave = useMemo(() => {
    if (!dirty) return false;
    if (!nombre.trim() || !categoria || !estado) return false;
    if (precioDia && toNum(precioDia) === undefined) return false;
    if (precioHora && toNum(precioHora) === undefined) return false;
    if (precioSemana && toNum(precioSemana) === undefined) return false;
    if (latitud && toNum(latitud) === undefined) return false;
    if (longitud && toNum(longitud) === undefined) return false;
    return true;
  }, [dirty, nombre, categoria, estado, precioDia, precioHora, precioSemana, latitud, longitud]);

  // ======= Imágenes helpers
  const uiImages = useMemo(() => {
    const existing = existingUrls.map(url => ({
      uri: url, remote: true, removed: removedUrls.has(url),
    }));
    const news = newLocalUris.map(uri => ({
      uri, remote: false, removed: false,
    }));
    return [...existing, ...news];
  }, [existingUrls, removedUrls, newLocalUris]);

  const toggleRemoveExisting = useCallback((url: string) => {
    setRemovedUrls(prev => {
      const next = new Set(prev);
      next.has(url) ? next.delete(url) : next.add(url);
      return next;
    });
  }, []);

  const removeNewLocal = useCallback((uri: string) => {
    setNewLocalUris(prev => prev.filter(u => u !== uri));
  }, []);

  const addNewLocal = useCallback((uris: string[]) => {
    if (!uris?.length) return;
    setNewLocalUris(prev => [...prev, ...uris]);
  }, []);

  /** Para el selector de mapa */
  const setCoordsFromMap = useCallback((lat: number, lng: number) => {
    setLatitud(String(lat));
    setLongitud(String(lng));
  }, []);

  // ======= Guardar
  const save = useCallback(async (): Promise<Articulo> => {
    if (!validate()) throw new Error('Formulario inválido');
    setLoading(true);
    try {
      const updated = snapshot();

      const keepUrls   = existingUrls.filter(u => !removedUrls.has(u));
      const removeUrls = Array.from(removedUrls);
      const addLocalUris = newLocalUris.slice();

      const finalArticulo = await updateUC.execute({
        base: initial,
        updated,
        keepUrls,
        removeUrls,
        addLocalUris,
      });

      // limpiar flags locales
      setRemovedUrls(new Set());
      setNewLocalUris([]);

      // Notificar a toda la app (Home, MisProductos, etc.)
      DeviceEventEmitter.emit('articulo:updated', {
        articulo: finalArticulo,
        oldCategoria: initial.categoria,
      });

      // callback opcional
      opts?.onSaved?.(finalArticulo);

      return finalArticulo ?? updated;
    } finally {
      setLoading(false);
    }
  }, [
    validate, snapshot, updateUC,
    existingUrls, removedUrls, newLocalUris,
    initial, opts
  ]);

  return {
    // campos
    nombre, setNombre,
    marca, setMarca,
    categoria, setCategoria,
    estado, setEstado,
    precioDia, setPrecioDia,
    precioHora, setPrecioHora,
    precioSemana, setPrecioSemana,
    latitud, setLatitud,
    longitud, setLongitud,

    // imágenes
    uiImages,
    toggleRemoveExisting,
    removeNewLocal,
    addNewLocal,

    // estado
    errors,
    loading,
    canSave,
    dirty,
    hasCategoryChange,

    // ubicación desde mapa
    setCoordsFromMap,

    save,
  };
}