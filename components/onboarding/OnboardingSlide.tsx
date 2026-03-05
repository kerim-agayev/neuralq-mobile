import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { useThemeColors } from '../../theme';

interface OnboardingSlideProps {
  emoji: string;
  title: string;
  description: string;
  compact?: boolean;
}

export default function OnboardingSlide({
  emoji,
  title,
  description,
  compact = false,
}: OnboardingSlideProps) {
  const colors = useThemeColors();
  const { width } = useWindowDimensions();

  return (
    <View style={[styles.container, { width: compact ? '100%' : width }]}>
      <Text style={[styles.emoji, compact && styles.emojiCompact]}>{emoji}</Text>
      <Text
        style={[
          styles.title,
          compact && styles.titleCompact,
          { color: colors.primary },
        ]}
      >
        {title}
      </Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emoji: {
    fontSize: 72,
    marginBottom: 20,
  },
  emojiCompact: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 1,
  },
  titleCompact: {
    fontSize: 22,
    marginBottom: 6,
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
