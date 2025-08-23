import React, { memo } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { Articulo } from '../../../domain/entities/Articulo';
import { articuloListStyles as styles } from './styles/ArticuloList.styles';
import ArticuloThumb from './components/ArticuloThumb';
import type { HomeStackParamList } from '../../../app/navigation/stacks/HomeStack';
import { useCart } from '../../../app/providers/CartProvider';

type Props = {
  items: Articulo[];
  loading: boolean;
  error: string | null;
  reload: () => void;
  onPressItem?: (a: Articulo) => void;
  onPressFavorite?: (a: Articulo) => void;
  onPressAddToCart?: (a: Articulo) => void;
  onPressShowOnMap?: (a: Articulo) => void;
  favorites?: Set<string>;
  onToggleFavorite?: (articuloId: string) => void;
};

function ArticuloListCmp({
  items, loading, error, reload, onPressItem,
  onPressFavorite, onPressAddToCart, onPressShowOnMap,
  favorites, onToggleFavorite,
}: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const { has, toggle } = useCart(); // 👈 tu carrito global (array)

  const goToMap = (a: Articulo) => {
    const lat = (a as any).latitud ?? (a as any).lat;
    const lng = (a as any).longitud ?? (a as any).lng;
    if (typeof lat === 'number' && typeof lng === 'number') {
      navigation.navigate('Mapa', {
        focus: { id: a.id, latitude: lat, longitude: lng },
      });
    }
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
      keyExtractor={(it) => it.id}
      contentContainerStyle={styles.content}
      onRefresh={reload}
      refreshing={loading}
      renderItem={({ item }) => {
        const isFav  = favorites?.has(item.id) ?? false;
        const inCart = has(item.id);                // ✅ correcto con tu provider

        const lat = (item as any).latitud ?? (item as any).lat;
        const lng = (item as any).longitud ?? (item as any).lng;
        const canShowOnMap = typeof lat === 'number' && typeof lng === 'number';

        const handleCart = () => {
          if (onPressAddToCart) return onPressAddToCart(item); // override externo
          toggle(item.id);                                     // ✅ toggle global
        };

        return (
          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.9}
            onPress={() => onPressItem?.(item)}
          >
            {/* Arriba: imagen + textos */}
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

            {/* Acciones */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() =>
                  onToggleFavorite ? onToggleFavorite(item.id) : onPressFavorite?.(item)
                }
                activeOpacity={0.85}
                accessibilityLabel={isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
              >
                <Ionicons
                  name={isFav ? 'heart' : 'heart-outline'}
                  size={20}
                  color={isFav ? '#EF4444' : '#ffffff'}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionBtn}
                onPress={handleCart}
                activeOpacity={0.85}
                accessibilityLabel={inCart ? 'Quitar del carrito' : 'Añadir al carrito'}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name={inCart ? 'cart' : 'cart-outline'}
                  size={20}
                  color={inCart ? '#10B981' : '#ffffff'}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, !canShowOnMap && { opacity: 0.5 }]}
                onPress={() =>
                  canShowOnMap
                    ? (onPressShowOnMap ? onPressShowOnMap(item) : goToMap(item))
                    : undefined
                }
                activeOpacity={0.85}
                accessibilityLabel="Ver en el mapa"
                disabled={!canShowOnMap}
              >
                <Ionicons name="location-outline" size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        );
      }}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No hay artículos</Text>
        </View>
      }
    />
  );
}

export default memo(ArticuloListCmp);