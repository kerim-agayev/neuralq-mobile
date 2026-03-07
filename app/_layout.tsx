import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import ErrorBoundary from '../components/ErrorBoundary';
import { useSettingsStore } from '../store/settings.store';
import i18n from '../i18n';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

export default function RootLayout() {
  const { loadSettings, isSettingsLoaded } = useSettingsStore();
  const theme = useSettingsStore((s) => s.theme);
  const language = useSettingsStore((s) => s.language);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadSettings().then(() => setReady(true));
  }, []);

  // Sync i18n language with settings store
  // 'other' has no locale file — use English UI
  useEffect(() => {
    const uiLang = language === 'other' ? 'en' : language;
    if (uiLang && i18n.language !== uiLang) {
      i18n.changeLanguage(uiLang);
    }
  }, [language]);

  if (!ready || !isSettingsLoaded) {
    return (
      <View style={[styles.root, styles.splash]}>
        <ActivityIndicator size="large" color="#00f5ff" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <GestureHandlerRootView style={styles.root}>
          <QueryClientProvider client={queryClient}>
            <StatusBar style={theme === 'cyberpunk' ? 'light' : 'dark'} />
            <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
            <Toast />
          </QueryClientProvider>
        </GestureHandlerRootView>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  splash: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0f' },
});
