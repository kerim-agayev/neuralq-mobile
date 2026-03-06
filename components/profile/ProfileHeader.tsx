import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { useThemeColors } from '../../theme';
import { useAuthStore } from '../../store/auth.store';
import { authService } from '../../services/auth.service';
import { COUNTRIES, Country } from '../../constants/countries';
import { User } from '../../types';

interface ProfileHeaderProps {
  user: User;
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const updateUser = useAuthStore((s) => s.updateUser);

  const [showEdit, setShowEdit] = useState(false);
  const [editUsername, setEditUsername] = useState(user.username);
  const [editCountry, setEditCountry] = useState(user.country || '');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [saving, setSaving] = useState(false);

  const initials = (user.displayName || user.username || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const selectedCountry = COUNTRIES.find((c) => c.code === editCountry);

  const filteredCountries = countrySearch.trim()
    ? COUNTRIES.filter(
        (c) =>
          c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
          c.code.toLowerCase().includes(countrySearch.toLowerCase()),
      )
    : COUNTRIES;

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await authService.updateProfile({
        username: editUsername.trim(),
        country: editCountry || null,
      } as Partial<User>);
      updateUser(updated);
      setShowEdit(false);
      Toast.show({ type: 'success', text1: t('common.save') });
    } catch {
      Toast.show({ type: 'error', text1: t('common.error') });
    } finally {
      setSaving(false);
    }
  };

  const renderCountryItem = ({ item }: { item: Country }) => (
    <TouchableOpacity
      style={[
        styles.countryItem,
        {
          backgroundColor: item.code === editCountry ? colors.primaryDim : 'transparent',
          borderColor: item.code === editCountry ? colors.primary : colors.border,
        },
      ]}
      onPress={() => {
        setEditCountry(item.code);
        setShowCountryPicker(false);
        setCountrySearch('');
      }}
    >
      <Text style={styles.countryFlag}>{item.flag}</Text>
      <Text style={[styles.countryName, { color: colors.text }]}>{item.name}</Text>
      <Text style={[styles.countryCode, { color: colors.textDim }]}>{item.code}</Text>
    </TouchableOpacity>
  );

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
              🎂 {user.age}
            </Text>
          </View>
        )}
      </View>

      {/* BP + NC + Streak row */}
      <View style={styles.coinsRow}>
        <View style={[styles.coinBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.coinValue, { color: colors.primary }]}>
            {'\uD83E\uDDE0'} {user.brainPoints ?? 0}
          </Text>
          <Text style={[styles.coinLabel, { color: colors.textDim }]}>BP</Text>
        </View>
        <View style={[styles.coinBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.coinValue, { color: colors.warning }]}>
            {'\uD83E\uDE99'} {user.neuralCoins ?? 0}
          </Text>
          <Text style={[styles.coinLabel, { color: colors.textDim }]}>NC</Text>
        </View>
        <View style={[styles.coinBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.coinValue, { color: colors.error }]}>
            {'\uD83D\uDD25'} {user.currentStreak ?? 0}
          </Text>
          <Text style={[styles.coinLabel, { color: colors.textDim }]}>Streak</Text>
        </View>
      </View>

      {/* Edit Profile Button */}
      <TouchableOpacity
        style={[styles.editBtn, { borderColor: colors.primary }]}
        onPress={() => {
          setEditUsername(user.username);
          setEditCountry(user.country || '');
          setShowEdit(true);
        }}
        activeOpacity={0.7}
      >
        <Text style={[styles.editBtnText, { color: colors.primary }]}>
          {t('profile.editProfile')}
        </Text>
      </TouchableOpacity>

      {/* Edit Modal */}
      <Modal visible={showEdit} animationType="slide" transparent onRequestClose={() => setShowEdit(false)}>
        <View style={[styles.modalOverlay, { paddingTop: insets.top }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => { setShowEdit(false); setShowCountryPicker(false); }}>
                <Text style={{ color: colors.textSecondary, fontSize: 15 }}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('profile.editProfile')}</Text>
              <TouchableOpacity onPress={handleSave} disabled={saving}>
                <Text style={{ color: colors.primary, fontSize: 15, fontWeight: '700', opacity: saving ? 0.5 : 1 }}>
                  {t('common.save')}
                </Text>
              </TouchableOpacity>
            </View>

            {showCountryPicker ? (
              <View style={{ flex: 1 }}>
                <TextInput
                  style={[styles.fieldInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, marginBottom: 8 }]}
                  placeholder={t('auth.searchCountry')}
                  placeholderTextColor={colors.textDim}
                  value={countrySearch}
                  onChangeText={setCountrySearch}
                  autoFocus
                />
                <FlatList
                  data={filteredCountries}
                  keyExtractor={(item) => item.code}
                  renderItem={renderCountryItem}
                  keyboardShouldPersistTaps="handled"
                  style={{ flex: 1 }}
                />
              </View>
            ) : (
              <View>
                {/* Username */}
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t('auth.username')}</Text>
                <TextInput
                  style={[styles.fieldInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                  value={editUsername}
                  onChangeText={setEditUsername}
                  autoCapitalize="none"
                />

                {/* Country */}
                <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 16 }]}>{t('auth.country')}</Text>
                <TouchableOpacity
                  style={[styles.fieldInput, styles.countryBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => setShowCountryPicker(true)}
                >
                  {selectedCountry ? (
                    <Text style={{ color: colors.text, fontSize: 15 }}>
                      {selectedCountry.flag} {selectedCountry.name}
                    </Text>
                  ) : (
                    <Text style={{ color: colors.textDim, fontSize: 15 }}>{t('auth.selectCountry')}</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
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
  coinsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  coinBadge: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  coinValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  coinLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  editBtn: {
    marginTop: 14,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    flex: 1,
    marginTop: 80,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginLeft: 4,
  },
  fieldInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  countryBtn: {
    justifyContent: 'center',
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 4,
    gap: 10,
  },
  countryFlag: {
    fontSize: 22,
  },
  countryName: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  countryCode: {
    fontSize: 13,
    fontWeight: '500',
  },
});
