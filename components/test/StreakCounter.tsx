import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../../theme';

interface StreakCounterProps {
  streak: number;
}

export default function StreakCounter({ streak }: StreakCounterProps) {
  const colors = useThemeColors();

  if (streak < 2) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.primaryDim }]}>
      <Text style={styles.fire}>🔥</Text>
      <Text style={[styles.text, { color: colors.primary }]}>
        {streak} Streak!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  fire: {
    fontSize: 16,
  },
  text: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
