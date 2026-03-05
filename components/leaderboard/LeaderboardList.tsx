import React from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from '../../theme';
import { Skeleton } from '../ui';
import { LeaderboardEntry } from '../../types';
import LeaderboardCard from './LeaderboardCard';

interface LeaderboardListProps {
  data: LeaderboardEntry[];
  loading: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export default function LeaderboardList({ data, loading, refreshing = false, onRefresh }: LeaderboardListProps) {
  const colors = useThemeColors();
  const { t } = useTranslation();

  if (loading) {
    return (
      <View style={styles.skeletonContainer}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton
            key={i}
            width="100%"
            height={56}
            borderRadius={12}
            style={{ marginBottom: 10 }}
          />
        ))}
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>🏆</Text>
        <Text style={[styles.emptyText, { color: colors.textDim }]}>
          {t('leaderboard.noRankings')}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => `${item.userId}-${item.rank}`}
      renderItem={({ item }) => <LeaderboardCard entry={item} />}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        ) : undefined
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  skeletonContainer: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
  },
});
