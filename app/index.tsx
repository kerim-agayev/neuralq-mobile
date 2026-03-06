import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/auth.store';
import { useThemeColors } from '../theme';
import { storage } from '../utils/storage';
import { NeonText, LoadingSpinner } from '../components/ui';

export default function SplashScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { loadAuth } = useAuthStore();

  useEffect(() => {
    const bootstrap = async () => {
      // Minimum splash duration for branding
      const minDelay = new Promise((r) => setTimeout(r, 1500));

      const [, isLoggedIn] = await Promise.all([minDelay, loadAuth()]);

      if (isLoggedIn) {
        router.replace('/(tabs)/home');
      } else {
        const onboarded = await storage.isOnboardingDone();
        if (onboarded) {
          router.replace('/(auth)/login');
        } else {
          router.replace('/(auth)/onboarding');
        }
      }
    };

    bootstrap();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <NeonText size={42}>NeuralQ</NeonText>
      <View style={styles.spinner}>
        <LoadingSpinner fullScreen={false} size="small" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    marginTop: 32,
  },
});
