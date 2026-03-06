import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../../theme';
import { useTranslation } from 'react-i18next';

interface StatsRowProps {
  testsCompleted: number;
  streak: number;
  coins: number;
  brainPoints: number;
  globalRank?: number | null;
}

export default function StatsRow({ testsCompleted, streak, coins, brainPoints, globalRank }: StatsRowProps) {
  const colors = useThemeColors();
  const { t } = useTranslation();

  const stats = [
    { emoji: '📝', value: testsCompleted, label: 'Tests' },
    { emoji: '🔥', value: streak, label: t('home.streak') },
    { emoji: '🧠', value: brainPoints, label: 'BP' },
    { emoji: '🪙', value: coins, label: t('home.coins') },
    { emoji: '🏆', value: globalRank ?? '—', label: t('result.globalRank') },
  ];

  return (
    <View style={styles.container}>
      {stats.map((stat, i) => (
        <View
          key={stat.label}
          style={[
            styles.statBox,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
            i < stats.length - 1 && styles.statBoxGap,
          ]}
        >
          <Text style={styles.emoji}>{stat.emoji}</Text>
          <Text style={[styles.value, { color: colors.primary }]}>
            {stat.value}
          </Text>
          <Text style={[styles.label, { color: colors.textDim }]}>
            {stat.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  statBoxGap: {
    marginRight: 6,
  },
  emoji: {
    fontSize: 16,
    marginBottom: 3,
  },
  value: {
    fontSize: 17,
    fontWeight: '700',
  },
  label: {
    fontSize: 9,
    fontWeight: '500',
    marginTop: 2,
  },
});
