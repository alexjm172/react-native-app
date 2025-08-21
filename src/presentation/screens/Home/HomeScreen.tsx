import React, { useMemo } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CategoryPicker from '../../components/CategoryPicker/CategoryPicker';
import ArticuloList from '../../components/ArticuloList/ArticulosList';
import FloatingActions from '../../components/FloatingActions/FloatingActions';
import { homeStyles as styles } from './styles/Home.styles';

import { ArticuloRepositoryImpl } from '../../../data/repositories/ArticuloRepositoryImpl';
import { GetArticulosByCategoria } from '../../../domain/usecases/GetArticulosByCategoria';

import { useAuth } from '../../../app/providers/AuthProvider';
import { UserRepositoryImpl } from '../../../data/repositories/UserRepositoryImpl';
import { ToggleFavoriteUseCase } from '../../../domain/usecases/ToggleFavoritoUseCase';

import { useHomeVM } from '../../viewmodels/HomeViewModel';
import type { CategoryId } from '../../viewmodels/types/Category';

export default function HomeScreen() {
  const { user } = useAuth();                   // usuario autenticado
  const currentUid = user?.id;                

  // DI artículos
  const repo = useMemo(() => new ArticuloRepositoryImpl(), []);
  const uc   = useMemo(() => new GetArticulosByCategoria(repo), [repo]);

  // DI favoritos
  const userRepo = useMemo(() => new UserRepositoryImpl(), []);
  const toggleUC = useMemo(() => new ToggleFavoriteUseCase(userRepo), [userRepo]);

  const {
    categories, selectedId, onChangeCategoria,
    items, loading, error, reload,
    fabOpen, toggleFab, closeFab,
    favorites, onToggleFavorite,
  } = useHomeVM(uc, currentUid, toggleUC);

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
          favorites={favorites}
          onToggleFavorite={onToggleFavorite}
          onPressItem={(a) => console.log('Artículo', a.id)}
        />

        <FloatingActions
          open={fabOpen}
          onToggle={toggleFab}
          onAdd={() => { closeFab(); console.log('Añadir artículo'); }}
          onFilter={() => { closeFab(); console.log('Filtrar artículos'); }}
        />
      </View>
    </SafeAreaView>
  );
}