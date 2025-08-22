import React, { useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../../app/providers/AuthProvider';
import { ArticuloRepositoryImpl } from '../../../../data/repositories/ArticuloRepositoryImpl';
import { GetArticulosByIds } from '../../../../domain/usecases/GetArticulosByIdsUseCase';
import { useMisProductosVM } from '../../../viewmodels/MisProductosViewModel';
import ArticuloListSimple from '../../../components/ArticuloList/ArticuloListSimple';
import { misProductosStyles as styles } from './styles/MisProductos.styles';

export default function MisProductosScreen() {
  const { user } = useAuth();
  const ids = user?.articulos ?? [];

  const artRepo  = useMemo(() => new ArticuloRepositoryImpl(), []);
  const getByIds = useMemo(() => new GetArticulosByIds(artRepo), [artRepo]);

  const { items, loading, error, reload } = useMisProductosVM(getByIds, ids);

  return (
    <SafeAreaView style={styles.container}>
      <ArticuloListSimple
        items={items}
        loading={loading}
        error={error}
        reload={reload}
        extraContentStyle={styles.listContent}
        rowWrapperStyle={styles.rowWrap}
      />
    </SafeAreaView>
  );
}