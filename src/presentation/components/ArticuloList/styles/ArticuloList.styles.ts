import { StyleSheet } from 'react-native';
import { COLORS } from '../../../../app/theme/colors';

export const articuloListStyles = StyleSheet.create({
  content: { paddingBottom: 24 },

  center: { paddingVertical: 32, alignItems: 'center', justifyContent: 'center' },
  error: { color: COLORS.error },

  row: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  rowTitle: { fontWeight: '700', fontSize: 16, color: COLORS.black },
  rowSub: { color: '#555', marginTop: 2 },

  empty: { paddingVertical: 24, alignItems: 'center' },
  emptyText: { color: COLORS.textPrimary },
});