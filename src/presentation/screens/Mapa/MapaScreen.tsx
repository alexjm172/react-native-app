import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  Image,
  Platform,
  Pressable,
} from 'react-native';
import MapView, {
  Marker,
  Callout,
  CalloutSubview,
  Region as RNRegion,
} from 'react-native-maps';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@react-native-vector-icons/ionicons';

import { useMapaVM } from '../../viewmodels/MapaViewModel';
import { ArticuloRepositoryImpl } from '../../../data/repositories/ArticuloRepositoryImpl';
import { GetArticulosByGeoUseCase } from '../../../domain/usecases/GetArticuloByGeoUseCase';
import { ToggleFavoriteUseCase } from '../../../domain/usecases/ToggleFavoritoUseCase';
import { UserRepositoryImpl } from '../../../data/repositories/UserRepositoryImpl';

import type { HomeStackParamList } from '../../../app/navigation/stacks/HomeStack';
import { mapStyles as styles } from './styles/Map.styles';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useCart } from '../../../app/providers/CartProvider';

type RouteProps = RouteProp<HomeStackParamList, 'Mapa'>;

const toRegion = (lat: number, lng: number): RNRegion => ({
  latitude: lat,
  longitude: lng,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
});

type MarkerRef = React.ComponentRef<typeof Marker>;

export default function MapaScreen() {
  const route = useRoute<RouteProps>();
  const focus = route.params?.focus;

  // Casos de uso
  const artRepo = useMemo(() => new ArticuloRepositoryImpl(), []);
  const geoUC = useMemo(() => new GetArticulosByGeoUseCase(artRepo), [artRepo]);

  const userRepo = useMemo(() => new UserRepositoryImpl(), []);
  const toggleUC = useMemo(() => new ToggleFavoriteUseCase(userRepo), [userRepo]);

  // Auth + patchUser para sincronizar favoritos al instante
  const { user, patchUser } = useAuth();
  const currentUid = user?.id ?? undefined;

  // VM del mapa
  const {
    region,
    items,
    loading,
    error,
    onRegionChangeComplete,
    favorites,
    onToggleFavorite,
  } = useMapaVM(geoUC, currentUid, toggleUC, patchUser, user?.favoritos);

  // Carrito
  const { has: cartHas, toggle: cartToggle } = useCart();

  // Refs de mapa y markers
  const mapRef = useRef<MapView | null>(null);
  const markerRefs = useRef<Record<string, MarkerRef | null>>({});
  const isIOS = Platform.OS === 'ios';

  // ANDROID: id del marker seleccionado para mostrar tarjeta flotante
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // iOS: reabrir callout tras una acción que provoca re-render
  const reopenCallout = (id: string) => {
    if (!isIOS) return;
    requestAnimationFrame(() => {
      setTimeout(() => {
        const m = markerRefs.current[id];
        m?.showCallout?.();
      }, 0);
    });
  };

  // Focus → centrar y abrir (iOS) / seleccionar (Android)
  useEffect(() => {
    if (!focus || !region || !mapRef.current) return;

    mapRef.current.animateToRegion(toRegion(focus.latitude, focus.longitude), 350);

    if (isIOS) {
      setTimeout(() => {
        const m = markerRefs.current[focus.id];
        m?.showCallout?.();
      }, 300);
    } else {
      setSelectedId(focus.id);
    }
  }, [focus, region, items, isIOS]);

  if (!region) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.center}>
        <Text>{error}</Text>
      </View>
    );
  }

  // ANDROID: item seleccionado para la tarjeta flotante
  const selectedItem = !isIOS && selectedId ? items.find(a => a.id === selectedId) : undefined;
  const onCloseOverlay = () => setSelectedId(null);

  return (
    <View style={styles.fill}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={region as RNRegion}
        onRegionChangeComplete={(r) => onRegionChangeComplete(r as any)}
        // Evita que la cámara se mueva al tocar un marker en Android (cierra callout/parpadea)
        moveOnMarkerPress={Platform.OS === 'android' ? false : undefined}
      >
        {items.map(it => {
          const lat = (it as any).latitud ?? (it as any).lat;
          const lng = (it as any).longitud ?? (it as any).lng;
          if (typeof lat !== 'number' || typeof lng !== 'number') return null;

          const img =
            Array.isArray(it.imagenes) && it.imagenes.length > 0
              ? it.imagenes[0]
              : undefined;
          const isFav = favorites.has(it.id);
          const inCart = cartHas(it.id);

          return (
            <Marker
              key={`m-${it.categoria}-${it.id}`}
              ref={(ref) => {
                markerRefs.current[it.id] = ref;
              }}
              coordinate={{ latitude: lat, longitude: lng }}
              anchor={{ x: 0.5, y: 1 }}
              calloutAnchor={{ x: 0.5, y: 0 }}
              onPress={() => {
                if (!isIOS) setSelectedId(it.id); // ANDROID: abre overlay
              }}
            >
              {/* iOS: callout con botones táctiles */}
              {isIOS && (
                <Callout tooltip onPress={() => reopenCallout(it.id)}>
                  <View style={styles.callout}>
                    <View style={styles.coTopRow}>
                      <View style={styles.coImgWrap}>
                        {img ? (
                          <Image source={{ uri: img }} style={styles.coImg} />
                        ) : (
                          <View style={styles.coImgPlaceholder}>
                            <Text style={styles.coImgPhTxt}>Sin foto</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.coTexts}>
                        <Text style={styles.coTitle} numberOfLines={1}>
                          {it.nombre}
                        </Text>
                        {!!it.marca && (
                          <Text style={styles.coDesc} numberOfLines={1}>
                            {it.marca}
                          </Text>
                        )}
                      </View>
                    </View>

                    <View style={styles.coButtonsRow}>
                      <CalloutSubview
                        onPress={() => {
                          onToggleFavorite(it.id);
                          reopenCallout(it.id);
                        }}
                        style={styles.coBtn}
                      >
                        <Ionicons
                          name={isFav ? 'heart' : 'heart-outline'}
                          size={18}
                          color="#fff"
                        />
                      </CalloutSubview>

                      <CalloutSubview
                        onPress={() => {
                          cartToggle(it.id);
                          reopenCallout(it.id);
                        }}
                        style={styles.coBtn}
                      >
                        <Ionicons
                          name={inCart ? 'cart' : 'cart-outline'}
                          size={18}
                          color="#fff"
                        />
                      </CalloutSubview>
                    </View>

                    <View style={styles.coArrow} />
                  </View>
                </Callout>
              )}
            </Marker>
          );
        })}
      </MapView>

      {/* ANDROID: tarjeta flotante fuera del mapa */}
      {!isIOS && selectedItem && (
        <View style={styles.overlayWrap}>
          <View style={styles.overlayRow}>
            <View style={styles.overlayImgWrap}>
              {selectedItem.imagenes?.[0] ? (
                <Image
                  source={{ uri: selectedItem.imagenes[0] }}
                  style={styles.overlayImg}
                />
              ) : (
                <View style={styles.overlayImgPh}>
                  <Text style={styles.overlayImgPhTxt}>Sin foto</Text>
                </View>
              )}
            </View>

            <View style={styles.overlayBody}>
              <Text style={styles.overlayTitle} numberOfLines={1}>
                {selectedItem.nombre}
              </Text>
              {!!selectedItem.marca && (
                <Text style={styles.overlaySub} numberOfLines={1}>
                  {selectedItem.marca}
                </Text>
              )}

              <View style={styles.overlayActions}>
                <Pressable
                  style={styles.overlayBtn}
                  onPress={() => {
                    onToggleFavorite(selectedItem.id);
                  }}
                  android_ripple={{ color: 'rgba(255,255,255,0.2)', borderless: true }}
                >
                  <Ionicons
                    name={favorites.has(selectedItem.id) ? 'heart' : 'heart-outline'}
                    size={18}
                    color="#fff"
                  />
                </Pressable>

                <Pressable
                  style={styles.overlayBtn}
                  onPress={() => {
                    cartToggle(selectedItem.id);
                  }}
                  android_ripple={{ color: 'rgba(255,255,255,0.2)', borderless: true }}
                >
                  <Ionicons
                    name={cartHas(selectedItem.id) ? 'cart' : 'cart-outline'}
                    size={18}
                    color="#fff"
                  />
                </Pressable>

                <Pressable
                  style={[styles.overlayBtn, { opacity: 0.9 }]}
                  onPress={onCloseOverlay}
                  android_ripple={{ color: 'rgba(255,255,255,0.2)', borderless: true }}
                >
                  <Ionicons name="close" size={18} color="#fff" />
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}