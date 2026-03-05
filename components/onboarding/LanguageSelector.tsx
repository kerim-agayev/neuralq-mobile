import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useThemeColors } from '../../theme';
import { LANGUAGES, Language } from '../../constants/languages';

interface LanguageSelectorProps {
  selected: string;
  onSelect: (lang: string) => void;
}

export default function LanguageSelector({
  selected,
  onSelect,
}: LanguageSelectorProps) {
  const colors = useThemeColors();
  const { width } = useWindowDimensions();

  const horizontalPadding = 20;
  const gap = 8;
  const columns = 4;
  const totalGaps = (columns - 1) * gap + columns * gap;
  const itemWidth = (width - horizontalPadding * 2 - totalGaps) / columns;

  const renderItem = (item: Language) => {
    const isSelected = item.value === selected;

    return (
      <TouchableOpacity
        key={item.value}
        onPress={() => onSelect(item.value)}
        activeOpacity={0.7}
        style={[
          styles.item,
          {
            width: itemWidth,
            height: itemWidth,
            backgroundColor: isSelected ? colors.primaryDim : colors.surface,
            borderColor: isSelected ? colors.primary : colors.border,
          },
        ]}
      >
        <Text style={styles.flag}>{item.flag}</Text>
        <Text
          style={[
            styles.label,
            { color: isSelected ? colors.primary : colors.textSecondary },
          ]}
          numberOfLines={1}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  // Chunk into rows of 4
  const rows: Language[][] = [];
  for (let i = 0; i < LANGUAGES.length; i += columns) {
    rows.push(LANGUAGES.slice(i, i + columns));
  }

  return (
    <View style={[styles.container, { paddingHorizontal: horizontalPadding }]}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={[styles.row, { gap }]}>
          {row.map(renderItem)}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  item: {
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flag: {
    fontSize: 26,
    marginBottom: 3,
  },
  label: {
    fontSize: 9,
    fontWeight: '600',
  },
});
