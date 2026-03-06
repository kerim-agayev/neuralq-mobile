import { useState, useEffect, useCallback } from 'react';
import { ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { useThemeColors } from '../../theme';
import { useAuthStore } from '../../store/auth.store';
import { testService } from '../../services/test.service';
import { dailyService } from '../../services/daily.service';
import { ProfileSkeleton } from '../../components/ui';
import ProfileHeader from '../../components/profile/ProfileHeader';
import BadgesSection from '../../components/profile/BadgesSection';
import DailyStatsSection from '../../components/profile/DailyStatsSection';
import TestHistory from '../../components/profile/TestHistory';
import SettingsSection from '../../components/profile/SettingsSection';
import { TestResult, DailyStats } from '../../types';

export default function ProfileScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);

  const [history, setHistory] = useState<TestResult[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [historyData, statsData] = await Promise.allSettled([
        testService.getHistory(),
        dailyService.getStats(),
      ]);
      if (historyData.status === 'fulfilled') setHistory(historyData.value);
      if (statsData.status === 'fulfilled') setDailyStats(statsData.value);
    } catch {
      Toast.show({ type: 'error', text1: t('profile.loadError') });
    } finally {
      setLoading(false);
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

  if (!user || loading) {
    return <ProfileSkeleton />;
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 10, paddingBottom: Math.max(insets.bottom, 20) + 80 },
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      <ProfileHeader user={user} />
      <BadgesSection earnedBadges={user.badges ?? []} />
      <DailyStatsSection stats={dailyStats} />
      <TestHistory results={history} />
      <SettingsSection />
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
});
