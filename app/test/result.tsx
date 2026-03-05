import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useThemeColors } from '../../theme';
import { Button } from '../../components/ui';

export default function ResultScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + 40,
          paddingBottom: insets.bottom + 20,
        },
      ]}
    >
      <Text style={[styles.emoji]}>🎉</Text>
      <Text style={[styles.title, { color: colors.primary }]}>
        Test Complete!
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Results screen — ADIM 7'de tamamlanacak
      </Text>
      <Text style={[styles.sessionId, { color: colors.textDim }]}>
        Session: {sessionId}
      </Text>
      <Button
        title="Go Home"
        onPress={() => router.replace('/(tabs)/home')}
        style={{ marginTop: 32 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  sessionId: {
    fontSize: 11,
  },
});
