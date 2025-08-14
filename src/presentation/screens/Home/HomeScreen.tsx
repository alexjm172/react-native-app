import React, { useMemo } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CategoryPicker from '../../components/CategoryPicker/CategoryPicker';
import { homeStyles as styles } from './styles/Home.styles';

import { Articulo } from '../../../domain/entities/Articulo';
import { ArticuloRepositoryImpl } from '../../../data/repositories/ArticuloRepositoryImpl';
import { GetArticulosByCategoria } from '../../../domain/usecases/GetArticulosByCategoria';
import { useHomeVM } from '../../viewmodels/HomeViewModel';
import type { CategoryId } from '../../viewmodels/types/Category';

export default function HomeScreen() {
  const repo = useMemo(() => new ArticuloRepositoryImpl(), []);
  const uc = useMemo(() => new GetArticulosByCategoria(repo), [repo]);

  const { categories, selectedId, onChangeCategoria, items, loading, error, reload } = useHomeVM(uc);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <CategoryPicker
          categories={categories}
          selectedId={selectedId}
          onChange={onChangeCategoria as (id: CategoryId) => void}
        />

        {loading && items.length === 0 ? (
          <View style={styles.center}><ActivityIndicator /></View>
        ) : error ? (
          <View style={styles.center}><Text style={styles.error}>{error}</Text></View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(it) => it.id}
            contentContainerStyle={{ paddingBottom: 24 }}
            onRefresh={reload}
            refreshing={loading}
            renderItem={({ item }) => <ArticuloRow item={item} />}
            ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>No hay artículos</Text></View>}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

function ArticuloRow({ item }: { item: Articulo }) {
  return (
    <TouchableOpacity style={styles.row}>
      <Text style={styles.rowTitle}>{item.nombre}</Text>
      <Text style={styles.rowSub}>{item.marca}</Text>
      <Text style={styles.rowSub}>
        {item.precioPorHora}€/h · {item.precioPorDia}€/día · {item.precioPorSemana}€/sem
      </Text>
    </TouchableOpacity>
  );
}