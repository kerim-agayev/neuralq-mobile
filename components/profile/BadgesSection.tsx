import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from '../../theme';
import { BADGE_INFO, ALL_BADGE_KEYS } from '../../constants/badges';
import { Badge } from '../../types';

interface BadgesSectionProps {
  earnedBadges: Badge[];
}

export default function BadgesSection({ earnedBadges }: BadgesSectionProps) {
  const colors = useThemeColors();
  const { t } = useTranslation();

  const earnedNames = new Set(earnedBadges.map((b) => b.name));

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{t('badges.title')}</Text>
      <View style={styles.grid}>
        {ALL_BADGE_KEYS.map((key) => {
          const info = BADGE_INFO[key];
          const earned = earnedNames.has(key);
          const badge = earnedBadges.find((b) => b.name === key);

          return (
            <View
              key={key}
              style={[
                styles.badgeItem,
                {
                  backgroundColor: earned ? colors.surface : colors.background,
                  borderColor: earned ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={[styles.emoji, !earned && styles.locked]}>
                {earned ? info.emoji : '\uD83D\uDD12'}
              </Text>
              <Text
                style={[
                  styles.badgeTitle,
                  { color: earned ? colors.text : colors.textDim },
                ]}
                numberOfLines={1}
              >
                {info.title}
              </Text>
              {earned && badge ? (
                <Text style={[styles.badgeDate, { color: colors.textDim }]}>
                  {new Date(badge.awardedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
              ) : (
                <Text style={[styles.badgeDate, { color: colors.textDim }]}>
                  {t('badges.locked')}
                </Text>
              )}
            </View>
          );
        })}
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badgeItem: {
    width: '31%',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  emoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  locked: {
    opacity: 0.4,
  },
  badgeTitle: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  badgeDate: {
    fontSize: 9,
    marginTop: 2,
    textAlign: 'center',
  },
});
