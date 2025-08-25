import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Articulo } from '../../domain/entities/Articulo';
import { useCart } from '../../app/providers/CartProvider';
import { ArticuloRepositoryImpl } from '../../data/repositories/ArticuloRepositoryImpl';
import { GetArticulosByIds } from '../../domain/usecases/GetArticulosByIdsUseCase';
import { AlquilerRepositoryImpl } from '../../data/repositories/AlquilerRepositoyImpl';
import { CreateAlquilerUseCase } from '../../domain/usecases/CrearAlquilerUseCase';
import { useAuth } from '../../app/providers/AuthProvider';

/* ===== helpers de fecha (YYYY-MM-DD) ===== */
const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const toStr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const startOfMonthStr = (y: number, m1to12: number) => `${y}-${pad(m1to12)}-01`;
const eachDay = (a: string, b: string) => {
  const out: string[] = [];
  let cur = new Date(a), end = new Date(b);
  if (cur > end) [cur, end] = [end, cur];
  for (let i = new Date(cur); i <= end; i = addDays(i, 1)) out.push(toStr(i));
  return out;
};

export type Range = { start?: string; end?: string };

export function useCarritoVM() {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const { ids: cartIds, remove, toggle } = useCart();

  const [items, setItems] = useState<Articulo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string|null>(null);

  // UI state
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [ranges, setRanges]     = useState<Record<string, Range>>({});
  const [monthByItem, setMonthByItem] = useState<Record<string, string>>({});
  const [rentingId, setRentingId] = useState<string|null>(null); // <- estado de alquiler por ítem

  // repos & UCs
  const repo = useMemo(() => new ArticuloRepositoryImpl(), []);
  const uc   = useMemo(() => new GetArticulosByIds(repo), [repo]);
  const alquilerRepo = useMemo(() => new AlquilerRepositoryImpl(), []);
  const rentUC       = useMemo(() => new CreateAlquilerUseCase(alquilerRepo), [alquilerRepo]);

  // cargar artículos del carrito
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

  // expand / collapse
  const toggleExpand = useCallback((id: string) => {
    setExpanded(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }, []);
  const isExpanded = useCallback((id: string) => expanded.has(id), [expanded]);

  // rango
  const setRange = useCallback((id: string, r: Range) => {
    setRanges(prev => ({ ...prev, [id]: r }));
  }, []);

  // alquileres bloqueados
  const blockedFor = useCallback((a: Articulo): [string, string][] => {
    if (!Array.isArray(a.alquileres)) return [];
    return a.alquileres.map(alq => {
      const d1 = typeof alq.fechaDesde === 'string' ? alq.fechaDesde : (alq.fechaDesde as any)?.toDate?.() ?? alq.fechaDesde;
      const d2 = typeof alq.fechaHasta === 'string' ? alq.fechaHasta : (alq.fechaHasta as any)?.toDate?.() ?? alq.fechaHasta;
      return [toStr(new Date(d1 as any)), toStr(new Date(d2 as any))];
    });
  }, []);

  const overlapsAny = useCallback((s: string, e: string, blocks: [string,string][]) => {
    const A = new Date(s), B = new Date(e);
    for (const [bs, be] of blocks) {
      const X = new Date(bs), Y = new Date(be);
      if (A <= Y && B >= X) return true;
    }
    return false;
  }, []);

  const onPick = useCallback((a: Articulo, dayStr: string) => {
    const id = a.id;
    const r = ranges[id] ?? {};
    const blocks = blockedFor(a);

    if (!r.start) { setRange(id, { start: dayStr }); return; }
    if (r.start && !r.end) {
      let start = r.start, end = dayStr;
      if (new Date(end) < new Date(start)) [start, end] = [end, start];
      if (overlapsAny(start, end, blocks)) return;
      setRange(id, { start, end });
      return;
    }
    // reinicio
    setRange(id, { start: dayStr });
  }, [ranges, blockedFor, overlapsAny, setRange]);

  const disabledDaysFor = useCallback((a: Articulo) => {
    const blocks = blockedFor(a);
    const out: Record<string, true> = {};
    blocks.forEach(([s, e]) => eachDay(s, e).forEach(d => (out[d] = true)));
    return out;
  }, [blockedFor]);

  const markedFor = useCallback((id: string, a: Articulo) => {
    const r = ranges[id] ?? {};
    const marked: Record<string, any> = {};

    // deshabilitados
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

  // precio
  const priceOk = (n?: number | null) => typeof n === 'number' && n > 0;
  const estimate = useCallback((a: Articulo) => {
    const r = ranges[a.id];
    if (!r?.start || !r?.end) return null;

    const ms = +new Date(r.end) - +new Date(r.start);
    if (ms <= 0) return null;

    const days  = Math.ceil(ms / (24 * 3600 * 1000));
    const hours = Math.ceil(ms / (3600 * 1000));

    let total = 0;
    let breakdown = '';

    if (days >= 7 && priceOk(a.precioPorSemana)) {
      const weeks = Math.floor(days / 7);
      total += weeks * (a.precioPorSemana as number);
      const restDays = days - weeks * 7;
      if (restDays > 0) {
        if (priceOk(a.precioPorDia)) total += restDays * (a.precioPorDia as number);
        else if (priceOk(a.precioPorHora)) total += restDays * 24 * (a.precioPorHora as number);
      }
      breakdown = `${weeks}sem × ${a.precioPorSemana}€` + (restDays > 0 && priceOk(a.precioPorDia) ? ` + ${restDays}d × ${a.precioPorDia}€` : '');
    } else if (days >= 1 && priceOk(a.precioPorDia)) {
      total = days * (a.precioPorDia as number);
      breakdown = `${days}d × ${a.precioPorDia}€`;
    } else if (priceOk(a.precioPorHora)) {
      total = hours * (a.precioPorHora as number);
      breakdown = `${hours}h × ${a.precioPorHora}€`;
    } else {
      breakdown = '—';
    }
    return { total, breakdown };
  }, [ranges]);

  // quitar del carrito
  const removeFromCart = useCallback((id: string) => {
    remove(id);
    setExpanded(prev => { const n = new Set(prev); n.delete(id); return n; });
    setRanges(prev => { const { [id]: _, ...rest } = prev; return rest; });
    setMonthByItem(prev => { const { [id]: _, ...rest } = prev; return rest; });
  }, [remove]);

  // mes actual por ítem (para que no salte de mes al seleccionar)
  const today = useMemo(() => toStr(new Date()), []);
  const monthFor = useCallback((a: Articulo) => {
    const saved = monthByItem[a.id];
    if (saved) return saved;
    const r = ranges[a.id];
    if (r?.start) return r.start.slice(0, 7) + '-01';
    return today.slice(0, 7) + '-01';
  }, [monthByItem, ranges, today]);
  const onMonthChange = useCallback((id: string, m: { year: number; month: number }) => {
    setMonthByItem(prev => ({ ...prev, [id]: startOfMonthStr(m.year, m.month) }));
  }, []);

  const hasCompleteRange = useCallback((id: string) => {
    const r = ranges[id]; return !!(r?.start && r?.end);
  }, [ranges]);

  const getRange = useCallback((id: string) => ranges[id], [ranges]);

  // ---- CREAR ALQUILER (lo importante que faltaba)
  const requestRent = useCallback(async (a: Articulo) => {
    if (!userId) throw new Error('Debes iniciar sesión');
    const r = ranges[a.id];
    if (!r?.start || !r?.end) throw new Error('Selecciona un rango válido');

    setRentingId(a.id);
    try {
      const alq = await rentUC.execute({
        articulo: a,
        userId,
        startISO: r.start,
        endISO: r.end,
      });

      // Actualiza en memoria el artículo con el nuevo alquiler
      setItems(prev =>
        prev.map(it => it.id === a.id
          ? { ...it, alquileres: [...(it.alquileres ?? []), alq] }
          : it
        )
      );

      // Limpia selección y, si quieres, cierra/retira del carrito:
      setRange(a.id, {});

      return alq;
    } finally {
      setRentingId(null);
    }
  }, [userId, rentUC, ranges, setRange /*, toggleExpand, removeFromCart */]);

  return {
    items, loading, error, reload: load,

    isExpanded, toggleExpand,

    ranges, setRange, onPick, markedFor, today,
    monthFor, onMonthChange,

    estimate,
    removeFromCart, toggleCart: toggle,

    hasCompleteRange, getRange,
    requestRent,          
    rentingId,             // <- para deshabilitar botón “Alquilar”
  };
}