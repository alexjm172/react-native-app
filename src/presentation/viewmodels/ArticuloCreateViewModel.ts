import { useCallback, useMemo, useState } from 'react';
import type { Categoria } from '../../domain/entities/enums/Categoria';
import { Categoria as Cat } from '../../domain/entities/enums/Categoria';
import { Estado } from '../../domain/entities/enums/Estado';
import { CreateArticuloWithImagesUseCase } from '../../domain/usecases/CrearArticuloWithImagesUseCase';
import type { Articulo } from '../../domain/entities/Articulo';

type Errors = Partial<Record<'nombre'|'categoria'|'estado'|'ubicacion'|'precios', string>>;

const toNum = (s: string): number|undefined => {
  if (!s?.trim()) return undefined;
  const n = Number(s.replace(',', '.'));
  return Number.isFinite(n) ? n : undefined;
};

export function useArticuloCreateVM(
  ownerUid: string,
  createUC: CreateArticuloWithImagesUseCase
) {
  // campos
  const [nombre, setNombre] = useState('');
  const [marca, setMarca]   = useState('');
  const [categoria, setCategoria] = useState<Categoria>(Cat.COCINA);
  const [estado, setEstado] = useState(Estado.NUEVO);

  const [precioDia, setPrecioDia]       = useState('');
  const [precioHora, setPrecioHora]     = useState('');
  const [precioSemana, setPrecioSemana] = useState('');

  const [latitud, setLatitud]   = useState<string>('');
  const [longitud, setLongitud] = useState<string>('');

  // imágenes
  const [newLocalUris, setNewLocalUris] = useState<string[]>([]);

  // UI
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  const addNewLocal = useCallback((uris: string[]) => {
    setNewLocalUris(prev => [...prev, ...uris.filter(Boolean)]);
  }, []);
  const removeNewLocal = useCallback((uri: string) => {
    setNewLocalUris(prev => prev.filter(u => u !== uri));
  }, []);

  const canSave = useMemo(() => {
    if (!nombre.trim()) return false;
    if (!categoria || !estado) return false;
    if (!latitud.trim() || !longitud.trim()) return false;
    if (precioDia && toNum(precioDia) === undefined) return false;
    if (precioHora && toNum(precioHora) === undefined) return false;
    if (precioSemana && toNum(precioSemana) === undefined) return false;
    return true;
  }, [nombre, categoria, estado, latitud, longitud, precioDia, precioHora, precioSemana]);

  const validate = useCallback(() => {
    const e: Errors = {};
    if (!nombre.trim()) e.nombre = 'El nombre es obligatorio';
    if (!categoria) e.categoria = 'Selecciona categoría';
    if (!estado) e.estado = 'Selecciona estado';
    if (!latitud.trim() || !longitud.trim()) e.ubicacion = 'Selecciona ubicación en el mapa';
    if (precioDia && toNum(precioDia) === undefined) e.precios = 'Precio/día no válido';
    if (precioHora && toNum(precioHora) === undefined) e.precios = 'Precio/hora no válido';
    if (precioSemana && toNum(precioSemana) === undefined) e.precios = 'Precio/semana no válido';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [nombre, categoria, estado, latitud, longitud, precioDia, precioHora, precioSemana]);

  const save = useCallback(async (): Promise<Articulo> => {
    if (!validate()) throw new Error('Formulario inválido');
    setLoading(true);
    try {
      const res = await createUC.execute({
        ownerUid,
        data: {
          categoria,
          nombre,
          marca,
          estado,
          precioPorDia: toNum(precioDia),
          precioPorHora: toNum(precioHora),
          precioPorSemana: toNum(precioSemana),
          latitud: Number(latitud),
          longitud: Number(longitud),
        },
        addLocalUris: newLocalUris,
      });
      // limpiar imágenes locales una vez creado
      setNewLocalUris([]);
      return res;
    } finally {
      setLoading(false);
    }
  }, [ownerUid, createUC, categoria, nombre, marca, estado, precioDia, precioHora, precioSemana, latitud, longitud, newLocalUris, validate]);

  return {
    // campos
    nombre, setNombre, marca, setMarca,
    categoria, setCategoria, estado, setEstado,
    precioDia, setPrecioDia, precioHora, setPrecioHora, precioSemana, setPrecioSemana,
    latitud, setLatitud, longitud, setLongitud,

    // imágenes
    newLocalUris, addNewLocal, removeNewLocal,

    // ui
    errors, loading, canSave,

    save,
  };
}