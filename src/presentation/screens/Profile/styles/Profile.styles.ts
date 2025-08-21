import { StyleSheet, Platform } from 'react-native';
import { COLORS } from '../../../../app/theme/colors';

const PANTONE = (COLORS as any).pantone || '#3B82F6';

// Fondo tipo “pantone” suave; usa tu token si tienes uno (pantoneBg/pantoneSoft)
const BG = (COLORS as any).pantoneSoft || (COLORS as any).pantoneBg || '#C9D7E3';

export const profileStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scroll: { padding: 20, paddingBottom: 28 },

  header: { alignItems: 'center', marginTop: 6, marginBottom: 16 },
  avatarWrap: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 3 },
    }),
  },
  avatarBadge: {
    position: 'absolute', right: 6, bottom: 6,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: PANTONE,
    alignItems: 'center', justifyContent: 'center',
  },
  userName: { marginTop: 8, fontSize: 18, fontWeight: '700', color: '#0F172A' },

  cards: {
    gap: 14,
    backgroundColor: BG,
    borderRadius: 22,
    paddingVertical: 12,
  },

  card: {
    backgroundColor: '#F7F8FA',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#EAEFF4',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
      android: { elevation: 2 },
    }),
    marginHorizontal: 6,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },

  cardIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#E9EEF3',
    alignItems: 'center', justifyContent: 'center',
  },
  heartBg: {
    backgroundColor: '#EF4444',
  },

  // Logout
  logoutCard: {
    backgroundColor: '#FDF2F2',
    borderColor: '#FDE0E0',
  },
  logoutText: { color: '#991B1B' },
  logoutIconBg: { backgroundColor: '#DC2626' },
});