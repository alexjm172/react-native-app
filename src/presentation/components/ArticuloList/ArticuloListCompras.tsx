import React, { memo } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleProp, ViewStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ArticuloThumb from './components/ArticuloThumb';
import { articuloListStyles as styles } from './styles/ArticuloList.styles';
import type { CompraRow } from '../../viewmodels/ObtenidosViewModel';

type Props = {
  rows: CompraRow[];
  loading: boolean;
  error: string | null;
  reload: () => void;
  extraContentStyle?: StyleProp<ViewStyle>;
  rowWrapperStyle?: StyleProp<ViewStyle>;
};

const fmt = (d?: Date) =>
  d ? new Date(d).toLocaleDateString() : '—';

function ArticuloListComprasCmp({
  rows, loading, error, reload,
  extraContentStyle, rowWrapperStyle,
}: Props) {
  const nav = useNavigation<any>();

  if (loading && rows.length === 0) {
    return <View style={styles.center}><ActivityIndicator /></View>;
  }
  if (error) {
    return <View style={styles.center}><Text style={styles.error}>{error}</Text></View>;
  }

  return (
    <FlatList
      data={rows}
      keyExtractor={(r) => r.articulo.id}
      contentContainerStyle={[styles.content, extraContentStyle]}
      onRefresh={reload}
      refreshing={loading}
      renderItem={({ item }) => {
        const a = item.articulo;
        return (
          <View style={rowWrapperStyle}>
            <TouchableOpacity style={styles.row} activeOpacity={0.9}
              onPress={() => nav.navigate('ArticuloDetail', { articulo: a })}>
              <View style={styles.rowTop}>
                <ArticuloThumb articulo={a} size={64} />
                <View style={styles.rowBody}>
                  <Text style={styles.rowTitle}>{a.nombre}</Text>
                  <Text style={styles.rowSub}>{a.marca ?? 'Sin marca'}</Text>
                  <Text style={styles.rowSub}>
                    {a.precioPorHora}€/h · {a.precioPorDia}€/día · {a.precioPorSemana}€/sem
                  </Text>
                </View>
              </View>

              {/* banda de periodo / importe */}
              <View style={{ marginTop: 8, paddingHorizontal: 12 }}>
                <Text style={styles.rowSub}>
                  {fmt(item.desde)} — {fmt(item.hasta)}
                  {item.importe != null ? ` · ${item.importe}€` : ''}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        );
      }}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Aún no has alquilado artículos</Text>
        </View>
      }
    />
  );
}

export default memo(ArticuloListComprasCmp);