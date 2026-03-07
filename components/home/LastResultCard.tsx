import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../../theme';
import { useTranslation } from 'react-i18next';
import Card from '../ui/Card';
import { TestResult } from '../../types';
import { getCelebrityMatch } from '../../constants/celebrities';

interface LastResultCardProps {
  result: TestResult | null;
}

export default function LastResultCard({ result }: LastResultCardProps) {
  const colors = useThemeColors();
  const { t } = useTranslation();

  if (!result) {
    return (
      <Card variant="outline" style={styles.card}>
        <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>
          {t('home.noResults')}
        </Text>
        <Text style={[styles.emptyHint, { color: colors.textDim }]}>
          {t('home.firstTestHint')}
        </Text>
      </Card>
    );
  }

  const celebrity = getCelebrityMatch(result.iqScore);

  return (
    <Card variant="elevated" style={styles.card}>
      <Text style={[styles.headerLabel, { color: colors.textSecondary }]}>
        {t('home.lastResult')}
      </Text>

      <View style={styles.scoreRow}>
        <View style={styles.iqBlock}>
          <Text style={[styles.iqScore, { color: colors.primary }]}>
            {result.iqScore}
          </Text>
          <Text style={[styles.iqLabel, { color: colors.textDim }]}>IQ</Text>
        </View>

        {celebrity && (
          <View style={styles.celebrityBlock}>
            <Text style={styles.celebrityEmoji}>
              {result.iqScore >= 140 ? '🧬' : result.iqScore >= 116 ? '🚀' : '🧠'}
            </Text>
            <Text
              style={[styles.celebrityName, { color: colors.text }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
            >
              {celebrity.label}
            </Text>
          </View>
        )}
      </View>

      {/* Mini category bars — only show categories that have data */}
      <View style={styles.categories}>
        {[
          { key: 'spatial', label: t('result.spatialShort'), score: result.spatialPercentile },
          { key: 'logic', label: t('result.logicShort'), score: result.logicPercentile },
          { key: 'verbal', label: t('result.verbalShort'), score: result.verbalPercentile },
          { key: 'memory', label: t('result.memoryShort'), score: result.memoryPercentile },
          { key: 'speed', label: t('result.speedShort'), score: result.speedPercentile },
        ]
          .filter((cat) => cat.score != null && cat.score > 0)
          .map((cat) => (
            <View key={cat.key} style={styles.catRow}>
              <Text
                style={[styles.catLabel, { color: colors.textDim }]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.6}
              >
                {cat.label}
              </Text>
              <View style={[styles.barBg, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.barFill,
                    {
                      backgroundColor: colors.primary,
                      width: `${cat.score!}%` as const,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginTop: 16,
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  emptyHint: {
    fontSize: 12,
    textAlign: 'center',
  },
  headerLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iqBlock: {
    alignItems: 'center',
    marginRight: 20,
  },
  iqScore: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: 1,
  },
  iqLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: -4,
  },
  celebrityBlock: {
    flex: 1,
    alignItems: 'flex-start',
  },
  celebrityEmoji: {
    fontSize: 22,
    marginBottom: 2,
  },
  celebrityName: {
    fontSize: 14,
    fontWeight: '600',
  },
  categories: {
    gap: 6,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  catLabel: {
    fontSize: 10,
    width: 50,
    fontWeight: '500',
  },
  barBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
});
