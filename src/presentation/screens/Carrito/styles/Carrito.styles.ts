import { StyleSheet } from 'react-native';
import { COLORS } from '../../../../theme/colors';

export const carritoStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.pantone,
  },
  content: {
    padding: 12,
  },
  separator: {
    height: 12,
  },
  calendarWrap: {
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
    paddingBottom: 10,
  },
  estimate: {
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  estimateTitle: {
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  estimateText: {
    color: '#0f172a',
  },
  estimateStrong: {
    fontWeight: '800',
  },
});