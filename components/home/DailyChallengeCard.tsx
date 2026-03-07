import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from '../../theme';
import { dailyService } from '../../services/daily.service';
import { DailyChallenge } from '../../types';

interface DailyChallengeCardProps {
  streak: number;
  refreshTrigger?: number;
  onRefreshNeeded?: () => void;
}

export default function DailyChallengeCard({ streak, refreshTrigger, onRefreshNeeded }: DailyChallengeCardProps) {
  const colors = useThemeColors();
  const router = useRouter();
  const { t } = useTranslation();

  const [daily, setDaily] = useState<DailyChallenge | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDaily = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dailyService.getToday();
      setDaily(data);
    } catch {
      // No daily challenge available
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDaily();
  }, [fetchDaily, refreshTrigger]);

  if (loading) {
    return (
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  if (!daily) {
    return (
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={styles.emoji}>{'\uD83E\uDDE0'}</Text>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.textDim }]}>
            {t('daily.noChallenge')}
          </Text>
        </View>
      </View>
    );
  }

  const attempted = daily.alreadyAttempted;
  const isCorrect = daily.userAnswer?.isCorrect;
  const correctPercent = daily.totalAttempts > 0
    ? Math.round((daily.correctAttempts / daily.totalAttempts) * 100)
    : 0;

  if (attempted) {
    return (
      <View style={[styles.card, styles.cardDone, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
        <Text style={styles.emoji}>{isCorrect ? '\u2705' : '\u274C'}</Text>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t('daily.dailyComplete')}
          </Text>
          <Text style={[styles.sub, { color: colors.textDim }]}>
            {t('daily.gotItRight', { percent: correctPercent })}
          </Text>
        </View>
        <View style={styles.streakBadge}>
          <Text style={[styles.streakText, { color: colors.warning }]}>
            {'\uD83D\uDD25'} {streak}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => router.push('/daily')}
      activeOpacity={0.7}
    >
      <Text style={styles.emoji}>{'\uD83E\uDDE0'}</Text>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('daily.title')}
        </Text>
        <Text style={[styles.sub, { color: colors.textDim }]}>
          {t('daily.peopleAttempted', { count: daily.totalAttempts })}
        </Text>
      </View>
      <View style={[styles.solveBtn, { backgroundColor: colors.primaryDim }]}>
        <Text style={[styles.solveBtnText, { color: colors.primary }]}>
          {t('daily.solveNow')}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 56,
  },
  cardDone: {
    borderWidth: 1.5,
  },
  emoji: {
    fontSize: 28,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  sub: {
    fontSize: 12,
    marginTop: 2,
  },
  streakBadge: {
    marginLeft: 8,
  },
  streakText: {
    fontSize: 16,
    fontWeight: '700',
  },
  solveBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  solveBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
