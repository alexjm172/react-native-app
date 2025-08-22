import React from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, Modal, ScrollView, Dimensions } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import type { Articulo } from '../../../domain/entities/Articulo';
import { detailStyles as styles } from './styles/ArticuloDetail.style';
import { ArticuloDetailViewModel } from '../../viewmodels/ArticuloDetailViewModel';

type Params = { articulo: Articulo };
type DetailRoute = RouteProp<Record<'ArticuloDetail', Params>, 'ArticuloDetail'>;

const { width } = Dimensions.get('window');

const Chip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={styles.chip}><Text style={styles.chipText}>{children}</Text></View>
);

const Row: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <View style={styles.rowValueWrap}>
      {typeof value === 'string' || typeof value === 'number'
        ? <Text style={styles.rowValue}>{value}</Text>
        : value}
    </View>
  </View>
);

export default function ArticuloDetailScreen() {
  const { params } = useRoute<DetailRoute>();
  const articulo = params?.articulo;
  const nav = useNavigation<any>();

  const {
    images, hasImages,
    fullVisible, fullIndex, openFull, closeFull, setFullIndex,
    avgRating, ratingCount,
    categoriaLabel, estadoLabel,
    precios, // {hora?, dia?, semana?}
    hasLocation,
    isIOS,
  } = ArticuloDetailViewModel(articulo);

  if (!articulo) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.placeholderText}>Artículo no disponible</Text>
      </View>
    );
  }

  const goToMap = () => {
    if (!hasLocation) return;
    const params = {
      focus: { id: articulo.id, latitude: articulo.latitud, longitude: articulo.longitud },
    };
    nav.navigate('Mapa', params);
  };

  return (
    <View style={styles.container}>
      {/* Carrusel de imágenes */}
      <FlatList
        data={hasImages ? images : [undefined]}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <TouchableOpacity activeOpacity={0.9} onPress={() => hasImages && openFull(index)}>
            {item ? (
              <Image source={{ uri: item }} style={styles.hero} />
            ) : (
              <View style={[styles.hero, styles.placeholder]}>
                <Text style={styles.placeholderText}>Sin imágenes</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      />

      {/* Contenido */}
      <View style={styles.content}>
        <Text style={styles.title}>{articulo.nombre}</Text>
        {!!articulo.marca && <Text style={styles.subtitle}>{articulo.marca}</Text>}

        {/* Valoraciones */}
        <View style={styles.ratingRow}>
          {Array.from({ length: 5 }).map((_, i) => {
            const filled = i + 1 <= Math.floor(avgRating);
            const half = !filled && i < avgRating;
            return (
              <Ionicons
                key={i}
                name={filled ? 'star' : half ? 'star-half' : 'star-outline'}
                size={18}
                color="#f59e0b"
                style={{ marginRight: 2 }}
              />
            );
          })}
          <Text style={styles.ratingText}>
            {ratingCount > 0 ? `${avgRating.toFixed(1)} (${ratingCount})` : 'Sin valoraciones'}
          </Text>
        </View>

        {/* Precios */}
        <View style={styles.chipsRow}>
          {precios.hora != null && <Chip>{precios.hora}€/h</Chip>}
          {precios.dia  != null && <Chip>{precios.dia}€/día</Chip>}
          {precios.semana != null && <Chip>{precios.semana}€/sem</Chip>}
        </View>

        {/* Ficha técnica */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Ficha</Text>
          <Row label="Categoría" value={categoriaLabel} />
          <Row label="Estado" value={estadoLabel} />
        </View>

        {/* Ubicación */}
        {hasLocation && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Ubicación</Text>
            <Row label="Latitud" value={articulo.latitud} />
            <Row label="Longitud" value={articulo.longitud} />
            <TouchableOpacity onPress={goToMap} activeOpacity={0.9} style={styles.mapBtn}>
              <Ionicons name="map-outline" size={18} color="#fff" />
              <Text style={styles.mapBtnText}>Ver en mapa</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Descripción (si existiera en tus docs) */}
        {(articulo as any).descripcion && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.descText}>{(articulo as any).descripcion}</Text>
          </View>
        )}

        {/* Alquileres (resumen)
        {Array.isArray(articulo.alquileres) && articulo.alquileres.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Alquileres</Text>
            <Text style={styles.noteText}>Total: {articulo.alquileres.length}</Text>
            {/* Render liviano de cada alquiler (sin conocer el shape exacto) }
            {articulo.alquileres.slice(0, 3).map((alq: any, i: number) => (
              <View key={i} style={styles.alqRow}>
                <Text style={styles.alqMono} numberOfLines={1}>
                  {JSON.stringify(alq)}
                </Text>
              </View>
            ))}
            {articulo.alquileres.length > 3 && (
              <Text style={styles.noteText}>… y {articulo.alquileres.length - 3} más</Text>
            )}
          </View>
        )}  
        */}
      </View>

      {/* Fullscreen viewer */}
      <Modal visible={fullVisible} transparent animationType="fade" onRequestClose={closeFull}>
        <View style={styles.modalBg}>
          <FlatList
            data={images}
            keyExtractor={(_, i) => String(i)}
            horizontal
            pagingEnabled
            initialScrollIndex={fullIndex}
            onMomentumScrollEnd={(e) => {
              const i = Math.round(e.nativeEvent.contentOffset.x / width);
              setFullIndex(i);
            }}
            getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
            renderItem={({ item }) => (
              <View style={{ width, height: '100%' }}>
                {isIOS ? (
                  <ScrollView
                    style={{ flex: 1 }}
                    maximumZoomScale={3}
                    minimumZoomScale={1}
                    contentContainerStyle={styles.zoomCenter}
                  >
                    <Image source={{ uri: item }} style={styles.fullImg} resizeMode="contain" />
                  </ScrollView>
                ) : (
                  <View style={styles.zoomCenter}>
                    <Image source={{ uri: item }} style={styles.fullImg} resizeMode="contain" />
                  </View>
                )}
              </View>
            )}
          />
          <TouchableOpacity style={styles.closeBtn} onPress={closeFull} activeOpacity={0.9}>
            <Text style={styles.closeTxt}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}