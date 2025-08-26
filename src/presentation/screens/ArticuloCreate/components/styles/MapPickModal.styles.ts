import { StyleSheet, Platform } from 'react-native';
import { COLORS } from '../../../../../app/theme/colors';

export const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 12,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontWeight: '700', fontSize: 16, color: '#0F172A' },
  mapWrap: { height: 380, backgroundColor: '#eee' },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cta: {
    backgroundColor: COLORS.pantone,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  ctaTxt: { color: '#fff', fontWeight: '700' },

  // “Mi ubicación” floating button
  locBtnWrap: {
    position: 'absolute',
    right: 12,
    bottom: 12,
  },
  locBtn: {
    backgroundColor: COLORS.pantone,
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  locBtnTxt: { color: '#fff', fontWeight: '600' },
});