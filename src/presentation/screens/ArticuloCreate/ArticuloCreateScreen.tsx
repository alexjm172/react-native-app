import React, { useLayoutEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import { Ionicons } from '@react-native-vector-icons/ionicons';

import { useAuth } from '../../../app/providers/AuthProvider';
import { ArticuloRepositoryImpl } from '../../../data/repositories/ArticuloRepositoryImpl';
import { StorageRepositoryImpl } from '../../../data/repositories/StorageRepositoryImpl';
import { UserRepositoryImpl } from '../../../data/repositories/UserRepositoryImpl';
import { CreateArticuloWithImagesUseCase } from '../../../domain/usecases/CrearArticuloWithImagesUseCase';
import { useArticuloCreateVM } from '../../viewmodels/ArticuloCreateViewModel';
import { editStyles as styles } from '../ArticuloEdit/styles/ArticuloEdit.styles';
import { Categoria } from '../../../domain/entities/enums/Categoria';
import { Estado } from '../../../domain/entities/enums/Estado';
import MapaPickModal from './components/MapaPickModal';

const CATEGORIA_OPTIONS = [
  { label: 'Cocina',       value: Categoria.COCINA },
  { label: 'Deporte',      value: Categoria.DEPORTE },
  { label: 'Electricidad', value: Categoria.ELECTRICIDAD },
  { label: 'Electrónica',  value: Categoria.ELECTRONICA },
  { label: 'Jardinería',   value: Categoria.JARDINERIA },
];
const ESTADO_OPTIONS = [
  { label: 'Nuevo', value: Estado.NUEVO },
  { label: 'Usado', value: Estado.USADO },
  { label: 'Muy usado', value: Estado.MUY_USADO },
];

const Label = ({ children }: {children: React.ReactNode}) => <Text style={styles.label}>{children}</Text>;

export default function ArticuloCreateScreen() {
  const nav = useNavigation<any>();
  const { user } = useAuth();
  const uid = user?.id!;
  // DI
  const articuloRepo = useMemo(() => new ArticuloRepositoryImpl(), []);
  const storageRepo  = useMemo(() => new StorageRepositoryImpl(), []);
  const userRepo     = useMemo(() => new UserRepositoryImpl(), []);
  const createUC     = useMemo(() => new CreateArticuloWithImagesUseCase(articuloRepo, storageRepo, userRepo), [articuloRepo, storageRepo, userRepo]);

  const vm = useArticuloCreateVM(uid, createUC);

  // pickers compactos
  const [catOpen, setCatOpen] = useState(false);
  const [estOpen, setEstOpen] = useState(false);

  // header
  useLayoutEffect(() => {
    nav.setOptions({
      title: 'Nuevo artículo',
      headerRight: () => (
        <TouchableOpacity
          disabled={!vm.canSave || vm.loading}
          onPress={async () => {
            try {
              const created = await vm.save();
              const { DeviceEventEmitter } = require('react-native');
              DeviceEventEmitter.emit('articulo:updated');
              nav.replace('ArticuloDetail', { articulo: created, canEdit: true });
            } catch (e: any) {
              Alert.alert('Revisa el formulario', e?.message ?? 'No se pudo crear el artículo');
            }
          }}
          style={{ opacity: vm.canSave && !vm.loading ? 1 : 0.5 }}
        >
          <Ionicons name="checkmark" size={22} color="#007AFF" />
        </TouchableOpacity>
      ),
    });
  }, [nav, vm.canSave, vm.loading, vm.save]);

  // imágenes
  const pickImages = async () => {
    const res = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 10 });
    if (res.didCancel || !res.assets?.length) return;
    vm.addNewLocal(res.assets.map((a: Asset) => a.uri!).filter(Boolean) as string[]);
  };

  // mapa
  const [pickVisible, setPickVisible] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Imágenes */}
      <View style={styles.imagesHeaderRow}>
        <Label>Imágenes</Label>
        <TouchableOpacity onPress={pickImages} style={styles.addBtn} activeOpacity={0.9}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.addBtnText}>Añadir</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.imagesGrid}>
        {vm.newLocalUris.length === 0 ? (
          <View style={[styles.imageBox, styles.imagePlaceholder]}>
            <Text style={styles.placeholderText}>Sin imágenes</Text>
          </View>
        ) : (
          vm.newLocalUris.map(u => (
            <View key={u} style={styles.imageBox}>
              <ImageShim uri={u} />
              <TouchableOpacity style={styles.imageAction} onPress={() => vm.removeNewLocal(u)}>
                <Ionicons name="trash" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {/* Nombre */}
      <Label>Nombre</Label>
      <TextInput style={styles.input} value={vm.nombre} onChangeText={vm.setNombre} placeholder="Nombre del artículo" />
      {vm.errors.nombre && <Text style={styles.error}>{vm.errors.nombre}</Text>}

      {/* Marca */}
      <Label>Marca</Label>
      <TextInput style={styles.input} value={vm.marca} onChangeText={vm.setMarca} placeholder="Marca" />

      {/* Categoría */}
      <Label>Categoría</Label>
      <TouchableOpacity style={styles.compactPicker} onPress={() => setCatOpen(true)} activeOpacity={0.8}>
        <Text style={styles.compactValue}>
          {CATEGORIA_OPTIONS.find(o => o.value === vm.categoria)?.label ?? 'Selecciona'}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#0F172A" />
      </TouchableOpacity>

      {/* Estado */}
      <Label>Estado</Label>
      <TouchableOpacity style={styles.compactPicker} onPress={() => setEstOpen(true)} activeOpacity={0.8}>
        <Text style={styles.compactValue}>
          {ESTADO_OPTIONS.find(o => o.value === vm.estado)?.label ?? 'Selecciona'}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#0F172A" />
      </TouchableOpacity>

      {/* Precios */}
      <Label>Precio / día</Label>
      <TextInput style={styles.input} keyboardType="numeric" value={vm.precioDia} onChangeText={vm.setPrecioDia} placeholder="0" />

      <Label>Precio / hora</Label>
      <TextInput style={styles.input} keyboardType="numeric" value={vm.precioHora} onChangeText={vm.setPrecioHora} placeholder="0" />

      <Label>Precio / semana</Label>
      <TextInput style={styles.input} keyboardType="numeric" value={vm.precioSemana} onChangeText={vm.setPrecioSemana} placeholder="0" />
      {vm.errors.precios && <Text style={styles.error}>{vm.errors.precios}</Text>}

      {/* Ubicación */}
      <Label>Ubicación</Label>
      <TouchableOpacity style={styles.mapPickBtn} onPress={() => setPickVisible(true)} activeOpacity={0.9}>
        <Ionicons name="map-outline" size={18} color="#fff" />
        <Text style={styles.mapPickBtnText}>
          {vm.latitud && vm.longitud ? `${vm.latitud}, ${vm.longitud}` : 'Seleccionar en mapa'}
        </Text>
      </TouchableOpacity>
      {vm.errors.ubicacion && <Text style={styles.error}>{vm.errors.ubicacion}</Text>}

      <View style={{ height: 24 }} />

      {/* Modales (categoría/estado) */}
      <SimplePicker
        visible={catOpen} onClose={() => setCatOpen(false)}
        options={CATEGORIA_OPTIONS} value={vm.categoria} onChange={vm.setCategoria}
        title="Selecciona categoría"
      />
      <SimplePicker
        visible={estOpen} onClose={() => setEstOpen(false)}
        options={ESTADO_OPTIONS} value={vm.estado} onChange={vm.setEstado}
        title="Selecciona estado"
      />

      {/* Mapa para elegir lat/lng */}
      <Modal visible={pickVisible} transparent animationType="slide" onRequestClose={() => setPickVisible(false)}>
        <MapaPickModal
          initial={{ lat: Number(vm.latitud) || undefined, lng: Number(vm.longitud) || undefined }}
          onCancel={() => setPickVisible(false)}
          onConfirm={(c: { latitude: number; longitude: number }) => {
            vm.setLatitud(String(c.latitude));
            vm.setLongitud(String(c.longitude));
            setPickVisible(false);
          }}
        />
      </Modal>
    </ScrollView>
  );
}

/** Auxiliares UI */
import { Image } from 'react-native';
const ImageShim = ({ uri }: { uri: string }) =>
  <Image source={{ uri }} style={{ width: '100%', height: '100%', borderRadius: 12 }} resizeMode="cover" />;

import { Picker } from '@react-native-picker/picker';
function SimplePicker<T extends string | number>({
  visible, onClose, options, value, onChange, title,
}: {
  visible: boolean; onClose: () => void;
  options: {label:string; value:T}[];
  value: T; onChange: (v:T)=>void; title: string;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBg}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{title}</Text>
          <View style={styles.pickerWrap}>
            <Picker selectedValue={value} onValueChange={(v) => onChange(v as T)}>
              {options.map(o => <Picker.Item key={`${o.value}`} label={o.label} value={o.value} />)}
            </Picker>
          </View>
          <TouchableOpacity style={styles.modalClose} onPress={onClose}>
            <Text style={styles.modalCloseTxt}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}