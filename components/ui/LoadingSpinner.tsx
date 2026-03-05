import React, { useEffect, useRef } from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { useThemeColors } from '../../theme';

interface LoadingSpinnerProps {
  text?: string;
  size?: 'small' | 'large';
  fullScreen?: boolean;
}

export default function LoadingSpinner({
  text,
  size = 'large',
  fullScreen = true,
}: LoadingSpinnerProps) {
  const colors = useThemeColors();
  const pulseAnim = useRef(new Animated.Value(0.6)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    glow.start();
    return () => {
      pulse.stop();
      glow.stop();
    };
  }, [pulseAnim, glowAnim]);

  return (
    <View
      style={[
        styles.container,
        fullScreen && styles.fullScreen,
        { backgroundColor: fullScreen ? colors.background : 'transparent' },
      ]}
    >
      {/* Outer glow ring */}
      <Animated.View
        style={[
          styles.glowRing,
          {
            borderColor: colors.primary,
            opacity: glowAnim,
          },
        ]}
      />
      <Animated.View style={{ opacity: pulseAnim }}>
        <View
          style={[
            styles.spinnerWrap,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              shadowColor: colors.primary,
            },
          ]}
        >
          <Text style={styles.brainEmoji}>🧠</Text>
          <ActivityIndicator size={size} color={colors.primary} />
        </View>
      </Animated.View>
      {text && (
        <Text
          style={[
            styles.text,
            {
              color: colors.primary,
              textShadowColor: colors.primary,
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 8,
            },
          ]}
        >
          {text}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  fullScreen: {
    flex: 1,
  },
  glowRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
  },
  spinnerWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
  brainEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  text: {
    marginTop: 20,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 1,
  },
});
