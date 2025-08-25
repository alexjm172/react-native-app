import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { styles } from './styles/FloatingActions.styles';

type Props = {
  open: boolean;
  onToggle: () => void;
  onAdd?: () => void;
  onFilter?: () => void;
  filtersCount?: number;      // nº de filtros activos
  showFilterAction?: boolean; // mostrar botón de filtro en el menú
};

export default function FloatingActions({
  open,
  onToggle,
  onAdd,
  onFilter,
  filtersCount = 0,
  showFilterAction = true,
}: Props) {
  const hasFilters = filtersCount > 0;

  const Badge = ({ value }: { value: number }) => (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{value}</Text>
    </View>
  );

  return (
    <View pointerEvents="box-none" style={styles.container}>
      {open && (
        <View style={styles.childrenCol} pointerEvents="box-none">
          {onAdd && (
            <TouchableOpacity
              onPress={onAdd}
              style={[styles.miniFab, styles.shadowSmall]}
              activeOpacity={0.9}
            >
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          )}

          {showFilterAction && onFilter && (
            <View style={{ position: 'relative' }}>
              <TouchableOpacity
                onPress={onFilter}
                style={[styles.miniFab, styles.shadowSmall]}
                activeOpacity={0.9}
              >
                <Ionicons name="funnel-outline" size={20} color="#fff" />
              </TouchableOpacity>
              {hasFilters && <Badge value={filtersCount} />}
            </View>
          )}
        </View>
      )}

      <View style={{ position: 'relative' }}>
        <TouchableOpacity
          onPress={onToggle}
          style={[styles.mainFab, styles.shadowStrong]}
          activeOpacity={0.9}
        >
          <Ionicons name="ellipsis-vertical" size={22} color="#fff" />
        </TouchableOpacity>
        {(!showFilterAction || !onFilter) && hasFilters && <Badge value={filtersCount} />}
      </View>
    </View>
  );
}