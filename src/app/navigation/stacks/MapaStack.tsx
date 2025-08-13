import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MapaScreen from '../../../presentation/screens/Mapa/MapaScreen';

export type MapaStackParamList = {
  Mapa: undefined;
  // Ej.: MapaDetalle: { id: string }
};

const Stack = createNativeStackNavigator<MapaStackParamList>();

export default function MapaStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Mapa" component={MapaScreen} options={{ title: 'Mapa' }} />
    </Stack.Navigator>
  );
}