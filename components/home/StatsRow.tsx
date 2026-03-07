import React from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
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
  const { width } = useWindowDimensions();
  const isSmall = width < 380;

  const stats = [
    { emoji: '📝', value: testsCompleted, label: 'Tests' },
    { emoji: '🔥', value: streak, label: 'Streak' },
    { emoji: '🧠', value: brainPoints, label: 'BP' },
    { emoji: '🪙', value: coins, label: 'NC' },
    { emoji: '🏆', value: globalRank ?? '—', label: 'Rank' },
  ];

  const boxWidth = isSmall ? 72 : undefined;

  const renderBoxes = () =>
    stats.map((stat, i) => (
      <View
        key={stat.label}
        style={[
          styles.statBox,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
          !isSmall && styles.statBoxFlex,
          isSmall && { width: boxWidth, marginRight: i < stats.length - 1 ? 6 : 0 },
          !isSmall && i < stats.length - 1 && styles.statBoxGap,
        ]}
      >
        <Text style={[styles.emoji, isSmall && { fontSize: 14 }]}>{stat.emoji}</Text>
        <Text style={[styles.value, { color: colors.primary }, isSmall && { fontSize: 15 }]}>
          {stat.value}
        </Text>
        <Text style={[styles.label, { color: colors.textDim }]} numberOfLines={1}>
          {stat.label}
        </Text>
      </View>
    ));

  if (isSmall) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollContainer}
      >
        {renderBoxes()}
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      {renderBoxes()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 16,
  },
  scrollContainer: {
    marginTop: 16,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  statBox: {
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  statBoxFlex: {
    flex: 1,
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
