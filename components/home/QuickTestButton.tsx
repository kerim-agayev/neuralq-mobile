import React, { useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  View,
} from 'react-native';
import { useThemeColors } from '../../theme';
import { useTranslation } from 'react-i18next';

interface QuickTestButtonProps {
  onPress: () => void;
}

export default function QuickTestButton({ onPress }: QuickTestButtonProps) {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    );

    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.8,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.4,
          duration: 1200,
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
    <View style={styles.wrapper}>
      {/* Glow ring behind */}
      <Animated.View
        style={[
          styles.glowRing,
          {
            borderColor: colors.primary,
            opacity: glowAnim,
          },
        ]}
      />
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.8}
          style={[
            styles.button,
            {
              backgroundColor: colors.primary,
              shadowColor: colors.primary,
            },
          ]}
        >
          <Text style={styles.brain}>🧠</Text>
          <Text style={styles.label}>{t('home.startTest')}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },
  glowRing: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 2,
  },
  button: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
    elevation: 12,
  },
  brain: {
    fontSize: 40,
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0a0a0f',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
});
