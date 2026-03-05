import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../../theme';
import { useTranslation } from 'react-i18next';

interface ProgressIndicatorProps {
  current: number; // 1-based
  total: number;
  category?: string;
}

export default function ProgressIndicator({
  current,
  total,
  category,
}: ProgressIndicatorProps) {
  const colors = useThemeColors();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={[styles.counter, { color: colors.primary }]}>
        {t('test.question')} {current} {t('test.of')} {total}
      </Text>
      {category && (
        <View style={[styles.badge, { backgroundColor: colors.primaryDim }]}>
          <Text style={[styles.badgeText, { color: colors.primary }]}>
            {category}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  counter: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
