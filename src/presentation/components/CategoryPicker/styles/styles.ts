import { StyleSheet } from 'react-native';

export const DARK = '#0F172A';

export const pickerStyles = StyleSheet.create({
  // ANDROID
  androidPickerWrapper: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  androidPicker: {
    height: 48,
    color: DARK, // color del texto seleccionado
  },

  // iOS compacto
  iosSelector: {
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    paddingHorizontal: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  iosSelectorText: { color: DARK, fontSize: 16, fontWeight: '600' },
  iosSelectorChevron: { color: DARK, fontSize: 18, marginLeft: 8 },
});