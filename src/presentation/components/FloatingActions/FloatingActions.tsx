import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { floatingStyles as styles } from './styles/FloatingActions.styles';

type Props = {
  open: boolean;
  onToggle: () => void;
  onAdd: () => void;
  onFilter: () => void;
};

export default function FloatingActions({ open, onToggle, onAdd, onFilter }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        {
          bottom: insets.bottom + 16, // respeta el home indicator
          right: 16,
        },
      ]}
    >
      {/* Botones secundarios (solo si open === true) */}
      {open && (
        <View style={styles.secondaryRow}>

          <TouchableOpacity
            style={styles.secondaryBtn}
            activeOpacity={0.9}
            onPress={onAdd}
          >
            <Ionicons name="add" size={22} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            activeOpacity={0.9}
            onPress={onFilter}
          >
            <Ionicons name="funnel-outline" size={20} color="#ffffff" />
          </TouchableOpacity>

        </View>
      )}

      {/* Botón principal */}
      <TouchableOpacity
        style={styles.mainBtn}
        activeOpacity={0.9}
        onPress={onToggle}
      >
        <Ionicons name="ellipsis-vertical" size={22} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}