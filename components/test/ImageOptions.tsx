import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useThemeColors } from '../../theme';
import { QuestionOption } from '../../types';

interface ImageOptionsProps {
  options: QuestionOption[];
  selectedIndex: number | null;
  correctIndex: number | null;
  disabled: boolean;
  onSelect: (index: number) => void;
}

export default function ImageOptions({
  options,
  selectedIndex,
  correctIndex,
  disabled,
  onSelect,
}: ImageOptionsProps) {
  const colors = useThemeColors();
  const { width } = useWindowDimensions();

  // 2 columns for 4 options, 3 columns for 6+ options
  const columns = options.length <= 4 ? 2 : 3;
  const gap = 10;
  const padding = 20;
  const itemSize = (width - padding * 2 - gap * (columns - 1)) / columns;

  const getOptionStyle = (index: number) => {
    const isSelected = selectedIndex === index;
    const isCorrect = correctIndex === index;
    const isWrong = isSelected && correctIndex !== null && correctIndex !== index;

    if (isCorrect) return { border: colors.success, opacity: 1 };
    if (isWrong) return { border: colors.error, opacity: 0.6 };
    if (isSelected) return { border: colors.primary, opacity: 1 };
    return { border: colors.border, opacity: 1 };
  };

  const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  return (
    <View style={styles.grid}>
      {options.map((option, index) => {
        const style = getOptionStyle(index);
        return (
          <TouchableOpacity
            key={index}
            onPress={() => onSelect(index)}
            disabled={disabled}
            activeOpacity={0.7}
            style={[
              styles.item,
              {
                width: itemSize,
                height: itemSize,
                borderColor: style.border,
                opacity: style.opacity,
              },
            ]}
          >
            {option.imageUrl ? (
              <Image
                source={{ uri: option.imageUrl }}
                style={styles.image}
                contentFit="contain"
                transition={200}
              />
            ) : (
              <Text
                style={[styles.fallbackText, { color: colors.text }]}
                numberOfLines={3}
              >
                {option.text}
              </Text>
            )}
            <View style={[styles.badge, { backgroundColor: colors.surface }]}>
              <Text style={[styles.badgeText, { color: style.border }]}>
                {labels[index]}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  item: {
    borderRadius: 12,
    borderWidth: 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallbackText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
