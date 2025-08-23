import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/app/navigation/RootNavigator';
import { AuthProvider } from './src/app/providers/AuthProvider';
import { CartProvider } from './src/app/providers/CartProvider'; 

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>  
          <RootNavigator />
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}