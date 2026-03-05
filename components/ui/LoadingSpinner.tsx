import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../../theme';

interface LoadingSpinnerProps {
  text?: string;
  size?: 'small' | 'large';
  fullScreen?: boolean;
}

export default function LoadingSpinner({
  text,
  size = 'large',
  fullScreen = true,
}: LoadingSpinnerProps) {
  const colors = useThemeColors();

  return (
    <View
      style={[
        styles.container,
        fullScreen && styles.fullScreen,
        { backgroundColor: fullScreen ? colors.background : 'transparent' },
      ]}
    >
      <ActivityIndicator size={size} color={colors.primary} />
      {text && (
        <Text style={[styles.text, { color: colors.textSecondary }]}>
          {text}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  fullScreen: {
    flex: 1,
  },
  text: {
    marginTop: 12,
    fontSize: 14,
  },
});
