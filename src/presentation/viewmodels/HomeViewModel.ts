import { useEffect, useMemo, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Articulo } from '../../domain/entities/Articulo';
import { GetArticulosByCategoria } from '../../domain/usecases/GetArticulosByCategoria';

import {
  CATEGORY_IDS,
  CATEGORY_LABELS,
  CATEGORY_OPTIONS,
  DEFAULT_CATEGORY,
  type CategoryId,
  type CategoryOption,
  toFirestoreDocId,
} from './types/Category';

const LAST_CATEGORY_KEY = 'last_category';

export const useHomeVM = (ucGetByCategoria: GetArticulosByCategoria) => {
  const [selectedId, setSelectedId] = useState<CategoryId>(DEFAULT_CATEGORY);
  const [items, setItems] = useState<Articulo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fabOpen, setFabOpen] = useState(false);

  // Fuente de categorías para la UI
  const categories: CategoryOption[] = useMemo(() => CATEGORY_OPTIONS, []);

  const load = useCallback(async (cat: CategoryId) => {
    setLoading(true);
    setError(null);
    try {
      const docId = toFirestoreDocId(cat);      // 👈 mapping UI → Firestore
      const result = await ucGetByCategoria.execute(docId);
      setItems(result);
      await AsyncStorage.setItem(LAST_CATEGORY_KEY, cat);
    } catch (e: any) {
      setError(e?.message ?? 'Error cargando artículos');
    } finally {
      setLoading(false);
    }
  }, [ucGetByCategoria]);

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
      setSelectedId(DEFAULT_CATEGORY);
      load(DEFAULT_CATEGORY);
    })();
  }, [load]);

  const onChangeCategoria = useCallback((id: CategoryId) => {
    setSelectedId(id);
    setFabOpen(false);
    load(id);
  }, [load]);

  const toggleFab = useCallback(() => setFabOpen(v => !v), []);
  const closeFab  = useCallback(() => setFabOpen(false), []);

  return {
    categories,
    selectedId,
    onChangeCategoria,
    items,
    loading,
    error,
    reload: () => load(selectedId),
    fabOpen,
    toggleFab,
    closeFab,
  };
};