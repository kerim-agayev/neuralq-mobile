import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useThemeColors } from '../../theme';

interface AnswerFeedbackProps {
  isCorrect: boolean;
  visible: boolean;
}

export default function AnswerFeedback({ isCorrect, visible }: AnswerFeedbackProps) {
  const colors = useThemeColors();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0.3);
      opacityAnim.setValue(0);

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [visible, scaleAnim, opacityAnim]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View
        style={[
          styles.circle,
          {
            backgroundColor: isCorrect
              ? colors.success + '22'
              : colors.error + '22',
            borderColor: isCorrect ? colors.success : colors.error,
          },
        ]}
      >
        <Text style={styles.emoji}>{isCorrect ? '✅' : '❌'}</Text>
        <Text
          style={[
            styles.label,
            { color: isCorrect ? colors.success : colors.error },
          ]}
        >
          {isCorrect ? 'Correct!' : 'Wrong'}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 36,
    marginBottom: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
});
