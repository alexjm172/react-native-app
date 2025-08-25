import React, { memo } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleProp, ViewStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { Articulo } from '../../../domain/entities/Articulo';
import ArticuloThumb from './components/ArticuloThumb';
import { articuloListStyles as styles } from './styles/ArticuloList.styles';

/* ==== Helpers de fecha ==== */
const toJsDate = (v: any): Date | null => {
  if (!v) return null;
  if (v instanceof Date) return v;
  if (typeof v === 'string' || typeof v === 'number') return new Date(v);
  if (typeof v === 'object' && typeof v.toDate === 'function') {
    try { return v.toDate(); } catch { return null; }
  }
  return null;
};
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
const endOfDay   = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
const fmt = (d: Date) => d.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: '2-digit' }).replace('.', '');

const getActiveRental = (a: Articulo) => {
  if (!Array.isArray(a.alquileres)) return null;
  const now = new Date();
  for (const alq of a.alquileres) {
    const d1 = toJsDate(alq.fechaDesde);
    const d2 = toJsDate(alq.fechaHasta);
    if (!d1 || !d2) continue;
    if (startOfDay(now) <= endOfDay(d2) && endOfDay(now) >= startOfDay(d1)) {
      return { desde: d1, hasta: d2, importe: alq.importe };
    }
  }
  return null;
};

type Props = {
  items: Articulo[];
  loading: boolean;
  error: string | null;
  reload: () => void;
  extraContentStyle?: StyleProp<ViewStyle>;
  rowWrapperStyle?: StyleProp<ViewStyle>;
  canEdit?: boolean;
};

function ArticuloListSimpleCmp({
  items, loading, error, reload,
  extraContentStyle, rowWrapperStyle,
  canEdit = false,
}: Props) {
  const nav = useNavigation<any>();

  const goToDetail = (a: Articulo) => {
    nav.navigate('ArticuloDetail' as never, { articulo: a, canEdit } as never);
  };

  if (loading && items.length === 0) {
    return <View style={styles.center}><ActivityIndicator /></View>;
  }
  if (error) {
    return <View style={styles.center}><Text style={styles.error}>{error}</Text></View>;
  }

  return (
    <FlatList
      data={items}
      keyExtractor={it => it.id}
      contentContainerStyle={[styles.content, extraContentStyle]}
      onRefresh={reload}
      refreshing={loading}
      renderItem={({ item }) => {
        const active = getActiveRental(item);

        return (
          <View style={rowWrapperStyle}>
            <TouchableOpacity style={styles.row} activeOpacity={0.9} onPress={() => goToDetail(item)}>
              <View style={styles.rowTop}>
                <ArticuloThumb articulo={item} size={64} />
                <View style={styles.rowBody}>
                  <Text style={styles.rowTitle}>{item.nombre}</Text>
                  <Text style={styles.rowSub}>{item.marca ?? 'Sin marca'}</Text>
                  <Text style={styles.rowSub}>
                    {item.precioPorHora ?? '—'}€/h · {item.precioPorDia ?? '—'}€/día · {item.precioPorSemana ?? '—'}€/sem
                  </Text>

                  {/* En alquiler ahora mismo */}
                  {active && (
                    <Text style={{ marginTop: 4, color: '#f59e0b', fontWeight: '600' }}>
                      En alquiler: {fmt(active.desde)} — {fmt(active.hasta)}
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          </View>
        );
      }}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Aún no has publicado artículos</Text>
        </View>
      }
    />
  );
}

export default memo(ArticuloListSimpleCmp);