import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MapaScreen from '../../../presentation/screens/Mapa/MapaScreen';

const Stack = createNativeStackNavigator();

export default function MapaStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Mapa" component={MapaScreen} />
    </Stack.Navigator>
  );
}