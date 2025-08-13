import { Platform, StyleSheet } from 'react-native';
// ✅ ruta corregida: estás en src/presentation/screens/Auth/Login/styles
//   Para llegar a src/app/theme/colors → subes 5 niveles y entras en app/theme
import { COLORS } from '../../../../../theme/colors';

// Para un card consistente en ambos modos
const CARD_MIN_HEIGHT = 360;
const CARD_MAX_WIDTH = 460;

export const PANTONE = COLORS.pantone;

export const loginStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.screenBg },

  // Fondo a pantalla completa
  bg: { flex: 1, width: '100%', height: '100%' },
  bgImage: { resizeMode: 'cover' },

  // Capa para oscurecer
  dim: { ...StyleSheet.absoluteFillObject, backgroundColor: COLORS.dim },

  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 210,
  },

  title: {
    color:  COLORS.pantone,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
  },

  // Rounded rectangle con sombra y tamaño consistente
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 20,             
    alignSelf: 'center',
    width: '100%',
    maxWidth: CARD_MAX_WIDTH,
    minHeight: CARD_MIN_HEIGHT,

    // iOS shadow
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,

    // Android shadow
    elevation: 12,
  },

  label: { color: COLORS.textOnLight, marginTop: 8, marginBottom: 6, fontSize: 12 },

  input: {
    backgroundColor: COLORS.inputBg,
    color: COLORS.textOnLight,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.select({ ios: 12, android: 10 }),
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },

  // Botón con rounded rectangle en pantone y texto blanco (padding base; el extra va animado)
  primaryBtn: {
    backgroundColor: PANTONE,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,

    // sombra
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  primaryText: { color: '#fff', fontWeight: '800', fontSize: 16 },

  linkBtn: { paddingVertical: 12, alignItems: 'center' },
  linkText: { color: COLORS.textOnLight, opacity: 0.9, textDecorationLine: 'underline' },

  error: { color: COLORS.error, marginTop: 8 },
});