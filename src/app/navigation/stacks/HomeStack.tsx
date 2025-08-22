import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../../../presentation/screens/Home/HomeScreen';
import MapaScreen from '../../../presentation/screens/Mapa/MapaScreen';
import ArticuloDetailScreen from '../../../presentation/screens/ArticuloDetails/ArticuloDetailScreen';
import type { Articulo } from '../../../domain/entities/Articulo';

export type HomeStackParamList = {
  Home: undefined;
  ArticuloDetail: { articulo: Articulo };
  Mapa: { focus?: { id: string; latitude: number; longitude: number } } | undefined;
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator>
      {/* Oculto el header solo en Home */}
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ArticuloDetail" component={ArticuloDetailScreen} options={{ title: 'Info Artículo' }} />
      <Stack.Screen name="Mapa" component={MapaScreen} options={{ title: 'Mapa' }} />
    </Stack.Navigator>
  );
}