import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Articulo } from '../../domain/entities/Articulo';
import type { Alquiler } from '../../domain/entities/Alquiler';
import { GetArticulosByIds } from '../../domain/usecases/GetArticulosByIdsUseCase';

export type CompraRef = {
  articuloId: string;
  desde?: Date;
  hasta?: Date;
  importe?: number;
};

export type CompraRow = {
  articulo: Articulo;
  desde?: Date;
  hasta?: Date;
  importe?: number;
};

function tsToDate(v: any): Date | undefined {
  if (!v) return undefined;
  if (v instanceof Date) return v;
  if (typeof v?.toDate === 'function') return v.toDate();
  const n = Date.parse(v);
  return Number.isFinite(n) ? new Date(n) : undefined;
}

export function useObtenidosVM(
  getByIds: GetArticulosByIds,
  compras: CompraRef[],
  uid?: string
) {
  const [rows, setRows] = useState<CompraRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ids únicos y clave estable
  const ids = useMemo(
    () => Array.from(new Set(compras.map(c => c.articuloId))),
    [compras]
  );
  const idsKey = useMemo(() => ids.join('|'), [ids]);
  const refMap = useMemo(
    () => new Map(compras.map(c => [c.articuloId, c])),
    [compras]
  );

  const load = useCallback(async () => {
    if (!ids.length) { setRows([]); return; }
    setLoading(true); setError(null);
    try {
      const arts = await getByIds.execute(ids);
      const built: CompraRow[] = arts.map((a) => {
        const ref = refMap.get(a.id);
        let desde = ref?.desde;
        let hasta = ref?.hasta;
        let importe = ref?.importe;

        if ((!desde || !hasta || importe == null) && Array.isArray(a.alquileres)) {
          const mios = (a.alquileres as Alquiler[]).filter(
            (alq: any) => String(alq.idUsuario ?? alq.uid) === String(uid ?? '')
          );
          // más reciente por fechaHasta
          mios.sort((x, y) => {
            const hx = tsToDate((x as any).fechaHasta)?.getTime() ?? 0;
            const hy = tsToDate((y as any).fechaHasta)?.getTime() ?? 0;
            return hy - hx;
          });
          const pick = mios[0];
          if (pick) {
            desde = desde ?? tsToDate((pick as any).fechaDesde);
            hasta = hasta ?? tsToDate((pick as any).fechaHasta);
            importe = importe ?? (pick as any).importe;
          }
        }

        return { articulo: a, desde, hasta, importe };
      });

      setRows(built);
    } catch (e: any) {
      setError(e?.message ?? 'Error cargando compras');
    } finally {
      setLoading(false);
    }
  }, [idsKey, getByIds, refMap, uid]);

  useEffect(() => { load(); }, [load]);

  return { rows, loading, error, reload: load };
}