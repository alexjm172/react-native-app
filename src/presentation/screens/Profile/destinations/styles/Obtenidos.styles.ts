import { StyleSheet } from 'react-native';
import { COLORS } from '../../../../../app/theme/colors';

export const obtenidosStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.pantone },
  container: { flex: 1, padding: 12 },

  // chip estado
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  chipTxt: { color: '#fff', fontWeight: '700', fontSize: 12 },

  // línea de periodo/importe
  metaRow: { marginTop: 8 },
  metaTxt: { color: '#334155' },
});