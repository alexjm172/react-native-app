import React from 'react';
import { View, Text, TouchableOpacity, Platform, ActionSheetIOS } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { pickerStyles as styles, DARK } from './styles/styles';
import type { CategoryId, CategoryOption } from '../../viewmodels/types/Category';

type Props = {
  categories: CategoryOption[];
  selectedId: CategoryId;
  onChange: (id: CategoryId) => void;
};

export default function CategoryPicker({ categories, selectedId, onChange }: Props) {
  if (Platform.OS === 'android') {
    return (
      <View style={styles.androidPickerWrapper}>
        <Picker
          selectedValue={selectedId}
          onValueChange={(val) => onChange(val as CategoryId)}
          style={styles.androidPicker}
          dropdownIconColor={DARK}
          mode="dropdown"
        >
          {categories.map(c => (
            <Picker.Item key={c.id} label={c.label} value={c.id} color={DARK} />
          ))}
        </Picker>
      </View>
    );
  }

  // iOS: selector compacto + ActionSheet
  const selectedLabel = categories.find(c => c.id === selectedId)?.label ?? '';
  const openSheet = () => {
    const labels = categories.map(c => c.label);
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: [...labels, 'Cancelar'],
        cancelButtonIndex: labels.length,
        userInterfaceStyle: 'light',
      },
      (index) => {
        if (index !== undefined && index >= 0 && index < labels.length) {
          onChange(categories[index].id);
        }
      }
    );
  };

  return (
    <TouchableOpacity style={styles.iosSelector} onPress={openSheet} activeOpacity={0.8}>
      <Text style={styles.iosSelectorText}>{selectedLabel}</Text>
      <Text style={styles.iosSelectorChevron}>▾</Text>
    </TouchableOpacity>
  );
}