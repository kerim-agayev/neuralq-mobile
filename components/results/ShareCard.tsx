import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import Button from '../ui/Button';
import { shareResult } from '../../utils/shareResult';
import { TestResult } from '../../types';

interface ShareCardProps {
  result: TestResult | null;
  onRetake: () => void;
}

export default function ShareCard({ result, onRetake }: ShareCardProps) {
  const { t } = useTranslation();
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    if (!result) return;
    setSharing(true);
    try {
      await shareResult(result);
    } catch {
      Toast.show({ type: 'error', text1: t('common.error') });
    } finally {
      setSharing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Button
        title={t('result.share')}
        onPress={handleShare}
        variant="outline"
        size="lg"
        style={styles.button}
        loading={sharing}
        disabled={!result}
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
