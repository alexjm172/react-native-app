import React from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import type { Articulo } from '../../../domain/entities/Articulo';
import { articuloListStyles as styles } from './styles/ArticuloList.styles';
import ArticuloThumb from './components/ArticuloThumb';

type Props = {
  items: Articulo[];
  loading: boolean;
  error: string | null;
  reload: () => void;
  onPressItem?: (a: Articulo) => void;
  onPressFavorite?: (a: Articulo) => void;
  onPressAddToCart?: (a: Articulo) => void;
  onPressShowOnMap?: (a: Articulo) => void;
};

export default function ArticuloList({
  items, loading, error, reload, onPressItem,
  onPressFavorite, onPressAddToCart, onPressShowOnMap
}: Props) {
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
        <TouchableOpacity style={styles.row} activeOpacity={0.9} onPress={() => onPressItem?.(item)}>
          {/* Arriba: imagen izquierda + textos derecha */}
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

          {/* Debajo: botones centrados */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => onPressFavorite?.(item)}
              activeOpacity={0.85}
            >
              <Ionicons name="heart-outline" size={20} color="#ffffff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => onPressAddToCart?.(item)}
              activeOpacity={0.85}
            >
              <Ionicons name="cart-outline" size={20} color="#ffffff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => onPressShowOnMap?.(item)}
              activeOpacity={0.85}
            >
              <Ionicons name="location-outline" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
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