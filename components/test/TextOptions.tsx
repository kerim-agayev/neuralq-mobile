import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeColors } from '../../theme';
import { QuestionOption } from '../../types';

interface TextOptionsProps {
  options: QuestionOption[];
  selectedIndex: number | null;
  correctIndex: number | null; // null during answering, number after feedback
  disabled: boolean;
  onSelect: (index: number) => void;
}

export default function TextOptions({
  options,
  selectedIndex,
  correctIndex,
  disabled,
  onSelect,
}: TextOptionsProps) {
  const colors = useThemeColors();

  const getOptionStyle = (index: number) => {
    const isSelected = selectedIndex === index;
    const isCorrect = correctIndex === index;
    const isWrong = isSelected && correctIndex !== null && correctIndex !== index;

    if (isCorrect) {
      return {
        bg: colors.success + '22',
        border: colors.success,
        text: colors.success,
      };
    }
    if (isWrong) {
      return {
        bg: colors.error + '22',
        border: colors.error,
        text: colors.error,
      };
    }
    if (isSelected) {
      return {
        bg: colors.primaryDim,
        border: colors.primary,
        text: colors.primary,
      };
    }
    return {
      bg: colors.surface,
      border: colors.border,
      text: colors.text,
    };
  };

  const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  return (
    <View style={styles.container}>
      {options.map((option, index) => {
        const style = getOptionStyle(index);
        return (
          <TouchableOpacity
            key={index}
            onPress={() => onSelect(index)}
            disabled={disabled}
            activeOpacity={0.7}
            style={[
              styles.option,
              {
                backgroundColor: style.bg,
                borderColor: style.border,
              },
            ]}
          >
            <View style={[styles.label, { borderColor: style.border }]}>
              <Text style={[styles.labelText, { color: style.text }]}>
                {labels[index] || String(index + 1)}
              </Text>
            </View>
            <Text
              style={[styles.optionText, { color: style.text }]}
              numberOfLines={3}
            >
              {option.text}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  label: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  labelText: {
    fontSize: 13,
    fontWeight: '700',
  },
  optionText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
});
