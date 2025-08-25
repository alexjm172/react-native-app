import React, { useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Animated,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Calendar } from 'react-native-calendars';

import ArticuloThumb from '../../components/ArticuloList/components/ArticuloThumb';
import { articuloListStyles as card } from '../../components/ArticuloList/styles/ArticuloList.styles';
import { carritoStyles as styles } from './styles/Carrito.styles';
import { useCarritoVM } from '../../viewmodels/CarritoViewModel';
import type { Articulo } from '../../../domain/entities/Articulo';

const { width: SCREEN_W } = Dimensions.get('window');

export default function CarritoScreen() {
  const vm = useCarritoVM();

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

  const confirmRent = (item: Articulo) => {
    const r = vm.getRange(item.id);
    if (!r?.start || !r?.end) return;

    Alert.alert(
      'Confirmar alquiler',
      `¿Quieres alquilar “${item.nombre}” del ${r.start} al ${r.end}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, alquilar',
          style: 'default',
          onPress: async () => {
            try {
              await vm.requestRent(item);
              Alert.alert('¡Hecho!', 'Reserva creada');
            } catch (e: any) {
              Alert.alert('Error', e?.message ?? 'No se pudo crear el alquiler');
            }
          },
        },
      ],
    );
  };

  if (vm.loading && vm.items.length === 0) {
    return (
      <SafeAreaView style={[styles.container, card.center]} edges={['top', 'left', 'right']}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }
  if (vm.error) {
    return (
      <SafeAreaView style={[styles.container, card.center]} edges={['top', 'left', 'right']}>
        <Text style={card.error}>{vm.error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <FlatList
        data={vm.items}
        keyExtractor={it => it.id}
        contentContainerStyle={[card.content, styles.content]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => {
          const isOpen = vm.isExpanded(item.id);
          const trX = ensureAnim(item.id).interpolate({
            inputRange: [-SCREEN_W, 0],
            outputRange: [-SCREEN_W, 0],
          });
          const est = vm.estimate(item);
          const canRent = vm.hasCompleteRange(item.id);

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
                      {item.precioPorHora ?? '—'}€/h · {item.precioPorDia ?? '—'}€/día ·{' '}
                      {item.precioPorSemana ?? '—'}€/sem
                    </Text>
                  </View>
                </View>

                {/* acciones */}
                <View style={card.actionsRow}>
                  <TouchableOpacity
                    style={card.actionBtn}
                    onPress={() => vm.toggleExpand(item.id)}
                    activeOpacity={0.85}
                    accessibilityLabel="Elegir fechas"
                  >
                    <Ionicons name={isOpen ? 'chevron-up' : 'add'} size={18} color="#ffffff" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={card.actionBtn}
                    onPress={() => slideAndRemove(item.id)}
                    activeOpacity={0.85}
                    accessibilityLabel="Quitar del carrito"
                  >
                    <Ionicons name="remove" size={18} color="#ffffff" />
                  </TouchableOpacity>
                </View>

                {/* calendario + estimación + alquilar */}
                {isOpen && (
                  <View style={styles.calendarWrap}>
                    <Calendar
                      // evitar "saltos" al seleccionar en otro mes
                      initialDate={vm.monthFor(item)}
                      minDate={vm.today}
                      enableSwipeMonths
                      markingType="period"
                      markedDates={vm.markedFor(item.id, item)}
                      onDayPress={(d: any) => vm.onPick(item, d.dateString)}
                      onMonthChange={(m: any) => vm.onMonthChange(item.id, m)}
                    />

                    {est && (
                      <View style={styles.estimate}>
                        <Text style={styles.estimateTitle}>Estimación</Text>
                        <Text style={styles.estimateText}>
                          {est.breakdown} ={' '}
                          <Text style={styles.estimateStrong}>{est.total.toFixed(2)}€</Text>
                        </Text>
                      </View>
                    )}

                    {canRent && (
                      <TouchableOpacity
                        style={styles.rentBtn}
                        activeOpacity={0.9}
                        onPress={() => confirmRent(item)}
                      >
                        <Ionicons name="calendar-clear-outline" size={18} color="#fff" />
                        <Text style={styles.rentBtnText}>Alquilar</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            </Animated.View>
          );
        }}
        ListEmptyComponent={
          <View style={card.empty}>
            <Text style={card.emptyText}>Tu carrito está vacío</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}