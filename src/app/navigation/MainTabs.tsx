// src/app/navigation/MainTabs.tsx
import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, type IoniconsIconName } from '@react-native-vector-icons/ionicons'; 

import { COLORS } from '../theme/colors';

import HomeStack from './stacks/HomeStack';
import CarritoStack from './stacks/CarritoStack';
import MapaStack from './stacks/MapaStack';
import ProfileStack from './stacks/ProfileStack';

export type MainTabsParamList = {
  HomeTab: undefined;
  CarritoTab: undefined;
  MapaTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabsParamList>();

function getIconName(routeName: keyof MainTabsParamList, focused: boolean): IoniconsIconName {
  switch (routeName) {
    case 'HomeTab':
      return focused ? 'home' : 'home-outline';
    case 'CarritoTab':
      return focused ? 'cart' : 'cart-outline';
    case 'MapaTab':
      return focused ? 'map' : 'map-outline';
    case 'ProfileTab':
      return focused ? 'person' : 'person-outline';
    default:
      return 'ellipse';
  }
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: COLORS.pantone,
        tabBarInactiveTintColor: (COLORS as any).textMuted ?? '#8A8A8A',
        tabBarStyle: {
          backgroundColor: (COLORS as any).tabBg ?? '#fff',
          borderTopColor: 'transparent',
          height: Platform.select({ ios: 60, android: 60 }),
          paddingBottom: Platform.select({ ios: 10, android: 8 }),
          paddingTop: 6,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const name = getIconName(route.name as keyof MainTabsParamList, focused);
          return <Ionicons name={name} size={size} color={color} />;
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ title: 'Inicio' }} />
      <Tab.Screen name="CarritoTab" component={CarritoStack} options={{ title: 'Carrito' }} />
      <Tab.Screen name="MapaTab" component={MapaStack} options={{ title: 'Mapa' }} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}