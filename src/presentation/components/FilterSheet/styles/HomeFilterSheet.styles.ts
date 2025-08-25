import { StyleSheet } from 'react-native';

export const sheetStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  backdropTouch: { flex: 1 },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 16,
  },
  handle: {
    alignSelf: 'center',
    width: 44, height: 5, borderRadius: 3, backgroundColor: '#E5E7EB', marginBottom: 8,
  },
  chipsWrap: { marginBottom: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0ea5e9', paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 999, marginRight: 8,
  },
  chipText: { color: '#fff', fontWeight: '600' },
  chipClose: { marginLeft: 6 },

  section: { marginTop: 10 },
  sectionRow: { marginTop: 10, flexDirection: 'row' },
  label: { fontWeight: '600', marginBottom: 6, color: '#0f172a' },
  input: {
    height: 42, borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB',
    paddingHorizontal: 12, backgroundColor: '#fff',
  },

  pill: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999,
    borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#fff',
    marginRight: 8,
  },
  pillActive: { backgroundColor: '#0ea5e9', borderColor: '#0ea5e9' },
  pillText: { color: '#0f172a', fontWeight: '600' },
  pillTextActive: { color: '#fff' },

  actionsRow: { flexDirection: 'row', marginTop: 16, marginBottom: 4 },
  btn: {
    flex: 1, height: 44, borderRadius: 12, backgroundColor: '#0ea5e9',
    alignItems: 'center', justifyContent: 'center', flexDirection: 'row',
  },
  btnText: { color: '#fff', fontWeight: '700', marginLeft: 8 },
  btnGhost: {
    flex: 1, height: 44, borderRadius: 12, backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center',
  },
  btnGhostText: { color: '#0f172a', fontWeight: '700' },
});