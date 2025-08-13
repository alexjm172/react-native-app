import React, { useMemo } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Articulo } from '../../domain/entities/Articulo';
import { ArticuloRepositoryImpl } from '../../data/repositories/ArticuloRepositoryImpl';
import { GetArticulosByCategoria } from '../../domain/usecases/GetArticulosByCategoria';
import { useCategoriaVM } from '../viewmodels/CategoriViewModel';

type Props = {
  /** Si usas React Navigation, puedes omitirla y pasarla como route.params.categoria */
  categoria?: string;
  onPressItem?: (a: Articulo) => void;
};

export default function CategoriaScreen(props: Props) {
  const route = useRoute<any>();
  // Prioridad: prop directa -> route.params.categoria
  const categoriaParam: string | undefined =
    props.categoria ?? route?.params?.categoria;

  const repo = useMemo(() => new ArticuloRepositoryImpl(), []);
  const uc = useMemo(() => new GetArticulosByCategoria(repo), [repo]);

  // Si no llega la categoría, mostramos un error claro y no llamamos al VM
  if (!categoriaParam) {
    return (
        <View style={{ padding: 16 }}>
        <Text>Falta la categoría.</Text>
        <Text>Navega pasando: {'{ categoria: "cocina" }'}</Text>
        </View>
    );
 }

  const { items, loading, error, reload } = useCategoriaVM(uc, categoriaParam);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }
  if (error) {
    return (
      <View style={{ padding: 16 }}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(it) => it.id}
      onRefresh={reload}
      refreshing={loading}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={{ padding: 16, borderBottomWidth: 0.5 }}
          onPress={() => props.onPressItem?.(item)}
        >
          <Text style={{ fontWeight: '600' }}>{item.nombre}</Text>
          <Text>{item.marca}</Text>
          <Text>
            {item.precioPorHora}€/h · {item.precioPorDia}€/día · {item.precioPorSemana}€/sem
          </Text>
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        <View style={{ padding: 16 }}>
          <Text>No hay artículos</Text>
        </View>
      }
    />
  );
}