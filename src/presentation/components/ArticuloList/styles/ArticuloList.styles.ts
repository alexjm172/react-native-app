import { StyleSheet } from 'react-native';
import { COLORS } from '../../../../app/theme/colors';

export const articuloListStyles = StyleSheet.create({
  content: { paddingBottom: 24 },

  center: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  error: { color: '#B91C1C' },

  // ===== FILA =====
  row: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBody: {
    flex: 1,
    marginLeft: 12, // separación respecto al thumb
  },

  rowTitle: { fontWeight: '700', fontSize: 16, color: '#0F172A' },
  rowSub: { color: '#555', marginTop: 2 },

  // ===== THUMBNAIL (izquierda) =====
  thumbBox: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',      // gris claro
    borderWidth: 1,
    borderColor: '#D1D5DB',
    overflow: 'hidden',
  },
  thumbImage: { width: '100%', height: '100%' },
  thumbCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Placeholder “imagen” (si no hay URL y no quieres icono de vector)
  placeholderWrap: {
    flex: 1,
    backgroundColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phSun: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    top: 10,
    right: 10,
    opacity: 0.9,
  },
  phHill: {
    position: 'absolute',
    width: '75%',
    height: '38%',
    backgroundColor: '#FFFFFF',
    bottom: 8,
    left: '12.5%',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 20,
    transform: [{ rotate: '-6deg' }],
    opacity: 0.9,
  },

  // ===== ACCIONES (debajo, centradas) =====
  actionsRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.pantone,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },

  // ===== VACÍO =====
  empty: { paddingVertical: 24, alignItems: 'center' },
  emptyText: { color: '#0F172A' },
});