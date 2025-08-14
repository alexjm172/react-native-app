import React, { useMemo } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CategoryPicker from '../../components/CategoryPicker/CategoryPicker';
import ArticuloList from '../../components/ArticuloList/ArticulosList';
import { homeStyles as styles } from './styles/Home.styles';

import { ArticuloRepositoryImpl } from '../../../data/repositories/ArticuloRepositoryImpl';
import { GetArticulosByCategoria } from '../../../domain/usecases/GetArticulosByCategoria';
import { useHomeVM } from '../../viewmodels/HomeViewModel';
import type { CategoryId } from '../../viewmodels/types/Category';

export default function HomeScreen() {
  // DI
  const repo = useMemo(() => new ArticuloRepositoryImpl(), []);
  const uc = useMemo(() => new GetArticulosByCategoria(repo), [repo]);

  const {
    categories, selectedId, onChangeCategoria,
    items, loading, error, reload
  } = useHomeVM(uc);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <CategoryPicker
          categories={categories}
          selectedId={selectedId}
          onChange={onChangeCategoria as (id: CategoryId) => void}
        />

        <ArticuloList
          items={items}
          loading={loading}
          error={error}
          reload={reload}
          onPressItem={(a) => {
            // TODO: navegación a detalle
            console.log('Artículo', a.id);
          }}
        />
      </View>
    </SafeAreaView>
  );
}