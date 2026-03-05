import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { useThemeColors } from '../../theme';

interface NeonTextProps {
  children: string;
  size?: number;
  color?: string;
  style?: TextStyle;
}

export default function NeonText({
  children,
  size = 32,
  color,
  style,
}: NeonTextProps) {
  const colors = useThemeColors();
  const textColor = color || colors.primary;

  return (
    <Text
      style={[
        styles.text,
        {
          fontSize: size,
          color: textColor,
          textShadowColor: textColor,
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 10,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontWeight: '700',
    letterSpacing: 2,
  },
});
