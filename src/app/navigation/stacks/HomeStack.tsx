import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../../../presentation/screens/Home/HomeScreen';
import MapaScreen from '../../../presentation/screens/Mapa/MapaScreen';

export type HomeStackParamList = {
  Home: undefined;
  MapaFromHome: { focus?: { id: string; latitude: number; longitude: number } } | undefined;
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio' }} />
      <Stack.Screen name="MapaFromHome" component={MapaScreen} options={{ title: 'Mapa' }} />
    </Stack.Navigator>
  );
}