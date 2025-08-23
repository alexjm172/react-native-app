import React, { useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../../app/providers/AuthProvider';
import { ArticuloRepositoryImpl } from '../../../../data/repositories/ArticuloRepositoryImpl';
import { GetArticulosByIds } from '../../../../domain/usecases/GetArticulosByIdsUseCase';
import { useObtenidosVM, type CompraRef } from '../../../viewmodels/ObtenidosViewModel';
import ArticuloListCompras from '../../../components/ArticuloList/ArticuloListCompras';
import { favoritosStyles as page } from '../destinations/styles/Favoritos.styles';

function tsToDate(v: any): Date | undefined {
  if (!v) return undefined;
  if (v instanceof Date) return v;
  if (typeof v?.toDate === 'function') return v.toDate(); // Firestore Timestamp
  const n = Date.parse(v);
  return Number.isFinite(n) ? new Date(n) : undefined;
}

function normalizeCompras(input: unknown): CompraRef[] {
  if (!Array.isArray(input)) return [];
  const out: CompraRef[] = [];
  for (const it of input) {
    if (typeof it === 'string') {
      out.push({ articuloId: it });
      continue;
    }
    if (it && typeof it === 'object') {
      const o = it as Record<string, any>;
      const articuloId =
        o.articuloId ?? o.idArticulo ?? o.itemId ?? o.id ?? o.articulo ?? '';
      if (!articuloId) continue;

      out.push({
        articuloId: String(articuloId),
        desde: tsToDate(o.fechaDesde ?? o.desde ?? o.start ?? o.inicio),
        hasta: tsToDate(o.fechaHasta ?? o.hasta ?? o.end ?? o.fin),
        importe:
          typeof o.importe === 'number'
            ? o.importe
            : Number.isFinite(+o.importe)
            ? +o.importe
            : undefined,
      });
    }
  }
  // dedup por articuloId (último gana)
  const map = new Map<string, CompraRef>();
  for (const r of out) map.set(r.articuloId, r);
  return [...map.values()];
}

export default function ObtenidosScreen() {
  const { user } = useAuth();
  const uid = user?.id;

  // 👇 memo para que no cambie en cada render
  const comprasRefs = useMemo(
    () => normalizeCompras((user as any)?.compras),
    [user?.compras]
  );

  if (__DEV__) {
    console.log('[Obtenidos] raw compras:', (user as any)?.compras);
    console.log('[Obtenidos] refs:', comprasRefs);
  }

  const artRepo  = useMemo(() => new ArticuloRepositoryImpl(), []);
  const getByIds = useMemo(() => new GetArticulosByIds(artRepo), [artRepo]);

  const { rows, loading, error, reload } = useObtenidosVM(getByIds, comprasRefs, uid);

  return (
    <SafeAreaView style={page.container}>
      <ArticuloListCompras
        rows={rows}
        loading={loading}
        error={error}
        reload={reload}
        extraContentStyle={page.listContent}
        rowWrapperStyle={{ marginBottom: 12 }}
      />
    </SafeAreaView>
  );
}