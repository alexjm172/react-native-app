import React, { useMemo } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import MapView, { Marker, Region as RNRegion } from 'react-native-maps';
import { useMapaVM } from '../../viewmodels/MapaViewModel';
import { ArticuloRepositoryImpl } from '../../../data/repositories/ArticuloRepositoryImpl';
import { GetArticulosByGeoUseCase } from '../../../domain/usecases/GetArticuloByGeoUseCase';

export default function MapaScreen() {
  const repo = useMemo(() => new ArticuloRepositoryImpl(), []);
  const uc = useMemo(() => new GetArticulosByGeoUseCase(repo), [repo]);
  const { region, items, loading, error, onRegionChangeComplete } = useMapaVM(uc);

  if (!region) {
    return <View style={styles.center}><ActivityIndicator /></View>;
  }
  if (error) {
    return <View style={styles.center}><Text>{error}</Text></View>;
  }

  return (
    <View style={styles.fill}>
      <MapView
        style={StyleSheet.absoluteFillObject}   // ← ocupa todo el contenedor
        initialRegion={region as RNRegion}
        onRegionChangeComplete={(r) => onRegionChangeComplete(r as any)}
      >
        {items.map(it => (
          <Marker
            key={it.id}
            coordinate={{ latitude: it.latitud!, longitude: it.longitud! }}
            title={it.nombre}
            description={it.marca ?? ''}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: 'black' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});