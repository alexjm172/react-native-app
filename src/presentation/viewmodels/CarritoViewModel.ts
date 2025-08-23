import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Articulo } from '../../domain/entities/Articulo';
import { useCart } from '../../app/providers/CartProvider';
import { ArticuloRepositoryImpl } from '../../data/repositories/ArticuloRepositoryImpl';
import { GetArticulosByIds } from '../../domain/usecases/GetArticulosByIdsUseCase';

/* YYYY-MM-DD helpers */
const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const toStr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (d: Date, n: number) => {
  const x = new Date(d); x.setDate(x.getDate() + n); return x;
};
const eachDay = (a: string, b: string) => {
  const out: string[] = [];
  let cur = new Date(a), end = new Date(b);
  if (cur > end) [cur, end] = [end, cur];
  for (let i = new Date(cur); i <= end; i = addDays(i, 1)) out.push(toStr(i));
  return out;
};

export type Range = { start?: string; end?: string };

export function useCarritoVM() {
  const { ids: cartIds, remove, toggle } = useCart();

  const [items, setItems] = useState<Articulo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string|null>(null);

  // UI: expandido por item
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [ranges, setRanges]     = useState<Record<string, Range>>({});

  // Carga artículos por ids de carrito
  const repo = useMemo(() => new ArticuloRepositoryImpl(), []);
  const uc   = useMemo(() => new GetArticulosByIds(repo), [repo]);

  const seq = useRef(0);
  const load = useCallback(async () => {
    const my = ++seq.current;
    setLoading(true); setError(null);
    try {
      if (cartIds.length === 0) { setItems([]); return; }
      const data = await uc.execute(cartIds);
      if (my === seq.current) setItems(data);
    } catch (e: any) {
      if (my === seq.current) setError(e?.message ?? 'Error cargando carrito');
    } finally {
      if (my === seq.current) setLoading(false);
    }
  }, [cartIds, uc]);

  useEffect(() => { load(); }, [load]);

  /** expand/collapse */
  const toggleExpand = useCallback((id: string) => {
    setExpanded(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }, []);
  const isExpanded = useCallback((id: string) => expanded.has(id), [expanded]);

  /** rango seleccionado por item */
  const setRange = useCallback((id: string, r: Range) => {
    setRanges(prev => ({ ...prev, [id]: r }));
  }, []);

  /** bloqueos (alquileres) por artículo → array de pares [desde,hasta] */
  const blockedFor = useCallback((a: Articulo): [string, string][] => {
    if (!Array.isArray(a.alquileres)) return [];
    return a.alquileres.map(alq => {
      const d1 = typeof alq.fechaDesde === 'string' ? alq.fechaDesde : (alq.fechaDesde as any)?.toDate?.() ?? alq.fechaDesde;
      const d2 = typeof alq.fechaHasta === 'string' ? alq.fechaHasta : (alq.fechaHasta as any)?.toDate?.() ?? alq.fechaHasta;
      return [toStr(new Date(d1 as any)), toStr(new Date(d2 as any))];
    });
  }, []);

  /** comprobar solape del rango [s,e] con bloqueos */
  const overlapsAny = useCallback((s: string, e: string, blocks: [string,string][]) => {
    const A = new Date(s), B = new Date(e);
    for (const [bs, be] of blocks) {
      const X = new Date(bs), Y = new Date(be);
      if (A <= Y && B >= X) return true;
    }
    return false;
  }, []);

  /** selección de día (Calendar) */
  const onPick = useCallback((a: Articulo, dayStr: string) => {
    const id = a.id;
    const r = ranges[id] ?? {};
    const blocks = blockedFor(a);
    if (!r.start) {
      setRange(id, { start: dayStr });
      return;
    }
    if (r.start && !r.end) {
      let start = r.start, end = dayStr;
      if (new Date(end) < new Date(start)) [start, end] = [end, start];
      if (overlapsAny(start, end, blocks)) return;         // no permitir
      setRange(id, { start, end });
      return;
    }
    // si había rango cerrado → reiniciar con el nuevo inicio
    setRange(id, { start: dayStr });
  }, [ranges, blockedFor, overlapsAny, setRange]);

  /** days de bloqueos para marcado disabled */
  const disabledDaysFor = useCallback((a: Articulo) => {
    const blocks = blockedFor(a);
    const out: Record<string, true> = {};
    blocks.forEach(([s, e]) => eachDay(s, e).forEach(d => (out[d] = true)));
    return out;
  }, [blockedFor]);

  /** marcado para react-native-calendars (markingType="period") */
  const markedFor = useCallback((id: string, a: Articulo) => {
    const r = ranges[id] ?? {};
    const marked: Record<string, any> = {};

    // deshabilitados por alquiler
    const disabled = disabledDaysFor(a);
    Object.keys(disabled).forEach(d => {
      marked[d] = { ...(marked[d] || {}), disabled: true, disableTouchEvent: true };
    });

    // rango seleccionado
    if (r.start && r.end) {
      const days = eachDay(r.start, r.end);
      days.forEach((d, i) => {
        const first = i === 0, last = i === days.length - 1;
        marked[d] = {
          ...(marked[d] || {}),
          startingDay: first,
          endingDay: last,
          color: first || last ? '#38bdf8' : '#bae6fd',
          textColor: first || last ? '#ffffff' : '#0f172a',
        };
      });
    } else if (r.start) {
      marked[r.start] = {
        ...(marked[r.start] || {}),
        startingDay: true, endingDay: true,
        color: '#38bdf8', textColor: '#ffffff',
      };
    }
    return marked;
  }, [ranges, disabledDaysFor]);

  /** estimación de precio */
  const estimate = useCallback((a: Articulo) => {
    const r = ranges[a.id];
    if (!r?.start || !r?.end) return null;

    const ms = +new Date(r.end) - +new Date(r.start);
    const days = Math.ceil(ms / (24 * 3600 * 1000));
    const hours = Math.ceil(ms / (3600 * 1000));

    let total = 0;
    let breakdown = '';

    if (days >= 7 && a.precioPorSemana != null) {
      const weeks = Math.floor(days / 7);
      total += weeks * (a.precioPorSemana ?? 0);
      const restDays = days - weeks * 7;
      if (restDays > 0 && a.precioPorDia != null) total += restDays * (a.precioPorDia ?? 0);
      breakdown = `${weeks}sem × ${a.precioPorSemana}€ + ${restDays}d × ${a.precioPorDia ?? 0}€`;
    } else if (days >= 1 && a.precioPorDia != null) {
      total = days * (a.precioPorDia ?? 0);
      breakdown = `${days}d × ${a.precioPorDia}€`;
    } else if (a.precioPorHora != null) {
      total = hours * (a.precioPorHora ?? 0);
      breakdown = `${hours}h × ${a.precioPorHora}€`;
    } else {
      breakdown = '—';
    }

    return { total, breakdown };
  }, [ranges]);

  /** remove del carrito (la animación se hace en la vista y luego llamas a esto) */
  const removeFromCart = useCallback((id: string) => {
    remove(id);
    setExpanded(prev => {
      const n = new Set(prev); n.delete(id); return n;
    });
    setRanges(prev => {
      const { [id]: _, ...rest } = prev; return rest;
    });
  }, [remove]);

  const today = useMemo(() => toStr(new Date()), []);
  return {
    items, loading, error, reload: load,
    isExpanded, toggleExpand,
    ranges, setRange, onPick,
    markedFor, today,
    estimate,
    removeFromCart, toggleCart: toggle,
  };
}