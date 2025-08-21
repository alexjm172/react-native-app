import { useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAuth } from '../../app/providers/AuthProvider';
import type { ProfileStackParamList } from '../../app/navigation/stacks/ProfileStack';

export function useProfileVM() {
  const { user, signOut } = useAuth();
  const nav = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();

  // Nombre mostrado
  const userName = useMemo(
    () => (user as any)?.nombre ?? (user as any)?.displayName ?? 'Usuario',
    [user]
  );

  // Navegaciones
  const goMisProductos = useCallback(() => nav.navigate('MisProductos'), [nav]);
  const goObtenidos    = useCallback(() => nav.navigate('Obtenidos'), [nav]);
  const goFavoritos    = useCallback(() => nav.navigate('Favoritos'), [nav]);

  // Confirmación de cierre de sesión
  const confirmSignOut = useCallback(() => {
    Alert.alert(
      'Cerrar sesión',
      '¿Seguro que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            try { await signOut(); } catch {}
          },
        },
      ],
      { cancelable: true }
    );
  }, [signOut]);

  return {
    userName,
    goMisProductos,
    goObtenidos,
    goFavoritos,
    confirmSignOut,
  };
}