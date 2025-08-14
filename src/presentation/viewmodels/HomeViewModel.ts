import { useEffect, useMemo, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Articulo } from '../../domain/entities/Articulo';
import { GetArticulosByCategoria } from '../../domain/usecases/GetArticulosByCategoria';
import {
  CATEGORY_IDS,
  CATEGORY_LABELS,
  DEFAULT_CATEGORY,
  CategoryId,
  CategoryOption,
} from './types/Category';

const LAST_CATEGORY_KEY = 'last_category';

export const useHomeVM = (ucGetByCategoria: GetArticulosByCategoria) => {
  const [selectedId, setSelectedId] = useState<CategoryId>(DEFAULT_CATEGORY);
  const [items, setItems] = useState<Articulo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories: CategoryOption[] = useMemo(
    () => CATEGORY_IDS.map(id => ({ id, label: CATEGORY_LABELS[id] })),
    []
  );

  const load = useCallback(async (cat: CategoryId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await ucGetByCategoria.execute(cat);
      setItems(result);
      await AsyncStorage.setItem(LAST_CATEGORY_KEY, cat);
    } catch (e: any) {
      setError(e?.message ?? 'Error cargando artículos');
    } finally {
      setLoading(false);
    }
  }, [ucGetByCategoria]);

  // restaurar última categoría o por defecto
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(LAST_CATEGORY_KEY);
        if (saved && CATEGORY_IDS.includes(saved as CategoryId)) {
          setSelectedId(saved as CategoryId);
          await load(saved as CategoryId);
          return;
        }
      } catch {}
      load(DEFAULT_CATEGORY);
    })();
  }, [load]);

  const onChangeCategoria = useCallback((id: CategoryId) => {
    setSelectedId(id);
    load(id);
  }, [load]);

  return {
    categories,
    selectedId,
    onChangeCategoria,
    items,
    loading,
    error,
    reload: () => load(selectedId),
  };
};