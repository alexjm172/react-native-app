import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Articulo } from '../../domain/entities/Articulo';
import { GetArticulosByCategoria } from '../../domain/usecases/GetArticulosByCategoria';

const LAST_CATEGORY_KEY = 'last_category';

export const useCategoriaVM = (ucGetByCategoria: GetArticulosByCategoria, categoria: string) => {
  const [items, setItems] = useState<Articulo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await ucGetByCategoria.execute(categoria);
      setItems(result);
      await AsyncStorage.setItem(LAST_CATEGORY_KEY, categoria);
    } catch (e: any) {
      setError(e?.message ?? 'Error cargando artículos');
    } finally {
      setLoading(false);
    }
  }, [categoria, ucGetByCategoria]);

  useEffect(() => { load(); }, [load]);

  return { items, loading, error, reload: load };
};