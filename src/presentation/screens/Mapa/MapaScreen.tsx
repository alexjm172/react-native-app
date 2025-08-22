import React, { useEffect, useMemo, useRef } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Platform } from 'react-native';
import MapView, { Marker, Callout, Region as RNRegion } from 'react-native-maps';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useMapaVM } from '../../viewmodels/MapaViewModel';
import { ArticuloRepositoryImpl } from '../../../data/repositories/ArticuloRepositoryImpl';
import { GetArticulosByGeoUseCase } from '../../../domain/usecases/GetArticuloByGeoUseCase';
import type { HomeStackParamList } from '../../../app/navigation/stacks/HomeStack';
import { mapStyles as styles } from './styles/Map.styles';

type RouteProps = RouteProp<HomeStackParamList, 'Mapa'>;

const toRegion = (lat: number, lng: number): RNRegion => ({
  latitude: lat,
  longitude: lng,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
});

// 👇 ref TS seguro para Marker
type MarkerRef = React.ComponentRef<typeof Marker>;

export default function MapaScreen() {
  const route = useRoute<RouteProps>();
  const focus = route.params?.focus; // { id, latitude, longitude }

  const repo = useMemo(() => new ArticuloRepositoryImpl(), []);
  const uc = useMemo(() => new GetArticulosByGeoUseCase(repo), [repo]);
  const { region, items, loading, error, onRegionChangeComplete } = useMapaVM(uc);

  const mapRef = useRef<MapView | null>(null);
  const markerRefs = useRef<Record<string, MarkerRef | null>>({});

  // Cuando tengamos región + items y hay focus: centramos y abrimos el callout
  useEffect(() => {
    if (!focus || !region || !mapRef.current) return;

    mapRef.current.animateToRegion(toRegion(focus.latitude, focus.longitude), 350);

    const tryOpen = () => {
      const m = markerRefs.current[focus.id];
      if (m && typeof m.showCallout === 'function') m.showCallout();
      else setTimeout(tryOpen, 120);
    };
    tryOpen();
  }, [focus, region, items]);

  if (!region) return <View style={styles.center}><ActivityIndicator /></View>;
  if (error) return <View style={styles.center}><Text>{error}</Text></View>;

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

          return (
            <Marker
              key={it.id}
              ref={(ref) => { markerRefs.current[it.id] = ref; }}
              coordinate={{ latitude: lat, longitude: lng }}
              anchor={{ x: 0.5, y: 1 }}
              calloutAnchor={{ x: 0.5, y: 0 }}
            >
              <Callout tooltip>
                <View style={styles.callout}>
                  <Text style={styles.coTitle} numberOfLines={1}>{it.nombre}</Text>
                  {!!it.marca && <Text style={styles.coDesc} numberOfLines={1}>{it.marca}</Text>}
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