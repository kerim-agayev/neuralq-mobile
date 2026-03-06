import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { useThemeColors } from '../../theme';
import { BADGE_INFO } from '../../constants/badges';

interface BadgeUnlockModalProps {
  badgeNames: string[];
  onClose: () => void;
}

export default function BadgeUnlockModal({ badgeNames, onClose }: BadgeUnlockModalProps) {
  const colors = useThemeColors();
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);

  const visible = badgeNames.length > 0;
  const currentBadge = badgeNames[currentIndex];
  const info = currentBadge ? BADGE_INFO[currentBadge] : null;
  const hasNext = currentIndex < badgeNames.length - 1;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0.3);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, currentIndex]);

  const handleNext = () => {
    if (hasNext) {
      setCurrentIndex((i) => i + 1);
    } else {
      setCurrentIndex(0);
      onClose();
    }
  };

  if (!visible || !info) return null;

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.primary,
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.emoji}>{info.emoji}</Text>
          <Text style={[styles.unlocked, { color: colors.primary }]}>Badge Unlocked!</Text>
          <Text style={[styles.title, { color: colors.text }]}>{info.title}</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {info.description}
          </Text>
          <Text style={[styles.reward, { color: colors.warning }]}>+5 NC</Text>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primaryDim, borderColor: colors.primary }]}
            onPress={handleNext}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, { color: colors.primary }]}>
              {hasNext ? 'Next Badge' : 'Awesome!'}
            </Text>
          </TouchableOpacity>

          {badgeNames.length > 1 && (
            <Text style={[styles.counter, { color: colors.textDim }]}>
              {currentIndex + 1} / {badgeNames.length}
            </Text>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  card: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 2,
    padding: 32,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  unlocked: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  reward: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 160,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  counter: {
    fontSize: 12,
    marginTop: 12,
  },
});
