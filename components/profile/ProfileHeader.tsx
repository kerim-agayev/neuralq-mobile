import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../../theme';
import { User } from '../../types';

interface ProfileHeaderProps {
  user: User;
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  const colors = useThemeColors();

  const initials = (user.displayName || user.username || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={styles.container}>
      {/* Avatar circle */}
      <View
        style={[
          styles.avatar,
          {
            backgroundColor: colors.primaryDim,
            borderColor: colors.primary,
          },
        ]}
      >
        <Text style={[styles.initials, { color: colors.primary }]}>
          {initials}
        </Text>
      </View>

      {/* Name + email */}
      <Text style={[styles.name, { color: colors.text }]}>
        {user.displayName || user.username}
      </Text>
      <Text style={[styles.email, { color: colors.textSecondary }]}>
        {user.email}
      </Text>

      {/* Mini stats */}
      <View style={styles.statsRow}>
        {user.country && (
          <View style={[styles.statBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              🌍 {user.country}
            </Text>
          </View>
        )}
        {user.age && (
          <View style={[styles.statBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              🎂 {user.age} years
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  initials: {
    fontSize: 28,
    fontWeight: '700',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  email: {
    fontSize: 13,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  statText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
