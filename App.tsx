import React from 'react';
import RootNavigator from './src/app/navigation/RootNavigator';
import { AuthProvider } from './src/app/providers/AuthProvider';
import { View } from 'react-native';

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </View>
  );
}