import React, { useRef } from 'react';
import { Animated, Dimensions, View, ActivityIndicator, Text, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { Articulo } from '../../../../domain/entities/Articulo';
import ArticuloThumb from '../../../components/ArticuloList/components/ArticuloThumb';
import { articuloListStyles as cardStyles } from '../../../components/ArticuloList/styles/ArticuloList.styles';
import { favoritosStyles as styles } from './styles/Favoritos.styles';
import { FavoritosScreenViewModel } from '../../../viewmodels/FavoritosScreenViewModel';
import type { ProfileStackParamList } from '../../../../app/navigation/stacks/ProfileStack';

export default function FavoritosScreen() {
  const { items, favorites, loading, error, reload, onToggleFavorite, removeLocal } =
    FavoritosScreenViewModel();

  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();

  // Animación por fila
  const width = Dimensions.get('window').width;
  const anims = useRef(new Map<string, Animated.Value>()).current;
  const getAnim = (id: string) => {
    if (!anims.has(id)) anims.set(id, new Animated.Value(0));
    return anims.get(id)!;
  };

  const handleToggle = async (a: Articulo) => {
    const stillFav = await onToggleFavorite(a.id);
    if (!stillFav) {
      const x = getAnim(a.id);
      Animated.timing(x, { toValue: -width, duration: 400, useNativeDriver: true }).start(() => {
        removeLocal(a.id);
        anims.delete(a.id);
      });
    }
  };

  const goToMap = (a: Articulo) => {
    const lat = (a as any).latitud ?? (a as any).lat;
    const lng = (a as any).longitud ?? (a as any).lng;
    if (typeof lat !== 'number' || typeof lng !== 'number') return;

    navigation.navigate('Mapa', {
      focus: { id: a.id, latitude: lat, longitude: lng },
    });
  };

  const goToDetail = (a: Articulo) => {
    navigation.navigate('ArticuloDetail', { articulo: a });
  };

  if (loading && items.length === 0) {
    return (
      <View style={[styles.container, cardStyles.center]}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, cardStyles.center]}>
        <Text style={cardStyles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        contentContainerStyle={[cardStyles.content, styles.listContent]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        onRefresh={reload}
        refreshing={loading}
        renderItem={({ item }) => {
          const isFav = favorites.has(item.id);
          const translateX = getAnim(item.id).interpolate({
            inputRange: [-width, 0],
            outputRange: [-width, 0],
          });

          return (
            <Animated.View style={{ transform: [{ translateX }] }}>
              {/* Toca la tarjeta para ir al detalle */}
              <TouchableOpacity
                style={cardStyles.row}
                activeOpacity={0.9}
                onPress={() => goToDetail(item)}
              >
                {/* Arriba: imagen + textos */}
                <View style={cardStyles.rowTop}>
                  <ArticuloThumb articulo={item} size={64} />
                  <View style={cardStyles.rowBody}>
                    <Text style={cardStyles.rowTitle}>{item.nombre}</Text>
                    <Text style={cardStyles.rowSub}>{item.marca ?? 'Sin marca'}</Text>
                    <Text style={cardStyles.rowSub}>
                      {item.precioPorHora}€/h · {item.precioPorDia}€/día · {item.precioPorSemana}€/sem
                    </Text>
                  </View>
                </View>

                {/* Acciones (favorito, carrito, mapa) */}
                <View style={cardStyles.actionsRow}>
                  <TouchableOpacity
                    style={cardStyles.actionBtn}
                    onPress={() => handleToggle(item)}
                    activeOpacity={0.85}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityLabel={isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                  >
                    <Ionicons
                      name={isFav ? 'heart' : 'heart-outline'}
                      size={20}
                      color={isFav ? '#EF4444' : '#FFFFFF'}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={cardStyles.actionBtn}
                    onPress={() => {}}
                    activeOpacity={0.85}
                    accessibilityLabel="Añadir al carrito"
                  >
                    <Ionicons name="cart-outline" size={20} color="#ffffff" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={cardStyles.actionBtn}
                    onPress={() => goToMap(item)}
                    activeOpacity={0.85}
                    accessibilityLabel="Ver en el mapa"
                  >
                    <Ionicons name="location-outline" size={20} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        }}
        ListEmptyComponent={
          <View style={cardStyles.empty}>
            <Text style={cardStyles.emptyText}>No tienes favoritos aún</Text>
          </View>
        }
      />
    </View>
  );
}