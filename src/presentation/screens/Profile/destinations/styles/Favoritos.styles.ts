import { StyleSheet } from 'react-native';
import { COLORS } from '../../../../../theme/colors';

export const favoritosStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.pantone,
  },
  listContent: {
    padding: 12,
  },
  separator: {
    height: 12, 
  },
});