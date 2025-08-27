import React, { useEffect, useMemo, useRef } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Image } from 'react-native';
import MapView, { Marker, Callout, CalloutSubview, Region as RNRegion } from 'react-native-maps';
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
  latitude: lat, longitude: lng, latitudeDelta: 0.02, longitudeDelta: 0.02,
});

type MarkerRef = React.ComponentRef<typeof Marker>;

export default function MapaScreen() {
  const route = useRoute<RouteProps>();
  const focus = route.params?.focus;

  const artRepo   = useMemo(() => new ArticuloRepositoryImpl(), []);
  const geoUC     = useMemo(() => new GetArticulosByGeoUseCase(artRepo), [artRepo]);

  const userRepo  = useMemo(() => new UserRepositoryImpl(), []);
  const toggleUC  = useMemo(() => new ToggleFavoriteUseCase(userRepo), [userRepo]);

  const { user, patchUser } = useAuth();
  const currentUid = user?.id ?? undefined;

  const {
    region, items, loading, error, onRegionChangeComplete,
    favorites, onToggleFavorite,
  } = useMapaVM(geoUC, currentUid, toggleUC, patchUser, user?.favoritos);

  const { has: cartHas, toggle: cartToggle } = useCart();

  const mapRef = useRef<MapView | null>(null);
  const markerRefs = useRef<Record<string, MarkerRef | null>>({});

  // función util para reabrir el callout tras cambiar estado
  const reopenCallout = (id: string) => {
    // dos ticks por si hay animación de layout
    requestAnimationFrame(() => {
      setTimeout(() => {
        const m = markerRefs.current[id];
        // @ts-ignore: RN Maps tiene showCallout()
        m?.showCallout?.();
      }, 0);
    });
  };

  useEffect(() => {
    if (!focus || !region || !mapRef.current) return;
    mapRef.current.animateToRegion(toRegion(focus.latitude, focus.longitude), 350);
    const tryOpen = () => {
      const m = markerRefs.current[focus.id];
      // @ts-ignore
      if (m?.showCallout) m.showCallout();
      else setTimeout(tryOpen, 120);
    };
    tryOpen();
  }, [focus, region, items]);

  if (!region) return <View style={styles.center}><ActivityIndicator /></View>;
  if (error)     return <View style={styles.center}><Text>{error}</Text></View>;

  return (
    <View style={styles.fill}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={region as RNRegion}
        onRegionChangeComplete={(r) => onRegionChangeComplete(r as any)}
      >
        {items.map(it => {
          const lat = (it as any).latitud ?? (it as any).lat;
          const lng = (it as any).longitud ?? (it as any).lng;
          if (typeof lat !== 'number' || typeof lng !== 'number') return null;

          const img = Array.isArray(it.imagenes) && it.imagenes.length > 0 ? it.imagenes[0] : undefined;
          const isFav  = favorites.has(it.id);
          const inCart = cartHas(it.id);

          return (
            <Marker
              key={`m-${it.categoria}-${it.id}`}
              ref={(ref) => { markerRefs.current[it.id] = ref; }}
              coordinate={{ latitude: lat, longitude: lng }}
              anchor={{ x: 0.5, y: 1 }}
              calloutAnchor={{ x: 0.5, y: 0 }}
              // tracksViewChanges={false} // opcional para performance
            >
              {/* ❌ SIN key dinámica para que no se destruya */}
              <Callout tooltip>
                <View style={styles.callout}>
                  <View style={styles.coTopRow}>
                    <View style={styles.coImgWrap}>
                      {img
                        ? <Image source={{ uri: img }} style={styles.coImg} />
                        : <View style={styles.coImgPlaceholder}><Text style={styles.coImgPhTxt}>Sin foto</Text></View>
                      }
                    </View>
                    <View style={styles.coTexts}>
                      <Text style={styles.coTitle} numberOfLines={1}>{it.nombre}</Text>
                      {!!it.marca && <Text style={styles.coDesc} numberOfLines={1}>{it.marca}</Text>}
                    </View>
                  </View>

                  <View style={styles.coButtonsRow}>
                    <CalloutSubview
                      onPress={() => { onToggleFavorite(it.id); reopenCallout(it.id); }} // ✅ reabrir
                      style={styles.coBtn}
                    >
                      <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={18} color="#fff" />
                    </CalloutSubview>

                    <CalloutSubview
                      onPress={() => { cartToggle(it.id); reopenCallout(it.id); }}       // ✅ reabrir
                      style={styles.coBtn}
                    >
                      <Ionicons name={inCart ? 'cart' : 'cart-outline'} size={18} color="#fff" />
                    </CalloutSubview>
                  </View>

                  <View style={styles.coArrow} />
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>
    </View>
  );
}