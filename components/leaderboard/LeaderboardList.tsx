import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useThemeColors } from '../../theme';
import { LeaderboardEntry } from '../../types';
import LeaderboardCard from './LeaderboardCard';

interface LeaderboardListProps {
  data: LeaderboardEntry[];
  loading: boolean;
}

export default function LeaderboardList({ data, loading }: LeaderboardListProps) {
  const colors = useThemeColors();

  if (loading) {
    return (
      <View style={styles.empty}>
        <Text style={[styles.emptyText, { color: colors.textDim }]}>
          Loading...
        </Text>
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>🏆</Text>
        <Text style={[styles.emptyText, { color: colors.textDim }]}>
          No rankings yet
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
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
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
