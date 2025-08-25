import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Articulo } from '../../domain/entities/Articulo';
import { Estado } from '../../domain/entities/enums/Estado';
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

export type HomeFiltersVM = {
  marca: string;
  estado?: Estado;
  desde?: string; // YYYY-MM-DD
  hasta?: string; // YYYY-MM-DD
};

type VM = {
  categories: CategoryOption[];
  selectedId: CategoryId;
  onChangeCategoria: (id: CategoryId) => void;

  items: Articulo[];           
  filteredItems: Articulo[];  
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;

  fabOpen: boolean;
  toggleFab: () => void;
  closeFab: () => void;

  favorites: Set<string>;
  onToggleFavorite: (articuloId: string) => Promise<void>;
  refreshFavorites: () => Promise<void>;

  filters: HomeFiltersVM;
  setFilters: React.Dispatch<React.SetStateAction<HomeFiltersVM>>;
  activeFiltersCount: number;
};

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const toStr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

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

  // Filtros controlados por la VM (aplican en caliente)
  const [filters, setFilters] = useState<HomeFiltersVM>({
    marca: '',
    estado: undefined,
    desde: undefined,
    hasta: undefined,
  });

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

  // Favoritos desde Firestore
  const refreshFavorites = useCallback(async () => {
    if (!currentUid) {
      setFavorites(new Set());
      return;
    }
    const urepo = new UserRepositoryImpl();
    const u = await urepo.getById(currentUid);
    setFavorites(new Set(u?.favoritos ?? []));
  }, [currentUid]);

  useEffect(() => { refreshFavorites(); }, [refreshFavorites]);

  const onToggleFavorite = useCallback(async (articuloId: string) => {
    if (!currentUid || !toggleFavUC) return;

    setFavorites(prev => {
      const next = new Set(prev);
      next.has(articuloId) ? next.delete(articuloId) : next.add(articuloId);
      return next;
    });

    try {
      await toggleFavUC.execute(currentUid, articuloId);
    } catch {
      setFavorites(prev => {
        const next = new Set(prev);
        next.has(articuloId) ? next.delete(articuloId) : next.add(articuloId);
        return next;
      });
    }
  }, [currentUid, toggleFavUC]);

  // ---- Filtros (marca/estado/disponibilidad)
  const overlaps = (aStart: string, aEnd: string, bStart: string, bEnd: string) => {
    const A = new Date(aStart), B = new Date(aEnd);
    const X = new Date(bStart), Y = new Date(bEnd);
    return A <= Y && B >= X;
  };

  const passesFilters = useCallback((a: Articulo) => {
    // Marca contains case-insensitive
    if (filters.marca?.trim()) {
      const q = filters.marca.trim().toLowerCase();
      const hay = (a.marca ?? '').toString().toLowerCase();
      if (!hay.includes(q)) return false;
    }
    // Estado exacto
    if (filters.estado && a.estado !== filters.estado) return false;
    // Disponibilidad (excluir si hay algún alquiler solapado)
    if (filters.desde && filters.hasta) {
      const wantStart = filters.desde;
      const wantEnd   = filters.hasta;
      const bookings: any[] = Array.isArray(a.alquileres) ? a.alquileres : [];
      for (const alq of bookings) {
        const d1 = typeof alq.fechaDesde === 'string'
          ? alq.fechaDesde
          : (alq.fechaDesde as any)?.toDate?.() ?? alq.fechaDesde;
        const d2 = typeof alq.fechaHasta === 'string'
          ? alq.fechaHasta
          : (alq.fechaHasta as any)?.toDate?.() ?? alq.fechaHasta;
        const bs = toStr(new Date(d1 as any));
        const be = toStr(new Date(d2 as any));
        if (overlaps(wantStart, wantEnd, bs, be)) return false;
      }
    }
    return true;
  }, [filters]);

  const filteredItems = useMemo(() => {
    if (!filters.marca && !filters.estado && !(filters.desde && filters.hasta)) return items;
    return items.filter(passesFilters);
  }, [items, filters, passesFilters]);

  const activeFiltersCount = useMemo(() => {
    let c = 0;
    if (filters.marca?.trim()) c++;
    if (filters.estado) c++;
    if (filters.desde && filters.hasta) c++;
    return c;
  }, [filters]);

  return {
    categories,
    selectedId,
    onChangeCategoria,

    items,
    filteredItems,
    loading,
    error,
    reload,

    fabOpen,
    toggleFab,
    closeFab,

    favorites,
    onToggleFavorite,
    refreshFavorites,

    filters,
    setFilters,
    activeFiltersCount,
  };
};