// src/app/navigation/stacks/HomeStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../../../presentation/screens/Home/HomeScreen';
import MapaScreen from '../../../presentation/screens/Mapa/MapaScreen';
import ArticuloDetailScreen from '../../../presentation/screens/ArticuloDetails/ArticuloDetailScreen';
import ArticuloCreateScreen from '../../../presentation/screens/ArticuloCreate/ArticuloCreateScreen';
import type { Articulo } from '../../../domain/entities/Articulo';

export type HomeStackParamList = {
  Home: undefined;
  ArticuloDetail: { articulo: Articulo; canEdit?: boolean };
  ArticuloCreate: undefined;
  Mapa: { focus?: { id: string; latitude: number; longitude: number } } | undefined;
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator initialRouteName="Home">
      {/* Home primero y como ruta inicial */}
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ArticuloDetail" component={ArticuloDetailScreen} options={{ title: 'Info Artículo' }} />
      <Stack.Screen name="ArticuloCreate" component={ArticuloCreateScreen} options={{ title: 'Nuevo' }} />
      <Stack.Screen name="Mapa" component={MapaScreen} options={{ title: 'Mapa' }} />
    </Stack.Navigator>
  );
}