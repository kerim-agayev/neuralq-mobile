import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useThemeColors } from '../../theme';
import { useTranslation } from 'react-i18next';

interface IQRevealProps {
  iqScore: number;
}

export default function IQReveal({ iqScore }: IQRevealProps) {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const countAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const displayValue = useRef(0);
  const [displayScore, setDisplayScore] = React.useState(0);

  useEffect(() => {
    // Fade + scale in
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Count up animation
    countAnim.setValue(0);
    Animated.timing(countAnim, {
      toValue: iqScore,
      duration: 1500,
      useNativeDriver: false,
    }).start();

    const listener = countAnim.addListener(({ value }) => {
      const rounded = Math.round(value);
      if (rounded !== displayValue.current) {
        displayValue.current = rounded;
        setDisplayScore(rounded);
      }
    });

    return () => countAnim.removeListener(listener);
  }, [iqScore]);

  // IQ color based on score
  const getScoreColor = () => {
    if (iqScore >= 140) return '#bf00ff'; // purple - genius
    if (iqScore >= 120) return colors.success;
    if (iqScore >= 100) return colors.primary;
    if (iqScore >= 85) return colors.warning;
    return colors.error;
  };

  const scoreColor = getScoreColor();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        {t('result.yourIQ')}
      </Text>
      <View
        style={[
          styles.scoreCircle,
          {
            borderColor: scoreColor,
            shadowColor: scoreColor,
          },
        ]}
      >
        <Text
          style={[
            styles.score,
            {
              color: scoreColor,
              textShadowColor: scoreColor,
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 15,
            },
          ]}
        >
          {displayScore}
        </Text>
        <Text style={[styles.iqLabel, { color: colors.textDim }]}>IQ</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 12,
  },
  scoreCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  score: {
    fontSize: 52,
    fontWeight: '800',
    letterSpacing: 2,
  },
  iqLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: -6,
  },
});
