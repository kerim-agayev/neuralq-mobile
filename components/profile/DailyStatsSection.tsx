import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from '../../theme';
import { DailyStats } from '../../types';

interface DailyStatsSectionProps {
  stats: DailyStats | null;
}

export default function DailyStatsSection({ stats }: DailyStatsSectionProps) {
  const colors = useThemeColors();
  const { t } = useTranslation();

  if (!stats) return null;

  const items = [
    { emoji: '\uD83D\uDD25', label: t('home.streak'), value: `${stats.currentStreak} days` },
    { emoji: '\uD83C\uDFC6', label: t('profile.longestStreak'), value: `${stats.longestStreak} days` },
    { emoji: '\uD83C\uDFAF', label: t('profile.accuracy'), value: `${Math.round(stats.accuracy)}%` },
    { emoji: '\uD83D\uDCCA', label: 'Attempts', value: `${stats.totalAttempts}` },
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{t('profile.dailyStats')}</Text>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {items.map((item, i) => (
          <View
            key={item.label}
            style={[
              styles.row,
              i < items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
            ]}
          >
            <Text style={styles.rowEmoji}>{item.emoji}</Text>
            <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>{item.label}</Text>
            <Text style={[styles.rowValue, { color: colors.text }]}>{item.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  rowEmoji: {
    fontSize: 18,
    marginRight: 10,
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  rowValue: {
    fontSize: 15,
    fontWeight: '700',
  },
});
