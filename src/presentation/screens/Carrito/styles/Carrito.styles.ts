import { StyleSheet } from 'react-native';
import { COLORS } from '../../../../app/theme/colors';

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
    padding: 10,
  },
  estimate: {
    marginTop: 10,
  },
  estimateTitle: {
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 2,
  },
  estimateText: {
    color: '#0f172a',
  },
  estimateStrong: {
    fontWeight: '800',
  },
  rentBtn: {
    marginTop: 12,
    backgroundColor: COLORS.pantone,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 8,
  },
  rentBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
});