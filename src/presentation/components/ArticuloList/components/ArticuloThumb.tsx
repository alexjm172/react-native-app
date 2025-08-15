import React from 'react';
import { View, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import type { Articulo } from '../../../../domain/entities/Articulo';
import { articuloListStyles as styles } from '../styles/ArticuloList.styles';
import { useStorageUrl } from '../../../hooks/useStorageUrl';

type Props = {
  articulo: Articulo;
  size?: number; // 64 por defecto
};

export default function ArticuloThumb({ articulo, size = 64 }: Props) {
  const firstPath = Array.isArray(articulo.imagenes) ? articulo.imagenes[0] : undefined;
  const { url, loading } = useStorageUrl(firstPath);

  return (
    <View style={[styles.thumbBox, { width: size, height: size, borderRadius: 12 }]}>
      {loading ? (
        <View style={styles.thumbCenter}>
          <ActivityIndicator />
        </View>
      ) : url ? (
        <Image source={{ uri: url }} style={styles.thumbImage} resizeMode="cover" />
      ) : (
        <View style={styles.thumbCenter}>
          <Ionicons name="image-outline" size={28} color="#ffffff" />
        </View>
      )}
    </View>
  );
}