import { StyleSheet, Platform } from 'react-native';

export const mapStyles = StyleSheet.create({
  // Contenedor a pantalla completa
  fill: { flex: 1, backgroundColor: 'black' },

  // Centro para loaders / errores
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Burbuja del callout sobre el pin
  callout: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    maxWidth: 220,
    ...(Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
      },
      android: {
        elevation: 3,
      },
    }) as object),
  },

  coTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  coDesc: { marginTop: 2, fontSize: 12, color: '#475569' },

  // Flecha inferior de la burbuja
  coArrow: {
    position: 'absolute',
    bottom: -6,
    left: '50%',
    marginLeft: -6,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#fff',
  },
});