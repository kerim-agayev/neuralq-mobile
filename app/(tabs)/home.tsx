import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from '../../theme';
import { useAuthStore } from '../../store/auth.store';
import { testService } from '../../services/test.service';
import { leaderboardService } from '../../services/leaderboard.service';
import { storage } from '../../utils/storage';
import { NeonText, HomeSkeleton } from '../../components/ui';
import QuickTestButton from '../../components/home/QuickTestButton';
import LastResultCard from '../../components/home/LastResultCard';
import StatsRow from '../../components/home/StatsRow';
import { TestResult } from '../../types';

export default function HomeScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const displayName = user?.displayName || user?.username || 'User';

  const [lastResult, setLastResult] = useState<TestResult | null>(null);
  const [testsCount, setTestsCount] = useState(0);
  const [globalRank, setGlobalRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [history, rankData] = await Promise.allSettled([
        testService.getHistory(),
        leaderboardService.getUserRank(),
      ]);
      if (history.status === 'fulfilled') {
        setTestsCount(history.value.length);
        setLastResult(history.value.length > 0 ? history.value[0] : null);
      }
      if (rankData.status === 'fulfilled') {
        setGlobalRank(rankData.value.globalRank);
      }
    } catch {
      // Silently handle
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Check for incomplete test session backup
  useEffect(() => {
    (async () => {
      try {
        const backup = await storage.getTestBackup();
        if (!backup) return;
        // Ignore backups older than 30 minutes
        const ageMs = Date.now() - backup.timestamp;
        if (ageMs > 30 * 60 * 1000) {
          await storage.clearTestBackup();
          return;
        }
        Alert.alert(
          t('test.incompleteTitle'),
          t('test.incompleteMessage'),
          [
            {
              text: t('test.discardTest'),
              style: 'destructive',
              onPress: () => storage.clearTestBackup(),
            },
            {
              text: t('common.ok'),
              onPress: () => storage.clearTestBackup(),
            },
          ],
        );
      } catch {
        // Ignore
      }
    })();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const handleStartTest = () => {
    router.push('/test/select-mode');
  };

  if (loading) {
    return <HomeSkeleton />;
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 80 },
      ]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <NeonText size={26}>NeuralQ</NeonText>
        <Text style={[styles.welcome, { color: colors.textSecondary }]}>
          {t('home.welcome')}, {displayName}!
        </Text>
      </View>

      {/* Stats Row */}
      <StatsRow
        testsCompleted={testsCount}
        streak={user?.currentStreak ?? 0}
        coins={user?.neuralCoins ?? 0}
        globalRank={globalRank}
      />

      {/* Pulsating Test Button */}
      <QuickTestButton onPress={handleStartTest} />

      {/* Last Result Card */}
      <LastResultCard result={lastResult} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  welcome: {
    fontSize: 15,
    marginTop: 8,
  },
});
