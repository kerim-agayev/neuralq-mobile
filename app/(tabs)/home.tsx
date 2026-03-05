import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from '../../theme';
import { useAuthStore } from '../../store/auth.store';
import { testService } from '../../services/test.service';
import { NeonText } from '../../components/ui';
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
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const history = await testService.getHistory();
      setTestsCount(history.length);
      setLastResult(history.length > 0 ? history[0] : null);
    } catch {
      // No results yet — that's fine
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const handleStartTest = () => {
    router.push('/test/select-mode');
  };

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
