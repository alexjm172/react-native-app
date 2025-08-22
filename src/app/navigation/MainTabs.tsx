import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { Ionicons, type IoniconsIconName } from '@react-native-vector-icons/ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
    case 'HomeTab':    return focused ? 'home'   : 'home-outline';
    case 'CarritoTab': return focused ? 'cart'   : 'cart-outline';
    case 'MapaTab':    return focused ? 'map'    : 'map-outline';
    case 'ProfileTab': return focused ? 'person' : 'person-outline';
    default:           return 'ellipse';
  }
}

const ROOT_BY_TAB: Record<keyof MainTabsParamList, string> = {
  HomeTab: 'Home',
  CarritoTab: 'Carrito',
  MapaTab: 'Mapa',
  ProfileTab: 'Profile',
};

export default function MainTabs() {
  const insets = useSafeAreaInsets();
  const height = 56 + insets.bottom;
  const paddingBottom = Math.max(8, insets.bottom);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const root = ROOT_BY_TAB[route.name as keyof MainTabsParamList];
        const nested = getFocusedRouteNameFromRoute(route);
        // Oculta la TabBar si la ruta enfocada NO es la raíz del stack
        const hide = nested != null && nested !== root;

        return {
          headerShown: false,
          tabBarHideOnKeyboard: true,
          tabBarActiveTintColor: COLORS.pantone,
          tabBarInactiveTintColor: (COLORS as any).textMuted ?? '#8A8A8A',
          tabBarStyle: hide
            ? { display: 'none' }
            : {
                backgroundColor: (COLORS as any).tabBg ?? '#fff',
                borderTopColor: 'transparent',
                height: Platform.select({ ios: height, android: 60 }),
                paddingBottom: Platform.select({ ios: paddingBottom, android: 8 }),
                paddingTop: 6,
              },
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={getIconName(route.name as keyof MainTabsParamList, focused)}
              size={size}
              color={color}
            />
          ),
          tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        };
      }}
    >
      <Tab.Screen name="HomeTab"    component={HomeStack} />
      <Tab.Screen name="CarritoTab" component={CarritoStack} />
      <Tab.Screen name="MapaTab"    component={MapaStack}  />
      <Tab.Screen name="ProfileTab" component={ProfileStack} />
    </Tab.Navigator>
  );
}