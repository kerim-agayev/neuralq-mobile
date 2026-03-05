import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '../../theme';
import { useTranslation } from 'react-i18next';
import { TestResult } from '../../types';
import { getCelebrityMatch } from '../../constants/celebrities';

interface TestHistoryProps {
  results: TestResult[];
}

export default function TestHistory({ results }: TestHistoryProps) {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const router = useRouter();

  if (results.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={[styles.emptyText, { color: colors.textDim }]}>
          {t('profile.noHistory')}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.textSecondary }]}>
        {t('profile.testHistory')}
      </Text>
      {results.map((result, index) => {
        const celebrity = getCelebrityMatch(result.iqScore);
        const date = new Date(result.completedAt).toLocaleDateString();

        return (
          <TouchableOpacity
            key={result.id}
            activeOpacity={0.7}
            onPress={() => router.push(`/history/${result.id}`)}
            style={[
              styles.item,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.itemLeft}>
              <Text style={[styles.iqScore, { color: colors.primary }]}>
                {result.iqScore}
              </Text>
              <Text style={[styles.iqLabel, { color: colors.textDim }]}>IQ</Text>
            </View>
            <View style={styles.itemCenter}>
              <Text style={[styles.celebrity, { color: colors.text }]} numberOfLines={1}>
                {celebrity.emoji} {celebrity.label}
              </Text>
              <Text style={[styles.date, { color: colors.textDim }]}>{date}</Text>
            </View>
            <Text style={[styles.arrow, { color: colors.textDim }]}>›</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 13,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  itemLeft: {
    alignItems: 'center',
    width: 44,
  },
  iqScore: {
    fontSize: 20,
    fontWeight: '800',
  },
  iqLabel: {
    fontSize: 9,
    fontWeight: '600',
    marginTop: -2,
  },
  itemCenter: {
    flex: 1,
    marginLeft: 12,
  },
  celebrity: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  date: {
    fontSize: 11,
  },
  arrow: {
    fontSize: 22,
    fontWeight: '300',
  },
});
