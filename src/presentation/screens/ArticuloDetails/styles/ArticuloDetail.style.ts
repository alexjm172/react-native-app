import { StyleSheet, Platform, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const IMG_H = 280;

export const detailStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  // Hero
  hero: { width, height: IMG_H, backgroundColor: '#eee' },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  placeholderText: { color: '#6b7280' },

  // Body
  content: { paddingHorizontal: 16, paddingVertical: 14 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  subtitle: { marginTop: 4, fontSize: 14, color: '#64748B' },

  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  ratingText: { marginLeft: 6, color: '#475569', fontSize: 12, fontWeight: '600' },

  chipsRow: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  chip: { backgroundColor: '#0ea5e9', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  chipText: { color: 'white', fontWeight: '700' },

  card: {
    marginTop: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
      android: { elevation: 1 },
    }),
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 8 },

  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  rowLabel: { width: 120, color: '#475569', fontSize: 13 },
  rowValueWrap: { flex: 1 },
  rowValue: { color: '#0F172A', fontSize: 14, fontWeight: '600' },

  mapBtn: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    backgroundColor: '#0ea5e9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  mapBtnText: { color: '#fff', fontWeight: '700' },

  descText: { color: '#334155', fontSize: 14, lineHeight: 20 },

  noteText: { marginTop: 4, color: '#64748B', fontSize: 12 },
  alqRow: { paddingVertical: 4 },
  alqMono: { fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }), color: '#0F172A' },

  // Fullscreen
  modalBg: { flex: 1, backgroundColor: 'black' },
  zoomCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  fullImg: { width: '100%', height: '100%' },

  closeBtn: {
    position: 'absolute',
    top: 40,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  closeTxt: { color: 'white', fontWeight: '700' },

  // helpers
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});