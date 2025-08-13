import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CarritoScreen from '../../../presentation/screens/Carrito/CarritoScreen';

export type CarritoStackParamList = {
  Carrito: undefined;
  // Ej.: Checkout: undefined
};

const Stack = createNativeStackNavigator<CarritoStackParamList>();

export default function CarritoStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Carrito" component={CarritoScreen} options={{ title: 'Carrito' }} />
    </Stack.Navigator>
  );
}