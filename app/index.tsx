import { View, Text, StyleSheet } from 'react-native';

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>NeuralQ</Text>
      <Text style={styles.subtitle}>IQ Test Platform</Text>
      <Text style={styles.version}>SDK 54 - Standalone Mobile</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0f',
  },
  title: {
    color: '#00f5ff',
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
  subtitle: {
    color: '#8888aa',
    fontSize: 16,
    marginTop: 8,
  },
  version: {
    color: '#555577',
    fontSize: 12,
    marginTop: 24,
  },
});
