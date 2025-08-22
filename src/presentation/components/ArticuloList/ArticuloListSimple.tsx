import React, { memo } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleProp, ViewStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { Articulo } from '../../../domain/entities/Articulo';
import ArticuloThumb from './components/ArticuloThumb';
import { articuloListStyles as styles } from './styles/ArticuloList.styles';

type Props = {
  items: Articulo[];
  loading: boolean;
  error: string | null;
  reload: () => void;
  /** 👇 estilos externos opcionales */
  extraContentStyle?: StyleProp<ViewStyle>;
  rowWrapperStyle?: StyleProp<ViewStyle>;
};

function ArticuloListSimpleCmp({
  items, loading, error, reload,
  extraContentStyle, rowWrapperStyle,
}: Props) {
  const nav = useNavigation<any>();

  const goToDetail = (a: Articulo) => {
    nav.navigate('ArticuloDetail' as never, { articulo: a } as never);
  };

  if (loading && items.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={it => it.id}
      contentContainerStyle={[styles.content, extraContentStyle]}
      onRefresh={reload}
      refreshing={loading}
      renderItem={({ item }) => (
        <View style={rowWrapperStyle}>
          <TouchableOpacity style={styles.row} activeOpacity={0.9} onPress={() => goToDetail(item)}>
            <View style={styles.rowTop}>
              <ArticuloThumb articulo={item} size={64} />
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle}>{item.nombre}</Text>
                <Text style={styles.rowSub}>{item.marca ?? 'Sin marca'}</Text>
                <Text style={styles.rowSub}>
                  {item.precioPorHora}€/h · {item.precioPorDia}€/día · {item.precioPorSemana}€/sem
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Aún no has publicado artículos</Text>
        </View>
      }
    />
  );
}

export default memo(ArticuloListSimpleCmp);