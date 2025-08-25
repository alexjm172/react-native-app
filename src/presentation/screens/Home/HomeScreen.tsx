import React, { useMemo, useCallback, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DeviceEventEmitter, type EmitterSubscription } from 'react-native';

import CategoryPicker from '../../components/CategoryPicker/CategoryPicker';
import ArticuloList from '../../components/ArticuloList/ArticulosList';
import FloatingActions from '../../components/FloatingActions/FloatingActions';
import HomeFilterSheet from '../../components/FilterSheet/HomeFilterSheet';
import { homeStyles as styles } from './styles/Home.styles';

import { ArticuloRepositoryImpl } from '../../../data/repositories/ArticuloRepositoryImpl';
import { GetArticulosByCategoria } from '../../../domain/usecases/GetArticulosByCategoria';
import { useAuth } from '../../../app/providers/AuthProvider';
import { UserRepositoryImpl } from '../../../data/repositories/UserRepositoryImpl';
import { ToggleFavoriteUseCase } from '../../../domain/usecases/ToggleFavoritoUseCase';
import { useHomeVM } from '../../viewmodels/HomeViewModel';
import type { CategoryId } from '../../viewmodels/types/Category';
import type { HomeStackParamList } from '../../../app/navigation/stacks/HomeStack';

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
    filteredItems, loading, error, reload,
    fabOpen, toggleFab, closeFab,
    favorites, onToggleFavorite,
    refreshFavorites,
    filters, setFilters,
    activeFiltersCount,
  } = useHomeVM(uc, currentUid, toggleUC);

  const [sheetVisible, setSheetVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refreshFavorites();
      reload();
      const sub: EmitterSubscription = DeviceEventEmitter.addListener('articulo:updated', () => {
        reload();
        refreshFavorites();
      });
      return () => sub.remove();
    }, [reload, refreshFavorites])
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
          items={filteredItems}
          loading={loading}
          error={error}
          reload={reload}
          favorites={favorites}
          onToggleFavorite={onToggleFavorite}
          onPressItem={(a) => navigation.navigate('ArticuloDetail', { articulo: a })}
        />

        <FloatingActions
          open={fabOpen}
          onToggle={toggleFab}
          onAdd={() => { closeFab(); /* acción añadir */ }}
          onFilter={() => { closeFab(); setSheetVisible(true); }}
          filtersCount={activeFiltersCount} 
          showFilterAction={true}           
        />
      </View>

      <HomeFilterSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        value={filters}
        onChange={setFilters}   
      />
    </SafeAreaView>
  );
}