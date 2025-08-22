import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CarritoScreen from '../../../presentation/screens/Carrito/CarritoScreen';

export type CarritoStackParamList = {
  Carrito: undefined;
};

const Stack = createNativeStackNavigator<CarritoStackParamList>();

export default function CarritoStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Carrito" component={CarritoScreen}  />
    </Stack.Navigator>
  );
}