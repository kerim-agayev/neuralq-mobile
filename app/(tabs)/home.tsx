import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../../theme';
import { useAuthStore } from '../../store/auth.store';
import { NeonText } from '../../components/ui';

export default function HomeScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const displayName = user?.displayName || user?.username || 'User';

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top + 20 },
      ]}
    >
      <NeonText size={28}>NeuralQ</NeonText>
      <Text style={[styles.welcome, { color: colors.textSecondary }]}>
        Welcome, {displayName}!
      </Text>
      <Text style={[styles.placeholder, { color: colors.textDim }]}>
        Home screen — ADIM 5'te tamamlanacak
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  welcome: {
    fontSize: 16,
    marginTop: 12,
  },
  placeholder: {
    fontSize: 12,
    marginTop: 24,
  },
});
