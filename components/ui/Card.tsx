import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useThemeColors } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outline';
}

export default function Card({
  children,
  style,
  variant = 'default',
}: CardProps) {
  const colors = useThemeColors();

  const variantStyle: ViewStyle = {
    default: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    elevated: {
      backgroundColor: colors.surfaceLight,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: colors.border,
    },
  }[variant];

  return (
    <View style={[styles.base, variantStyle, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
  },
});
