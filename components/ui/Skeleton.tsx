import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { useThemeColors } from '../../theme';

interface SkeletonProps {
  width: number | `${number}%`;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export default function Skeleton({
  width,
  height,
  borderRadius = 8,
  style,
}: SkeletonProps) {
  const colors = useThemeColors();
  const pulse = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.surfaceLight,
          opacity: pulse,
        },
        style,
      ]}
    />
  );
}

/** Pre-built skeleton layouts for common screen patterns */

export function HomeSkeleton() {
  const colors = useThemeColors();
  return (
    <View style={[skel.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={skel.center}>
        <Skeleton width={120} height={28} borderRadius={6} />
        <Skeleton width={180} height={14} borderRadius={4} style={{ marginTop: 10 }} />
      </View>
      {/* Stats row */}
      <View style={skel.row}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} width={72} height={64} borderRadius={12} />
        ))}
      </View>
      {/* Button placeholder */}
      <View style={skel.center}>
        <Skeleton width={200} height={56} borderRadius={28} style={{ marginTop: 16 }} />
      </View>
      {/* Card */}
      <Skeleton width="90%" height={140} borderRadius={16} style={{ marginTop: 24, alignSelf: 'center' }} />
    </View>
  );
}

export function LeaderboardSkeleton() {
  const colors = useThemeColors();
  return (
    <View style={[skel.container, { backgroundColor: colors.background }]}>
      {/* Tab bar */}
      <Skeleton width="90%" height={40} borderRadius={10} style={{ alignSelf: 'center', marginBottom: 16 }} />
      {/* List items */}
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Skeleton
          key={i}
          width="90%"
          height={56}
          borderRadius={12}
          style={{ alignSelf: 'center', marginBottom: 10 }}
        />
      ))}
    </View>
  );
}

export function ProfileSkeleton() {
  const colors = useThemeColors();
  return (
    <View style={[skel.container, { backgroundColor: colors.background }]}>
      {/* Avatar */}
      <View style={skel.center}>
        <Skeleton width={72} height={72} borderRadius={36} />
        <Skeleton width={140} height={18} borderRadius={4} style={{ marginTop: 12 }} />
        <Skeleton width={100} height={13} borderRadius={4} style={{ marginTop: 6 }} />
      </View>
      {/* History section */}
      <Skeleton width="90%" height={18} borderRadius={4} style={{ alignSelf: 'center', marginTop: 24 }} />
      {[1, 2, 3].map((i) => (
        <Skeleton
          key={i}
          width="90%"
          height={64}
          borderRadius={12}
          style={{ alignSelf: 'center', marginTop: 10 }}
        />
      ))}
    </View>
  );
}

const skel = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  center: {
    alignItems: 'center',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: 12,
  },
});
