import { StyleSheet, Platform } from 'react-native';
import { COLORS } from '../../../../theme/colors';

export const editStyles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: COLORS.pantone,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  label: { fontSize: 14, fontWeight: '600', color: '#0F172A', marginTop: 14, marginBottom: 6 },

  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.select({ ios: 12, android: 8 }),
    fontSize: 16,
  },

  error: { marginTop: 6, color: '#B91C1C' },

  // ===== Imágenes
  imagesHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 10,
  },
  addBtnText: { color: '#fff', marginLeft: 6, fontWeight: '600' },

  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 8,
  },
  imageBox: {
    width: '31%',
    aspectRatio: 1,
    marginHorizontal: '1.16%',
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  image: { flex: 1 },
  imagePlaceholder: {
    width: '31%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: { color: '#6B7280', fontSize: 12 },

  imageAction: {
    position: 'absolute',
    right: 6,
    top: 6,
    backgroundColor: 'rgba(15,23,42,0.85)',
    width: 28, height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageRemoved: {
    opacity: 0.35,
  },

  // ===== Compact pickers
  compactPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  compactValue: { fontSize: 16, color: '#0F172A' },

  // ===== Modal (picker)
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    borderRadius: 14,
    backgroundColor: '#fff',
    padding: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 4 },
    }),
  },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
  pickerWrap: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
  },
  modalClose: {
    alignSelf: 'flex-end',
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#0F172A',
  },
  modalCloseTxt: { color: '#fff', fontWeight: '600' },

    locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e7eb',
    gap: 12,
    marginTop: 6,
    },
    locationText: { fontSize: 14, color: '#0f172a', fontWeight: '600' },
    locationHint: { fontSize: 12, color: '#64748b', marginTop: 2 },
    mapPickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563eb',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    },
    mapPickBtnText: { color: '#fff', fontWeight: '700' },
});

