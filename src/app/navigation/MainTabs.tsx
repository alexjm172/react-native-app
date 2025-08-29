import React from 'react';
import { Platform, View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { Ionicons, type IoniconsIconName } from '@react-native-vector-icons/ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS } from '../theme/colors';
import HomeStack from './stacks/HomeStack';
import CarritoStack from './stacks/CarritoStack';
import MapaStack from './stacks/MapaStack';
import ProfileStack from './stacks/ProfileStack';
import { useCart } from '../providers/CartProvider'; // 👈

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
  const { count } = useCart();

  const bottom = Math.max(insets.bottom, 12);     
  const tabHeight = 56 + bottom;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const root = ROOT_BY_TAB[route.name as keyof MainTabsParamList];
        const nested = getFocusedRouteNameFromRoute(route);
        const hide = nested != null && nested !== root;

        return {
          headerShown: false,
          tabBarHideOnKeyboard: true,

          tabBarActiveTintColor: COLORS.pantone,
          tabBarInactiveTintColor: (COLORS as any).textMuted ?? '#8A8A8A',

          // 👇 aplica safe-area también en Android
          tabBarStyle: hide
            ? { display: 'none' }
            : {
                backgroundColor: (COLORS as any).tabBg ?? '#fff',
                borderTopColor: 'transparent',
                elevation: 10,                    // sombra Android
                height: tabHeight,                // 56 + insets.bottom
                paddingTop: 6,
                paddingBottom: bottom,            // insets.bottom (o mínimo)
              },

          // 👇 rellena el área segura inferior con el mismo color (evita “huecos”)
          tabBarBackground: () => (
            <View style={{ flex: 1, backgroundColor: (COLORS as any).tabBg ?? '#fff' }} />
          ),

          tabBarIcon: ({ focused, color, size }) => {
            const name = getIconName(route.name as keyof MainTabsParamList, focused);
            const showBadge = route.name === 'CarritoTab' && count > 0;

            return (
              <View style={{ width: size + 8, height: size + 8, justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name={name} size={size} color={color} />
                {showBadge && (
                  <View
                    accessibilityLabel={`${count} en carrito`}
                    style={{
                      position: 'absolute',
                      top: -2, right: -6,
                      minWidth: 16, height: 16, borderRadius: 8,
                      backgroundColor: '#EF4444',
                      paddingHorizontal: 4,
                      alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>
                      {count > 99 ? '99+' : String(count)}
                    </Text>
                  </View>
                )}
              </View>
            );
          },
          tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        };
      }}
    >
      <Tab.Screen name="HomeTab"    component={HomeStack} />
      <Tab.Screen name="CarritoTab" component={CarritoStack} />
      <Tab.Screen name="MapaTab"    component={MapaStack} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} />
    </Tab.Navigator>
  );
}