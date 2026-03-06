import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from '../../theme';
import { useTest } from '../../hooks/useTest';
import { NeonText, Card, LoadingSpinner } from '../../components/ui';
import { TestMode } from '../../types';

export default function SelectModeScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const { startTest, loading } = useTest();

  const handleSelect = async (mode: TestMode) => {
    const response = await startTest(mode);
    if (response) {
      router.replace('/test/session');
    }
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        <LoadingSpinner text={t('test.preparingQuestions')} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + 20,
          paddingBottom: Math.max(insets.bottom, 20) + 20,
        },
      ]}
    >
      {/* Back button */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <Text style={[styles.backText, { color: colors.textSecondary }]}>
          {t('common.back')}
        </Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <NeonText size={22}>{t('test.selectMode')}</NeonText>

        {/* Arcade Mode */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleSelect('ARCADE')}
        >
          <Card variant="elevated" style={styles.modeCard}>
            <Text style={styles.modeEmoji}>🎮</Text>
            <Text style={[styles.modeTitle, { color: colors.primary }]}>
              {t('test.arcade')}
            </Text>
            <Text style={[styles.modeDesc, { color: colors.textSecondary }]}>
              {t('test.arcadeDesc')}
            </Text>
          </Card>
        </TouchableOpacity>

        {/* Full Analysis */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleSelect('FULL_ANALYSIS')}
        >
          <Card variant="elevated" style={styles.modeCard}>
            <Text style={styles.modeEmoji}>🧬</Text>
            <Text style={[styles.modeTitle, { color: colors.secondary }]}>
              {t('test.fullAnalysis')}
            </Text>
            <Text style={[styles.modeDesc, { color: colors.textSecondary }]}>
              {t('test.fullAnalysisDesc')}
            </Text>
          </Card>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  backBtn: {
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  modeCard: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 24,
    width: '100%',
  },
  modeEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  modeTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 6,
  },
  modeDesc: {
    fontSize: 13,
    textAlign: 'center',
  },
});
