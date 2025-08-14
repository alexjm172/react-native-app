import { StyleSheet } from 'react-native';
import { COLORS } from '../../../../app/theme/colors';

export const homeStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.pantone },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  row: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  rowTitle: { fontWeight: '700', fontSize: 16, color: COLORS.textPrimary },
  rowSub: { color: '#555', marginTop: 2 },

  empty: { paddingVertical: 24, alignItems: 'center' },
  emptyText: { color: '#fff' },
  error: { color: '#fff' },
});