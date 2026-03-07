import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '../../theme';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../../store/settings.store';
import { useAuthStore } from '../../store/auth.store';
import { LANGUAGES } from '../../constants/languages';
import i18n from '../../i18n';
import LanguagePickerModal from './LanguagePickerModal';

export default function SettingsSection() {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const router = useRouter();
  const { theme, setTheme, language, setLanguage } = useSettingsStore();
  const logout = useAuthStore((s) => s.logout);
  const [langModalVisible, setLangModalVisible] = useState(false);

  const handleThemeToggle = () => {
    setTheme(theme === 'cyberpunk' ? 'clean' : 'cyberpunk');
  };

  const handleLanguageSelect = (lang: string) => {
    setLanguage(lang);
    i18n.changeLanguage(lang === 'other' ? 'en' : lang);
    setLangModalVisible(false);
  };

  const handleLogout = () => {
    Alert.alert(t('auth.logout'), t('auth.logoutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('auth.logout'),
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.textSecondary }]}>
        {t('profile.settings')}
      </Text>

      {/* Theme toggle */}
      <TouchableOpacity
        style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={handleThemeToggle}
        activeOpacity={0.7}
      >
        <Text style={[styles.rowLabel, { color: colors.text }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
          🎨 {t('profile.theme')}
        </Text>
        <View style={[styles.badge, { backgroundColor: colors.primaryDim }]}>
          <Text style={[styles.badgeText, { color: colors.primary }]}>
            {theme === 'cyberpunk' ? t('profile.cyberpunk') : t('profile.clean')}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Language */}
      <TouchableOpacity
        style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => setLangModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.rowLabel, { color: colors.text }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
          🌐 {t('profile.language')}
        </Text>
        <View style={[styles.badge, { backgroundColor: colors.primaryDim }]}>
          <Text style={[styles.badgeText, { color: colors.primary }]}>
            {LANGUAGES.find((l) => l.value === language)?.flag}{' '}
            {language.toUpperCase()}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Language picker modal */}
      <LanguagePickerModal
        visible={langModalVisible}
        selectedLanguage={language}
        onSelect={handleLanguageSelect}
        onClose={() => setLangModalVisible(false)}
      />

      {/* Logout */}
      <TouchableOpacity
        style={[styles.row, styles.logoutRow, { borderColor: colors.error + '44' }]}
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <Text style={[styles.rowLabel, { color: colors.error }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
          🚪 {t('auth.logout')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  rowLabel: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  value: {
    fontSize: 13,
    fontWeight: '500',
  },
  logoutRow: {
    backgroundColor: 'transparent',
    marginTop: 8,
  },
});
