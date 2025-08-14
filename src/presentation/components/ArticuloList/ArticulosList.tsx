import React from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import type { Articulo } from '../../../domain/entities/Articulo';
import { articuloListStyles as styles } from './styles/ArticuloList.styles';

type Props = {
  items: Articulo[];
  loading: boolean;
  error: string | null;
  reload: () => void;
  onPressItem?: (a: Articulo) => void;
};

export default function ArticuloList({ items, loading, error, reload, onPressItem }: Props) {
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
      keyExtractor={(it) => it.id}
      contentContainerStyle={styles.content}
      onRefresh={reload}
      refreshing={loading}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.row} onPress={() => onPressItem?.(item)}>
          <Text style={styles.rowTitle}>{item.nombre}</Text>
          <Text style={styles.rowSub}>{item.marca ?? "Sin marca"}</Text>
          <Text style={styles.rowSub}>
            {item.precioPorHora}€/h · {item.precioPorDia}€/día · {item.precioPorSemana}€/sem
          </Text>
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No hay artículos</Text>
        </View>
      }
    />
  );
}