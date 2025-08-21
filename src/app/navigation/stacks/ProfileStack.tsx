import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../../../presentation/screens/Profile/ProfileScreen';

// Pantallas destino (placeholders por ahora)
import MisProductosScreen from '../../../presentation/screens/Profile/destinations/MisProductosScreen';
import ObtenidosScreen from '../../../presentation/screens/Profile/destinations/ObtenidoScreen';
import FavoritosScreen from '../../../presentation/screens/Profile/destinations/FavoritosScreen';

export type ProfileStackParamList = {
  Profile: undefined;
  MisProductos: undefined;
  Obtenidos: undefined;
  Favoritos: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
      <Stack.Screen name="MisProductos" component={MisProductosScreen} options={{ title: 'Tus productos' }} />
      <Stack.Screen name="Obtenidos" component={ObtenidosScreen} options={{ title: 'Productos obtenidos' }} />
      <Stack.Screen name="Favoritos" component={FavoritosScreen} options={{ title: 'Tus favoritos' }} />
    </Stack.Navigator>
  );
}