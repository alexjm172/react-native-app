import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../../../presentation/screens/Home/HomeScreen';

export type HomeStackParamList = {
  Home: undefined;
  // Ejemplo: Detalle: { id: string }
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio' }} />
    </Stack.Navigator>
  );
}