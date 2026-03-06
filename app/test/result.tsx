import { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from '../../theme';
import { testService } from '../../services/test.service';
import { useTestStore } from '../../store/test.store';
import { LoadingSpinner } from '../../components/ui';
import IQReveal from '../../components/results/IQReveal';
import SpiderChart from '../../components/results/SpiderChart';
import CelebrityMatchComponent from '../../components/results/CelebrityMatch';
import CognitiveAge from '../../components/results/CognitiveAge';
import CategoryBreakdown from '../../components/results/CategoryBreakdown';
import ShareCard from '../../components/results/ShareCard';
import CertificateButton from '../../components/results/CertificateButton';
import BadgeUnlockModal from '../../components/badges/BadgeUnlockModal';
import { TestResult } from '../../types';

export default function ResultScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const verbalSkipped = useTestStore((s) => s.verbalSkipped);

  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);

  useEffect(() => {
    if (!sessionId) return;
    testService
      .getResult(sessionId)
      .then((data) => {
        setResult(data);
        if (data.newBadges && data.newBadges.length > 0) {
          setUnlockedBadges(data.newBadges);
        }
      })
      .catch(() => {
        // Try from history as fallback
        testService
          .getHistory()
          .then((history) => {
            if (history.length > 0) setResult(history[0]);
          })
          .catch(() => {});
      })
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background, paddingTop: insets.top },
        ]}
      >
        <LoadingSpinner text={t('result.calculating')} />
      </View>
    );
  }

  if (!result) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background, paddingTop: insets.top },
        ]}
      >
        <Text style={[styles.errorText, { color: colors.error }]}>
          {t('result.loadError')}
        </Text>
        <ShareCard result={null} onRetake={() => router.replace('/(tabs)/home')} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 20, paddingBottom: Math.max(insets.bottom, 20) + 60 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Animated IQ Score */}
      <IQReveal iqScore={result.iqScore} />

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
        <CategoryBreakdown result={result} verbalSkipped={verbalSkipped} />
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
                {t('result.globalRank')}
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
                {t('result.countryRank')}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Certificate Download */}
      <View style={styles.section}>
        <CertificateButton resultId={result.id} />
      </View>

      {/* Share + Retake */}
      <View style={styles.section}>
        <ShareCard
          result={result}
          onRetake={() => router.replace('/test/select-mode')}
        />
      </View>

      {/* Badge unlock modal */}
      <BadgeUnlockModal
        badgeNames={unlockedBadges}
        onClose={() => setUnlockedBadges([])}
      />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
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
