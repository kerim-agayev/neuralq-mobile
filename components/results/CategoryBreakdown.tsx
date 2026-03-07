import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../../theme';
import { useTranslation } from 'react-i18next';
import Card from '../ui/Card';
import { TestResult } from '../../types';

interface CategoryBreakdownProps {
  result: TestResult;
  verbalSkipped?: boolean;
}

export default function CategoryBreakdown({ result, verbalSkipped }: CategoryBreakdownProps) {
  const colors = useThemeColors();
  const { t } = useTranslation();

  const allCategories = [
    {
      key: 'spatial',
      label: t('result.spatial'),
      emoji: '🧩',
      percentile: result.spatialPercentile,
      score: result.spatialScore,
      skipped: false,
    },
    {
      key: 'logic',
      label: t('result.logic'),
      emoji: '🔢',
      percentile: result.logicPercentile,
      score: result.logicScore,
      skipped: false,
    },
    {
      key: 'verbal',
      label: t('result.verbal'),
      emoji: '📝',
      percentile: result.verbalPercentile,
      score: result.verbalScore,
      skipped: !!verbalSkipped || result.verbalPercentile == null || result.verbalPercentile === 0,
    },
    {
      key: 'memory',
      label: t('result.memory'),
      emoji: '🧠',
      percentile: result.memoryPercentile,
      score: result.memoryScore,
      skipped: result.memoryPercentile == null || result.memoryPercentile === 0,
    },
    {
      key: 'speed',
      label: t('result.speed'),
      emoji: '⚡',
      percentile: result.speedPercentile,
      score: result.speedScore,
      skipped: false,
    },
  ];

  // Active categories (have data and not skipped)
  const activeCategories = allCategories.filter(
    (c) => !c.skipped && c.percentile != null && c.percentile > 0,
  );
  // Skipped categories to show as N/A
  const skippedCategories = allCategories.filter((c) => c.skipped);

  if (activeCategories.length === 0 && skippedCategories.length === 0) return null;

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
        {activeCategories.map((cat) => (
          <View key={cat.key} style={styles.row}>
            <Text style={styles.emoji}>{cat.emoji}</Text>
            <View style={styles.info}>
              <View style={styles.labelRow}>
                <Text
                  style={[styles.label, { color: colors.text }]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.6}
                >
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
        {skippedCategories.map((cat) => (
          <View key={cat.key} style={[styles.row, { opacity: 0.5 }]}>
            <Text style={styles.emoji}>{cat.emoji}</Text>
            <View style={styles.info}>
              <View style={styles.labelRow}>
                <Text
                  style={[styles.label, { color: colors.textDim }]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.6}
                >
                  {cat.label}
                </Text>
                <Text
                  style={[styles.naLabel, { color: colors.textDim }]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.7}
                >
                  {t('result.notAvailable')}
                </Text>
              </View>
              <View style={[styles.barBg, { backgroundColor: colors.border }]}>
                <View style={[styles.barFill, { backgroundColor: colors.border, width: '100%' }]} />
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
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  percentile: {
    fontSize: 11,
    fontWeight: '500',
  },
  naLabel: {
    fontSize: 12,
    fontWeight: '600',
    fontStyle: 'italic',
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
