import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemeColors } from '../../theme';

interface TimerBarProps {
  progress: number; // 0 to 1 (1 = full, 0 = empty)
}

export default function TimerBar({ progress }: TimerBarProps) {
  const colors = useThemeColors();

  // Color transitions: green → yellow → red
  const getBarColor = () => {
    if (progress > 0.5) return colors.success;
    if (progress > 0.25) return colors.warning;
    return colors.error;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.border }]}>
      <View
        style={[
          styles.fill,
          {
            backgroundColor: getBarColor(),
            width: `${Math.max(0, Math.min(100, progress * 100))}%`,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});
