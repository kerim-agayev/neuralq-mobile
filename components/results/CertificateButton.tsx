import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import Button from '../ui/Button';
import { testService } from '../../services/test.service';

interface CertificateButtonProps {
  resultId: string;
}

export default function CertificateButton({ resultId }: CertificateButtonProps) {
  const { t } = useTranslation();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await testService.downloadCertificate(resultId);
    } catch {
      Toast.show({ type: 'error', text1: t('result.certificateError') });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Button
        title={t('result.downloadCertificate')}
        onPress={handleDownload}
        variant="secondary"
        size="lg"
        style={styles.button}
        loading={downloading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
  },
  button: {
    width: '100%',
  },
});
