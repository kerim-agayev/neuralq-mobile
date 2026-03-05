import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../../theme';
import { LeaderboardEntry } from '../../types';
import { useAuthStore } from '../../store/auth.store';

interface LeaderboardCardProps {
  entry: LeaderboardEntry;
}

export default function LeaderboardCard({ entry }: LeaderboardCardProps) {
  const colors = useThemeColors();
  const currentUser = useAuthStore((s) => s.user);
  const isMe = currentUser?.id === entry.userId;

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  const rankEmoji = getRankEmoji(entry.rank);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isMe ? colors.primaryDim : colors.surface,
          borderColor: isMe ? colors.primary : colors.border,
        },
      ]}
    >
      {/* Rank */}
      <View style={styles.rankWrap}>
        {rankEmoji ? (
          <Text style={styles.rankEmoji}>{rankEmoji}</Text>
        ) : (
          <Text style={[styles.rankNumber, { color: colors.textDim }]}>
            {entry.rank}
          </Text>
        )}
      </View>

      {/* User info */}
      <View style={styles.info}>
        <Text
          style={[
            styles.name,
            { color: isMe ? colors.primary : colors.text },
          ]}
          numberOfLines={1}
        >
          {entry.displayName || entry.username}
          {isMe ? ' (You)' : ''}
        </Text>
        {entry.country && (
          <Text style={[styles.country, { color: colors.textDim }]}>
            {entry.country}
          </Text>
        )}
      </View>

      {/* IQ Score */}
      <View style={styles.scoreWrap}>
        <Text
          style={[
            styles.score,
            {
              color: colors.primary,
              textShadowColor: isMe ? colors.primary : 'transparent',
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: isMe ? 6 : 0,
            },
          ]}
        >
          {entry.iqScore}
        </Text>
        <Text style={[styles.scoreLabel, { color: colors.textDim }]}>IQ</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  rankWrap: {
    width: 36,
    alignItems: 'center',
  },
  rankEmoji: {
    fontSize: 20,
  },
  rankNumber: {
    fontSize: 15,
    fontWeight: '700',
  },
  info: {
    flex: 1,
    marginLeft: 10,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
  },
  country: {
    fontSize: 11,
    marginTop: 2,
  },
  scoreWrap: {
    alignItems: 'center',
  },
  score: {
    fontSize: 20,
    fontWeight: '800',
  },
  scoreLabel: {
    fontSize: 9,
    fontWeight: '600',
    marginTop: -2,
  },
});
