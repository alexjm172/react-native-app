import { StyleSheet } from 'react-native';
import { COLORS } from '../../../../../app/theme/colors';

export const misProductosStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.pantone, // fondo Pantone
  },
  listContent: {
    padding: 20,                      // padding general del listado
  },
  rowWrap: {
    marginHorizontal: 12,             // espacio izq/der por tarjeta
    marginBottom: 12,                 // espacio inferior entre tarjetas
  },
});