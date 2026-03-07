import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../../theme';
import { useTranslation } from 'react-i18next';
import Card from '../ui/Card';

interface CognitiveAgeProps {
  cognitiveAge: number | null;
}

export default function CognitiveAge({ cognitiveAge }: CognitiveAgeProps) {
  const colors = useThemeColors();
  const { t } = useTranslation();

  if (cognitiveAge == null) return null;

  return (
    <Card variant="default" style={styles.card}>
      <Text
        style={[styles.label, { color: colors.textSecondary }]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
      >
        {t('result.cognitiveAge')}
      </Text>
      <View style={styles.row}>
        <Text style={styles.emoji}>🧬</Text>
        <Text style={[styles.age, { color: colors.primary }]}>
          {cognitiveAge}
        </Text>
        <Text style={[styles.years, { color: colors.textDim }]}>years</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  emoji: {
    fontSize: 22,
  },
  age: {
    fontSize: 30,
    fontWeight: '800',
  },
  years: {
    fontSize: 12,
    fontWeight: '500',
  },
});
