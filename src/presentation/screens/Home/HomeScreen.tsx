import React, { useMemo, useCallback } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import CategoryPicker from '../../components/CategoryPicker/CategoryPicker';
import ArticuloList from '../../components/ArticuloList/ArticulosList';
import FloatingActions from '../../components/FloatingActions/FloatingActions';
import { homeStyles as styles } from './styles/Home.styles';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../../app/navigation/stacks/HomeStack';

import { ArticuloRepositoryImpl } from '../../../data/repositories/ArticuloRepositoryImpl';
import { GetArticulosByCategoria } from '../../../domain/usecases/GetArticulosByCategoria';

import { useAuth } from '../../../app/providers/AuthProvider';
import { UserRepositoryImpl } from '../../../data/repositories/UserRepositoryImpl';
import { ToggleFavoriteUseCase } from '../../../domain/usecases/ToggleFavoritoUseCase';

import { useHomeVM } from '../../viewmodels/HomeViewModel';
import type { CategoryId } from '../../viewmodels/types/Category';

export default function HomeScreen() {
  const { user } = useAuth();
  const currentUid = user?.id;

  const repo = useMemo(() => new ArticuloRepositoryImpl(), []);
  const uc   = useMemo(() => new GetArticulosByCategoria(repo), [repo]);

  const userRepo = useMemo(() => new UserRepositoryImpl(), []);
  const toggleUC = useMemo(() => new ToggleFavoriteUseCase(userRepo), [userRepo]);
  const navigation  = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const {
    categories, selectedId, onChangeCategoria,
    items, loading, error, reload,
    fabOpen, toggleFab, closeFab,
    favorites, onToggleFavorite,
    refreshFavorites,                
  } = useHomeVM(uc, currentUid, toggleUC);

  // cada vez que Home gana foco
  // refrescamos el set de favoritos desde Firestore.
  useFocusEffect(
    useCallback(() => {
      refreshFavorites();
    }, [refreshFavorites])
  );

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
          onPressItem= {(a) => navigation.navigate('ArticuloDetail', { articulo: a })}
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