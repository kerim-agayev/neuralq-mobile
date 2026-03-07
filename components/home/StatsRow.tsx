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
    { key: 'tests', emoji: '📝', value: testsCompleted, label: t('stats.tests') },
    { key: 'streak', emoji: '🔥', value: streak, label: t('stats.streak') },
    { key: 'bp', emoji: '🧠', value: brainPoints, label: t('stats.bp') },
    { key: 'nc', emoji: '🪙', value: coins, label: t('stats.nc') },
    { key: 'rank', emoji: '🏆', value: globalRank ?? '—', label: t('stats.rank') },
  ];

  const boxWidth = isSmall ? 72 : undefined;

  const renderBoxes = () =>
    stats.map((stat, i) => (
      <View
        key={stat.key}
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
        <Text
          style={[styles.value, { color: colors.primary }, isSmall && { fontSize: 13 }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
        >
          {stat.value}
        </Text>
        <Text
          style={[styles.label, { color: colors.textDim }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
        >
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
    fontSize: 15,
    fontWeight: '700',
  },
  label: {
    fontSize: 9,
    fontWeight: '500',
    marginTop: 2,
  },
});
