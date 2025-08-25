import { StyleSheet, Platform } from 'react-native';
import { COLORS } from '../../../../app/theme/colors';

const SIZE = 56;

export const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.select({ ios: 28, android: 24 }),
    right: 16,
    alignItems: 'flex-end',
  },

  childrenCol: {
    alignItems: 'flex-end',
    marginBottom: 12,
    gap: 10,
  },

  miniFab: {
    backgroundColor: COLORS.pantone,
    borderRadius: 28,
    padding: 14,
  },

  mainFab: {
    backgroundColor: COLORS.pantone,
    borderRadius: SIZE / 2,
    padding: 18,
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Sombras
  shadowSmall: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOpacity: 0.18,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    android: {
      elevation: 6,
    },
  }) as object,

  shadowStrong: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOpacity: 0.25,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 4 },
    },
    android: {
      elevation: 8,
    },
  }) as object,

  // Badge
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ef4444',
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 2 },
    }),
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
});