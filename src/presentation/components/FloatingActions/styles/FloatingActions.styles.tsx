import { StyleSheet } from 'react-native';
import { COLORS } from '../../../../app/theme/colors';

export const floatingStyles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    zIndex: 100,          // iOS por encima de la lista
    elevation: 8,         // Android por encima
    flexDirection: 'row',
    alignItems: 'center',
  },

  // fila hacia la izquierda del botón principal
  secondaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10, // separación respecto al principal
    gap: 10,
  },

  mainBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.pantone,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },

  secondaryBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.pantone,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
});