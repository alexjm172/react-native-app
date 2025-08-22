import React, { useLayoutEffect, useMemo, useState, useCallback } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity, Alert, Modal,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import { Ionicons } from '@react-native-vector-icons/ionicons';

import type { Articulo } from '../../../domain/entities/Articulo';
import { Categoria } from '../../../domain/entities/enums/Categoria';
import { Estado } from '../../../domain/entities/enums/Estado';

import { ArticuloRepositoryImpl } from '../../../data/repositories/ArticuloRepositoryImpl';
import { StorageRepositoryImpl } from '../../../data/repositories/StorageRepositoryImpl';
import { UpdateArticuloWithImagesUseCase } from '../../../domain/usecases/UpdateArticuloWithImagesUseCase';

import { useArticuloEditVM } from '../../viewmodels/ArticuloEditViewModel';
import { editStyles as styles } from './styles/ArticuloEdit.styles';

type Params = { articulo: Articulo };
type R = RouteProp<Record<'ArticuloEdit', Params>, 'ArticuloEdit'>;

const CATEGORIA_OPTIONS: { label: string; value: Categoria }[] = [
  { label: 'Cocina',       value: Categoria.COCINA },
  { label: 'Deporte',      value: Categoria.DEPORTE },
  { label: 'Electricidad', value: Categoria.ELECTRICIDAD },
  { label: 'Electrónica',  value: Categoria.ELECTRONICA },
  { label: 'Jardinería',   value: Categoria.JARDINERIA },
];

const ESTADO_OPTIONS: { label: string; value: Estado }[] = [
  { label: 'Nuevo',     value: Estado.NUEVO },
  { label: 'Usado',     value: Estado.USADO },
  { label: 'Muy usado', value: Estado.MUY_USADO },
];

const Label: React.FC<{children: React.ReactNode}> = ({ children }) =>
  <Text style={styles.label}>{children}</Text>;

export default function ArticuloEditScreen() {
  const { params } = useRoute<R>();
  const base = params?.articulo;
  const nav = useNavigation<any>();

  // DI
  const articuloRepo = useMemo(() => new ArticuloRepositoryImpl(), []);
  const storageRepo  = useMemo(() => new StorageRepositoryImpl(), []);
  const updateUC     = useMemo(
    () => new UpdateArticuloWithImagesUseCase(articuloRepo, storageRepo),
    [articuloRepo, storageRepo]
  );

  const vm = useArticuloEditVM(base, updateUC);

  // pickers compactos en modal
  const [showCat, setShowCat] = useState(false);
  const [showEst, setShowEst] = useState(false);

  // Header: botón Guardar
  useLayoutEffect(() => {
    nav.setOptions({
      title: 'Editar artículo',
      headerRight: () => (
        <TouchableOpacity
          disabled={!vm.canSave || vm.loading}
          onPress={async () => {
            try {
              const saved = await vm.save();
              // Reemplaza el detalle con el artículo actualizado y mantiene la edición disponible
              nav.replace('ArticuloDetail', { articulo: saved, canEdit: true });
            } catch (e: any) {
              Alert.alert('Revisa el formulario', e?.message ?? 'No se pudo guardar');
            }
          }}
          style={{ opacity: vm.canSave && !vm.loading ? 1 : 0.5 }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="checkmark" size={22} color="#007AFF" />
        </TouchableOpacity>
      ),
    });
  }, [nav, vm.canSave, vm.loading, vm.save]);

  if (!base) {
    return <View style={styles.center}><Text>Artículo no disponible</Text></View>;
  }

  // ====== Imagenes
  const pickImages = async () => {
    const res = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 10,
      includeBase64: false,
    });
    if (res.didCancel || !res.assets?.length) return;
    const uris = res.assets.map((a: Asset) => a.uri!).filter(Boolean) as string[];
    vm.addNewLocal(uris);
  };

  // ====== Mapa (callback)
  const handleLocationPicked = useCallback(
    ({ latitude, longitude }: { latitude: number; longitude: number }) => {
      vm.setLatitud(String(latitude));
      vm.setLongitud(String(longitude));
    },
    [vm]
  );

  const openMapPicker = () => {
    const lat = vm.latitud ? Number(vm.latitud) : base.latitud;
    const lng = vm.longitud ? Number(vm.longitud) : base.longitud;
    nav.navigate('PickLocation', {
      initial: { latitude: lat, longitude: lng },
      onConfirm: handleLocationPicked, // callback
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* ===== Imágenes */}
      <View style={styles.imagesHeaderRow}>
        <Label>Imágenes</Label>
        <TouchableOpacity onPress={pickImages} style={styles.addBtn} activeOpacity={0.9}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.addBtnText}>Añadir</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.imagesGrid}>
        {vm.uiImages.length === 0 ? (
          <View style={[styles.imageBox, styles.imagePlaceholder]}>
            <Text style={styles.placeholderText}>Sin imágenes</Text>
          </View>
        ) : (
          vm.uiImages.map((img) => (
            <View key={img.uri} style={[styles.imageBox, img.removed && styles.imageRemoved]}>
              <View style={styles.image}>
                <ImageShim uri={img.uri} />
              </View>

              {/* Eliminar/restaurar */}
              <TouchableOpacity
                style={styles.imageAction}
                onPress={() => {
                  if (img.remote) vm.toggleRemoveExisting(img.uri);
                  else vm.removeNewLocal(img.uri);
                }}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Ionicons name={img.removed ? 'arrow-undo' : 'trash'} size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {/* ===== Nombre */}
      <Label>Nombre</Label>
      <TextInput
        style={styles.input}
        value={vm.nombre}
        onChangeText={vm.setNombre}
        placeholder="Nombre del artículo"
      />
      {vm.errors.nombre && <Text style={styles.error}>{vm.errors.nombre}</Text>}

      {/* ===== Marca */}
      <Label>Marca</Label>
      <TextInput
        style={styles.input}
        value={vm.marca}
        onChangeText={vm.setMarca}
        placeholder="Marca"
      />

      {/* ===== Categoría (selector compacto) */}
      <Label>Categoría</Label>
      <TouchableOpacity style={styles.compactPicker} onPress={() => setShowCat(true)} activeOpacity={0.8}>
        <Text style={styles.compactValue}>
          {CATEGORIA_OPTIONS.find(o => o.value === vm.categoria)?.label ?? 'Selecciona'}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#0F172A" />
      </TouchableOpacity>
      {vm.errors.categoria && <Text style={styles.error}>{vm.errors.categoria}</Text>}

      {/* ===== Estado (selector compacto) */}
      <Label>Estado</Label>
      <TouchableOpacity style={styles.compactPicker} onPress={() => setShowEst(true)} activeOpacity={0.8}>
        <Text style={styles.compactValue}>
          {ESTADO_OPTIONS.find(o => o.value === vm.estado)?.label ?? 'Selecciona'}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#0F172A" />
      </TouchableOpacity>
      {vm.errors.estado && <Text style={styles.error}>{vm.errors.estado}</Text>}

      {/* ===== Precios */}
      <Label>Precio / día</Label>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={vm.precioDia}
        onChangeText={vm.setPrecioDia}
        placeholder="0"
      />

      <Label>Precio / hora</Label>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={vm.precioHora}
        onChangeText={vm.setPrecioHora}
        placeholder="0"
      />

      <Label>Precio / semana</Label>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={vm.precioSemana}
        onChangeText={vm.setPrecioSemana}
        placeholder="0"
      />
      {vm.errors.precios && <Text style={styles.error}>{vm.errors.precios}</Text>}

    
      <View style={{ height: 8 }} />

      <TouchableOpacity onPress={openMapPicker} style={styles.addBtn} activeOpacity={0.9}>
        <Ionicons name="map-outline" size={16} color="#fff" />
        <Text style={styles.addBtnText}>Cambiar en mapa Ubicacion</Text>
      </TouchableOpacity>

      {/* ===== Modals de pickers compactos */}
      <Modal visible={showCat} transparent animationType="fade" onRequestClose={() => setShowCat(false)}>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Selecciona categoría</Text>
            <View style={styles.pickerWrap}>
              <Picker selectedValue={vm.categoria} onValueChange={(v) => vm.setCategoria(v as Categoria)}>
                {CATEGORIA_OPTIONS.map(opt => (
                  <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
                ))}
              </Picker>
            </View>
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowCat(false)}>
              <Text style={styles.modalCloseTxt}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showEst} transparent animationType="fade" onRequestClose={() => setShowEst(false)}>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Selecciona estado</Text>
            <View style={styles.pickerWrap}>
              <Picker selectedValue={vm.estado} onValueChange={(v) => vm.setEstado(v as Estado)}>
                {ESTADO_OPTIONS.map(opt => (
                  <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
                ))}
              </Picker>
            </View>
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowEst(false)}>
              <Text style={styles.modalCloseTxt}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

/** Pequeño shim para mostrar imágenes por uri */
import { Image } from 'react-native';
const ImageShim: React.FC<{ uri: string }> = ({ uri }) => (
  <Image source={{ uri }} style={{ width: '100%', height: '100%', borderRadius: 12 }} resizeMode="cover" />
);