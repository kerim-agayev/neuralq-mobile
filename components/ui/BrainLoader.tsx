import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { useThemeColors } from '../../theme';

interface BrainLoaderProps {
  message: string;
  overlay?: boolean;
}

export default function BrainLoader({ message, overlay = false }: BrainLoaderProps) {
  const colors = useThemeColors();
  const { width } = useWindowDimensions();
  const circleSize = Math.min(width * 0.28, 120);
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
    <View style={[
      styles.container,
      overlay ? [styles.overlay, { backgroundColor: colors.background + 'EE' }] : { backgroundColor: colors.background },
    ]}>
      {/* Outer glow ring */}
      <Animated.View
        style={[
          styles.glowRing,
          {
            width: circleSize + 30,
            height: circleSize + 30,
            borderRadius: (circleSize + 30) / 2,
            borderColor: colors.primary,
            opacity: glowAnim,
          },
        ]}
      />

      {/* Circle with brain + spinner inside */}
      <Animated.View style={{ opacity: pulseAnim }}>
        <View
          style={[
            styles.circle,
            {
              width: circleSize,
              height: circleSize,
              borderRadius: circleSize / 2,
              borderColor: colors.primary,
              backgroundColor: colors.surface,
              shadowColor: colors.primary,
            },
          ]}
        >
          <Text style={{ fontSize: circleSize * 0.3 }}>🧠</Text>
          <ActivityIndicator
            size="small"
            color={colors.primary}
            style={{ marginTop: 4 }}
          />
        </View>
      </Animated.View>

      {/* Message text — outside the circle */}
      <Text
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.5}
        style={[
          styles.message,
          {
            color: colors.primary,
            maxWidth: width * 0.7,
            textShadowColor: colors.primary,
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 8,
          },
        ]}
      >
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  glowRing: {
    position: 'absolute',
    borderWidth: 2,
  },
  circle: {
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
  message: {
    marginTop: 20,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 1,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});
