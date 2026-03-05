import { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useThemeColors } from '../../theme';
import { testService } from '../../services/test.service';
import { LoadingSpinner } from '../../components/ui';
import SpiderChart from '../../components/results/SpiderChart';
import CelebrityMatchComponent from '../../components/results/CelebrityMatch';
import CognitiveAge from '../../components/results/CognitiveAge';
import CategoryBreakdown from '../../components/results/CategoryBreakdown';
import { TestResult } from '../../types';

export default function HistoryDetailScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    testService
      .getHistory()
      .then((history) => {
        const found = history.find((r) => r.id === id);
        if (found) setResult(found);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <View
        style={[
          styles.centered,
          { backgroundColor: colors.background, paddingTop: insets.top },
        ]}
      >
        <LoadingSpinner />
      </View>
    );
  }

  if (!result) {
    return (
      <View
        style={[
          styles.centered,
          { backgroundColor: colors.background, paddingTop: insets.top },
        ]}
      >
        <Text style={[styles.errorText, { color: colors.error }]}>
          Result not found
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backLink, { color: colors.primary }]}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const date = new Date(result.completedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 40 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Back button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <Text style={[styles.backArrow, { color: colors.primary }]}>‹</Text>
        <Text style={[styles.backText, { color: colors.primary }]}>Profile</Text>
      </TouchableOpacity>

      {/* IQ Score header */}
      <View style={styles.header}>
        <Text style={[styles.iqScore, { color: colors.primary }]}>
          {result.iqScore}
        </Text>
        <Text style={[styles.iqLabel, { color: colors.textDim }]}>IQ Score</Text>
        <Text style={[styles.date, { color: colors.textSecondary }]}>{date}</Text>
      </View>

      {/* Celebrity Match */}
      <View style={styles.section}>
        <CelebrityMatchComponent iqScore={result.iqScore} />
      </View>

      {/* Spider Chart */}
      <View style={styles.section}>
        <SpiderChart
          spatial={result.spatialPercentile}
          logic={result.logicPercentile}
          verbal={result.verbalPercentile}
          memory={result.memoryPercentile}
          speed={result.speedPercentile}
        />
      </View>

      {/* Cognitive Age */}
      <View style={styles.section}>
        <CognitiveAge cognitiveAge={result.cognitiveAge} />
      </View>

      {/* Category Breakdown */}
      <View style={styles.section}>
        <CategoryBreakdown result={result} />
      </View>

      {/* Ranks */}
      {(result.globalRank || result.countryRank) && (
        <View style={[styles.rankRow, { borderColor: colors.border }]}>
          {result.globalRank && (
            <View style={styles.rankItem}>
              <Text style={styles.rankEmoji}>🌍</Text>
              <Text style={[styles.rankValue, { color: colors.primary }]}>
                #{result.globalRank}
              </Text>
              <Text style={[styles.rankLabel, { color: colors.textDim }]}>
                Global
              </Text>
            </View>
          )}
          {result.countryRank && (
            <View style={styles.rankItem}>
              <Text style={styles.rankEmoji}>🏳️</Text>
              <Text style={[styles.rankValue, { color: colors.primary }]}>
                #{result.countryRank}
              </Text>
              <Text style={[styles.rankLabel, { color: colors.textDim }]}>
                Country
              </Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  backLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backArrow: {
    fontSize: 28,
    fontWeight: '300',
    marginRight: 4,
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 8,
  },
  iqScore: {
    fontSize: 56,
    fontWeight: '900',
  },
  iqLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: -4,
  },
  date: {
    fontSize: 13,
    marginTop: 8,
  },
  section: {
    marginBottom: 16,
  },
  rankRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  rankItem: {
    alignItems: 'center',
  },
  rankEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  rankValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  rankLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
});
