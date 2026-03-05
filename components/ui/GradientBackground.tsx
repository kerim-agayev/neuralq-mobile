import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '../../theme';

interface GradientBackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function GradientBackground({
  children,
  style,
}: GradientBackgroundProps) {
  const colors = useThemeColors();

  return (
    <LinearGradient
      colors={[colors.background, colors.surface, colors.background]}
      locations={[0, 0.5, 1]}
      style={[styles.container, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
