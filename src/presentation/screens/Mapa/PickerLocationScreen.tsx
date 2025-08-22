import React, { useLayoutEffect, useMemo, useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import MapView, { Marker, MapPressEvent, Region } from 'react-native-maps';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@react-native-vector-icons/ionicons';

type Params = {
  initial: { latitude: number; longitude: number };
  onConfirm?: (pos: { latitude: number; longitude: number }) => void; // 👈 callback
};
type R = RouteProp<Record<'PickLocation', Params>, 'PickLocation'>;

export default function PickLocationScreen() {
  const { params } = useRoute<R>();
  const nav = useNavigation<any>();
  const start = params?.initial;

  const [pos, setPos] = useState(
    start ?? { latitude: 40.4168, longitude: -3.7038 }
  );

  const region = useMemo<Region>(() => ({
    latitude: pos.latitude,
    longitude: pos.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  }), [pos]);

  const onMapPress = (e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setPos({ latitude, longitude });
  };

  useLayoutEffect(() => {
    nav.setOptions({
      title: 'Selecciona ubicación',
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            // devolvemos el resultado
            params?.onConfirm?.({ latitude: pos.latitude, longitude: pos.longitude });
            // y cerramos
            nav.goBack();
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="checkmark" size={22} />
        </TouchableOpacity>
      ),
    });
  }, [nav, params, pos]);

  return (
    <View style={{ flex: 1 }}>
      <MapView style={{ flex: 1 }} initialRegion={region} onPress={onMapPress}>
        <Marker
          coordinate={pos}
          draggable
          onDragEnd={(e) => setPos(e.nativeEvent.coordinate)}
        />
      </MapView>
    </View>
  );
}