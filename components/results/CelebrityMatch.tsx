import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../../theme';
import { useTranslation } from 'react-i18next';
import { getCelebrityMatch } from '../../constants/celebrities';
import Card from '../ui/Card';

interface CelebrityMatchProps {
  iqScore: number;
}

export default function CelebrityMatchComponent({ iqScore }: CelebrityMatchProps) {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const celebrity = getCelebrityMatch(iqScore);

  return (
    <Card variant="elevated" style={styles.card}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        {t('result.celebrityMatch')}
      </Text>
      <Text style={styles.emoji}>{celebrity.emoji}</Text>
      <Text
        style={[
          styles.name,
          {
            color: colors.primary,
            textShadowColor: colors.primary,
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 8,
          },
        ]}
      >
        {celebrity.label}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
