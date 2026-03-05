import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useThemeColors } from '../../theme';
import { useTranslation } from 'react-i18next';
import Button from '../ui/Button';

interface ShareCardProps {
  iqScore: number;
  onRetake: () => void;
}

export default function ShareCard({ iqScore, onRetake }: ShareCardProps) {
  const colors = useThemeColors();
  const { t } = useTranslation();

  const handleShare = () => {
    Alert.alert(
      'Share',
      `My IQ score is ${iqScore}! Test yours on NeuralQ.`,
      [{ text: 'OK' }],
    );
  };

  return (
    <View style={styles.container}>
      <Button
        title={t('result.share')}
        onPress={handleShare}
        variant="outline"
        size="lg"
        style={styles.button}
      />
      <Button
        title={t('result.retake')}
        onPress={onRetake}
        variant="primary"
        size="lg"
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    marginTop: 8,
  },
  button: {
    width: '100%',
  },
});
