import { StyleSheet, Platform } from 'react-native';
import { COLORS } from '../../../../app/theme/colors';

export const mapStyles = StyleSheet.create({
  fill: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Card del callout
  callout: {
    width: 260,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },

  coTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  coImgWrap: {
    width: 56,
    height: 56,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f1f5f9',
  },
  coImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coImgPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coImgPhTxt: {
    fontSize: 10,
    color: '#64748b',
  },

  coTexts: {
    flex: 1,
    marginLeft: 10,
  },
  coTitle: {
    fontWeight: '700',
    fontSize: 15,
    color: '#0f172a',
  },
  coDesc: {
    marginTop: 2,
    fontSize: 12,
    color: '#475569',
  },

  coButtonsRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  coBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.pantone,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  // flechita
  coArrow: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    marginLeft: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#fff',
  },
});