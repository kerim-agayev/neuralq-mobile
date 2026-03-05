import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from '../../theme';
import { useAuthStore } from '../../store/auth.store';
import { leaderboardService } from '../../services/leaderboard.service';
import { NeonText } from '../../components/ui';
import LeaderboardList from '../../components/leaderboard/LeaderboardList';
import { LeaderboardEntry } from '../../types';

type Tab = 'global' | 'country';

export default function LeaderboardScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);

  const [activeTab, setActiveTab] = useState<Tab>('global');
  const [globalData, setGlobalData] = useState<LeaderboardEntry[]>([]);
  const [countryData, setCountryData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'global') {
        const data = await leaderboardService.getGlobal();
        setGlobalData(data);
      } else if (user?.country) {
        const data = await leaderboardService.getCountry(user.country);
        setCountryData(data);
      }
    } catch {
      // API endpoint may not exist yet — silently show empty list
    } finally {
      setLoading(false);
    }
  }, [activeTab, user?.country]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'global', label: t('leaderboard.global') },
    { key: 'country', label: t('leaderboard.country') },
  ];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top + 16 },
      ]}
    >
      <View style={styles.header}>
        <NeonText size={22}>{t('leaderboard.title')}</NeonText>
      </View>

      {/* Tab switcher */}
      <View style={[styles.tabBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && {
                backgroundColor: colors.primaryDim,
                borderColor: colors.primary,
              },
            ]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === tab.key ? colors.primary : colors.textDim,
                },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <LeaderboardList
        data={activeTab === 'global' ? globalData : countryData}
        loading={loading}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    padding: 3,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
