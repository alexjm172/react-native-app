import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import MapView, { Marker, Region, MapPressEvent } from 'react-native-maps';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { COLORS } from '../../../../app/theme/colors';

type Props = {
  initial?: { lat?: number; lng?: number };
  onCancel: () => void;
  onConfirm: (coords: { latitude: number; longitude: number }) => void;
};

const FALLBACK = { latitude: 40.4168, longitude: -3.7038 }; // Madrid

export default function MapaPickModal({ initial, onCancel, onConfirm }: Props) {
  const start = useMemo(
    () => ({
      latitude: typeof initial?.lat === 'number' ? initial!.lat! : FALLBACK.latitude,
      longitude: typeof initial?.lng === 'number' ? initial!.lng! : FALLBACK.longitude,
    }),
    [initial]
  );

  const [point, setPoint] = useState<{ latitude: number; longitude: number }>(start);

  const region: Region = {
    ...point,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const onMapPress = (e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setPoint({ latitude, longitude });
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.title}>Selecciona ubicación</Text>

        <MapView
          style={styles.map}
          initialRegion={region}
          onPress={onMapPress}
          // Evitamos "saltar" al mover el pin: controlamos solo el Marker
        >
          <Marker
            coordinate={point}
            draggable
            onDragEnd={(e) => {
              const { latitude, longitude } = e.nativeEvent.coordinate;
              setPoint({ latitude, longitude });
            }}
          />
        </MapView>

        <View style={styles.actions}>
          <TouchableOpacity style={[styles.btn, styles.cancel]} onPress={onCancel} activeOpacity={0.9}>
            <Ionicons name="close" size={16} color="#fff" />
            <Text style={styles.btnTxt}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.confirm]}
            onPress={() => onConfirm(point)}
            activeOpacity={0.9}
          >
            <Ionicons name="checkmark" size={16} color="#fff" />
            <Text style={styles.btnTxt}>Usar esta ubicación</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const W = Dimensions.get('window').width;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)', // slate-900/45
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    width: W - 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 8 },
    }),
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  map: {
    width: '100%',
    height: 320,
    backgroundColor: '#e5e7eb',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 12,
    gap: 10,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  cancel: { backgroundColor: '#94a3b8' }, // slate-400
  confirm: { backgroundColor: COLORS.pantone },
  btnTxt: { color: '#fff', fontWeight: '700' },
});