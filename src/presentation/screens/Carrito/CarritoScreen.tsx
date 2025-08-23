import React, { useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View, Text, FlatList, TouchableOpacity, Animated, Dimensions, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Calendar, DateData } from 'react-native-calendars';
import type { Articulo } from '../../../domain/entities/Articulo';
import ArticuloThumb from '../../components/ArticuloList/components/ArticuloThumb';
import { articuloListStyles as card } from '../../components/ArticuloList/styles/ArticuloList.styles';
import { carritoStyles as styles } from './styles/Carrito.styles';
import { useCarritoVM } from '../../viewmodels/CarritoViewModel';

const { width: SCREEN_W } = Dimensions.get('window');

export default function CarritoScreen() {
  const vm = useCarritoVM();

  // animaciones por fila
  const anims = useRef(new Map<string, Animated.Value>()).current;
  const ensureAnim = (id: string) => {
    if (!anims.has(id)) anims.set(id, new Animated.Value(0));
    return anims.get(id)!;
  };

  const slideAndRemove = (id: string) => {
    const x = ensureAnim(id);
    Animated.timing(x, { toValue: -SCREEN_W, duration: 250, useNativeDriver: true }).start(() => {
      vm.removeFromCart(id);
      anims.delete(id);
    });
  };

  if (vm.loading && vm.items.length === 0) {
    return <SafeAreaView style={[styles.container, card.center]}><ActivityIndicator /></SafeAreaView>;
  }
  if (vm.error) {
    return <SafeAreaView style={[styles.container, card.center]}><Text style={card.error}>{vm.error}</Text></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <FlatList
        data={vm.items}
        keyExtractor={(it) => it.id}
        contentContainerStyle={[card.content, styles.content]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => {
          const isOpen = vm.isExpanded(item.id);
          const trX = ensureAnim(item.id).interpolate({ inputRange: [-SCREEN_W, 0], outputRange: [-SCREEN_W, 0] });
          const est = vm.estimate(item);

          return (
            <Animated.View style={{ transform: [{ translateX: trX }] }}>
              <View style={card.row}>
                {/* fila superior */}
                <View style={card.rowTop}>
                  <ArticuloThumb articulo={item} size={64} />
                  <View style={card.rowBody}>
                    <Text style={card.rowTitle}>{item.nombre}</Text>
                    <Text style={card.rowSub}>{item.marca ?? 'Sin marca'}</Text>
                    <Text style={card.rowSub}>
                      {item.precioPorHora ?? '—'}€/h · {item.precioPorDia ?? '—'}€/día · {item.precioPorSemana ?? '—'}€/sem
                    </Text>
                  </View>
                </View>

                {/* acciones */}
                <View style={card.actionsRow}>
                  {/* abrir/cerrar calendario */}
                  <TouchableOpacity
                    style={card.actionBtn}
                    onPress={() => vm.toggleExpand(item.id)}
                    activeOpacity={0.85}
                    accessibilityLabel="Elegir fechas"
                  >
                    <Ionicons name={isOpen ? 'chevron-up' : 'add'} size={18} color="#ffffff" />
                  </TouchableOpacity>

                  {/* eliminar del carrito */}
                  <TouchableOpacity
                    style={card.actionBtn}
                    onPress={() => slideAndRemove(item.id)}
                    activeOpacity={0.85}
                    accessibilityLabel="Quitar del carrito"
                  >
                    <Ionicons name="cart-outline" size={18} color="#ffffff" />
                  </TouchableOpacity>
                </View>

                {/* calendario expandible */}
                {isOpen && (
                  <View style={styles.calendarWrap}>
                    <Calendar
                      key={`${item.id}-${vm.ranges[item.id]?.start ?? ''}-${vm.ranges[item.id]?.end ?? ''}`}
                      minDate={vm.today}
                      enableSwipeMonths
                      markingType="period"
                      markedDates={vm.markedFor(item.id, item)}
                      onDayPress={(d: DateData) => vm.onPick(item, d.dateString)}
                      theme={{
                        textDayFontWeight: '500',
                        textMonthFontWeight: '700',
                        textDayHeaderFontWeight: '600',
                      }}
                    />
                    {/* Estimación */}
                    {est && (
                      <View style={styles.estimate}>
                        <Text style={styles.estimateTitle}>Estimación</Text>
                        <Text style={styles.estimateText}>
                          {est.breakdown} = <Text style={styles.estimateStrong}>{est.total.toFixed(2)}€</Text>
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </Animated.View>
          );
        }}
        ListEmptyComponent={<View style={card.empty}><Text style={card.emptyText}>Tu carrito está vacío</Text></View>}
      />
    </SafeAreaView>
  );
}