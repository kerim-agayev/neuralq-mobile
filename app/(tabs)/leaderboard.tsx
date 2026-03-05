import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../../theme';

export default function LeaderboardScreen() {
  const colors = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.text, { color: colors.textSecondary }]}>
        Leaderboard — ADIM 8'de tamamlanacak
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 14 },
});
