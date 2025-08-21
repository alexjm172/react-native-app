import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
    case 'HomeTab': return focused ? 'home' : 'home-outline';
    case 'CarritoTab': return focused ? 'cart' : 'cart-outline';
    case 'MapaTab': return focused ? 'map' : 'map-outline';
    case 'ProfileTab': return focused ? 'person' : 'person-outline';
    default: return 'ellipse';
  }
}

export default function MainTabs() {
  const insets = useSafeAreaInsets();
  const baseHeight = 56; // alto visual del tab bar sin safe area

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: COLORS.pantone,
        tabBarInactiveTintColor: (COLORS as any).textMuted ?? '#8A8A8A',

        // 👇 Respetar safe area inferior
        safeAreaInsets: { bottom: insets.bottom },

        tabBarStyle: {
          backgroundColor: (COLORS as any).tabBg ?? '#fff',
          borderTopColor: 'transparent',
          // Altura total = base + bottom inset
          height: baseHeight + insets.bottom,
          // Padding inferior mínimo 8px + safe area
          paddingBottom: Math.max(8, insets.bottom),
          paddingTop: 6,
        },

        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={getIconName(route.name as keyof MainTabsParamList, focused)} size={size} color={color} />
        ),
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