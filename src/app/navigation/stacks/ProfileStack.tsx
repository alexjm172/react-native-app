import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../../../presentation/screens/Profile/ProfileScreen';
import MisProductosScreen from '../../../presentation/screens/Profile/destinations/MisProductosScreen';
import ObtenidosScreen from '../../../presentation/screens/Profile/destinations/ObtenidoScreen';
import FavoritosScreen from '../../../presentation/screens/Profile/destinations/FavoritosScreen';
import MapaScreen from '../../../presentation/screens/Mapa/MapaScreen';
import ArticuloDetailScreen from '../../../presentation/screens/ArticuloDetails/ArticuloDetailScreen';
import ArticuloEditScreen from '../../../presentation/screens/ArticuloEdit/ArticuloEditScreen'; 
import type { Articulo } from '../../../domain/entities/Articulo';

export type ProfileStackParamList = {
  Profile: undefined;
  MisProductos: undefined;
  Obtenidos: undefined;
  Favoritos: undefined;
  ArticuloDetail: { articulo: Articulo; canEdit?: boolean };
  ArticuloEdit: { articulo: Articulo };              
  Mapa: { focus?: { id: string; latitude: number; longitude: number } } | undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MisProductos" component={MisProductosScreen} options={{ title: 'Tus productos' }} />
      <Stack.Screen name="Obtenidos" component={ObtenidosScreen} options={{ title: 'Productos obtenidos' }} />
      <Stack.Screen name="Favoritos" component={FavoritosScreen} options={{ title: 'Tus favoritos' }} />
      <Stack.Screen name="ArticuloDetail" component={ArticuloDetailScreen} options={{ title: 'Detalle' }} />
      <Stack.Screen name="ArticuloEdit" component={ArticuloEditScreen} options={{ title: 'Editar artículo' }} />
      <Stack.Screen name="Mapa" component={MapaScreen} options={{ title: 'Mapa' }} />
    </Stack.Navigator>
  );
}