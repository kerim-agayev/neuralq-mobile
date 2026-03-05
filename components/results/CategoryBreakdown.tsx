import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../../theme';
import { useTranslation } from 'react-i18next';
import Card from '../ui/Card';
import { TestResult } from '../../types';

interface CategoryBreakdownProps {
  result: TestResult;
}

export default function CategoryBreakdown({ result }: CategoryBreakdownProps) {
  const colors = useThemeColors();
  const { t } = useTranslation();

  const allCategories = [
    {
      label: t('result.spatial'),
      emoji: '🧩',
      percentile: result.spatialPercentile,
      score: result.spatialScore,
    },
    {
      label: t('result.logic'),
      emoji: '🔢',
      percentile: result.logicPercentile,
      score: result.logicScore,
    },
    {
      label: t('result.verbal'),
      emoji: '📝',
      percentile: result.verbalPercentile,
      score: result.verbalScore,
    },
    {
      label: t('result.memory'),
      emoji: '🧠',
      percentile: result.memoryPercentile,
      score: result.memoryScore,
    },
    {
      label: t('result.speed'),
      emoji: '⚡',
      percentile: result.speedPercentile,
      score: result.speedScore,
    },
  ];

  // Only show categories with data
  const categories = allCategories.filter(
    (c) => c.percentile != null && c.percentile > 0,
  );

  if (categories.length === 0) return null;

  const getBarColor = (percentile: number) => {
    if (percentile >= 75) return colors.success;
    if (percentile >= 50) return colors.primary;
    if (percentile >= 25) return colors.warning;
    return colors.error;
  };

  return (
    <Card variant="default" style={styles.card}>
      <Text style={[styles.title, { color: colors.textSecondary }]}>
        {t('result.categories')}
      </Text>
      <View style={styles.list}>
        {categories.map((cat) => (
          <View key={cat.label} style={styles.row}>
            <Text style={styles.emoji}>{cat.emoji}</Text>
            <View style={styles.info}>
              <View style={styles.labelRow}>
                <Text style={[styles.label, { color: colors.text }]}>
                  {cat.label}
                </Text>
                <Text style={[styles.percentile, { color: colors.textDim }]}>
                  {Math.round(cat.percentile!)}%
                </Text>
              </View>
              <View style={[styles.barBg, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.barFill,
                    {
                      backgroundColor: getBarColor(cat.percentile!),
                      width: `${cat.percentile!}%` as const,
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: 16,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 14,
  },
  list: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  emoji: {
    fontSize: 20,
  },
  info: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  percentile: {
    fontSize: 12,
    fontWeight: '500',
  },
  barBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
});
