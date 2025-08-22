import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Articulo } from '../../domain/entities/Articulo';
import { GetArticulosByCategoria } from '../../domain/usecases/GetArticulosByCategoria';
import { ToggleFavoriteUseCase } from '../../domain/usecases/ToggleFavoritoUseCase';
import { UserRepositoryImpl } from '../../data/repositories/UserRepositoryImpl';
import {
  CATEGORY_IDS,
  CATEGORY_OPTIONS,
  DEFAULT_CATEGORY,
  type CategoryId,
  type CategoryOption,
  toFirestoreDocId,
} from './types/Category';

const LAST_CATEGORY_KEY = 'last_category';

type VM = {
  categories: CategoryOption[];
  selectedId: CategoryId;
  onChangeCategoria: (id: CategoryId) => void;

  items: Articulo[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;

  fabOpen: boolean;
  toggleFab: () => void;
  closeFab: () => void;

  favorites: Set<string>;
  onToggleFavorite: (articuloId: string) => Promise<void>;

  // 👇 nuevo
  refreshFavorites: () => Promise<void>;
};

export const useHomeVM = (
  ucGetByCategoria: GetArticulosByCategoria,
  currentUid?: string,
  toggleFavUC?: ToggleFavoriteUseCase,
): VM => {
  const [selectedId, setSelectedId] = useState<CategoryId>(DEFAULT_CATEGORY);
  const [items, setItems] = useState<Articulo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const [fabOpen, setFabOpen] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const categories = useMemo(() => CATEGORY_OPTIONS, []);
  const loadSeq = useRef(0);

  const load = useCallback(async (cat: CategoryId) => {
    const mySeq = ++loadSeq.current;
    setLoading(true); setError(null);
    try {
      const collectionId = toFirestoreDocId(cat);
      const list = await ucGetByCategoria.execute(collectionId);
      if (mySeq === loadSeq.current) {
        setItems(list);
        await AsyncStorage.setItem(LAST_CATEGORY_KEY, cat);
      }
    } catch (e: any) {
      if (mySeq === loadSeq.current) setError(e?.message ?? 'Error cargando artículos');
    } finally {
      if (mySeq === loadSeq.current) setLoading(false);
    }
  }, [ucGetByCategoria]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(LAST_CATEGORY_KEY);
        const start = (saved && CATEGORY_IDS.includes(saved as CategoryId))
          ? (saved as CategoryId) : DEFAULT_CATEGORY;
        if (!alive) return;
        setSelectedId(start);
        await load(start);
      } catch {
        if (!alive) return;
        setSelectedId(DEFAULT_CATEGORY);
        await load(DEFAULT_CATEGORY);
      }
    })();
    return () => { alive = false; };
  }, [load]);

  const onChangeCategoria = useCallback((id: CategoryId) => {
    if (id === selectedId) return;
    setSelectedId(id);
    setFabOpen(false);
    load(id);
  }, [selectedId, load]);

  const reload = useCallback(async () => load(selectedId), [load, selectedId]);

  const toggleFab = useCallback(() => setFabOpen(v => !v), []);
  const closeFab  = useCallback(() => setFabOpen(false), []);

  // 👇 nueva función para recargar favoritos desde Firestore
  const refreshFavorites = useCallback(async () => {
    if (!currentUid) {
      setFavorites(new Set());
      return;
    }
    const urepo = new UserRepositoryImpl();
    const u = await urepo.getById(currentUid);
    setFavorites(new Set(u?.favoritos ?? []));
  }, [currentUid]);

  // carga inicial de favoritos
  useEffect(() => { refreshFavorites(); }, [refreshFavorites]);

  const onToggleFavorite = useCallback(async (articuloId: string) => {
    if (!currentUid || !toggleFavUC) return;

    // Optimista
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(articuloId) ? next.delete(articuloId) : next.add(articuloId);
      return next;
    });

    try {
      await toggleFavUC.execute(currentUid, articuloId);
    } catch {
      // revertir si falla
      setFavorites(prev => {
        const next = new Set(prev);
        next.has(articuloId) ? next.delete(articuloId) : next.add(articuloId);
        return next;
      });
    }
  }, [currentUid, toggleFavUC]);

  return {
    categories,
    selectedId,
    onChangeCategoria,

    items,
    loading,
    error,
    reload,

    fabOpen,
    toggleFab,
    closeFab,

    favorites,
    onToggleFavorite,

    // expuesto para que HomeScreen lo llame al re-enfocarse
    refreshFavorites,
  };
};