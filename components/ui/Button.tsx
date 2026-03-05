import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useThemeColors } from '../../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const colors = useThemeColors();
  const isDisabled = disabled || loading;

  const sizeStyles = {
    sm: { paddingVertical: 8, paddingHorizontal: 16, fontSize: 13 },
    md: { paddingVertical: 14, paddingHorizontal: 24, fontSize: 16 },
    lg: { paddingVertical: 18, paddingHorizontal: 32, fontSize: 18 },
  }[size];

  const variantStyles: { container: ViewStyle; text: TextStyle } = {
    primary: {
      container: {
        backgroundColor: colors.primary,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 12,
        elevation: 8,
      },
      text: { color: '#0a0a0f', fontWeight: '700' as const },
    },
    secondary: {
      container: {
        backgroundColor: colors.secondary,
        shadowColor: colors.secondary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 6,
      },
      text: { color: '#ffffff', fontWeight: '700' as const },
    },
    outline: {
      container: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: colors.primary,
      },
      text: { color: colors.primary, fontWeight: '600' as const },
    },
    ghost: {
      container: { backgroundColor: 'transparent' },
      text: { color: colors.primary, fontWeight: '600' as const },
    },
  }[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[
        styles.base,
        {
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
        },
        variantStyles.container,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variantStyles.text.color as string}
        />
      ) : (
        <Text
          style={[
            styles.text,
            { fontSize: sizeStyles.fontSize },
            variantStyles.text,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    letterSpacing: 0.5,
  },
  disabled: {
    opacity: 0.5,
  },
});
