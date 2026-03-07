import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { useThemeColors } from '../../theme';
import { useAuth } from '../../hooks/useAuth';
import { useGoogleAuth } from '../../services/google-auth.service';
import { useSettingsStore } from '../../store/settings.store';
import { COUNTRIES, Country } from '../../constants/countries';
import { Button, NeonText } from '../../components/ui';

export default function RegisterScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { register, googleLogin, loading, error } = useAuth();
  const { request, response, promptAsync } = useGoogleAuth();
  const language = useSettingsStore((s) => s.language);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [country, setCountry] = useState<string | undefined>(undefined);
  const [showPassword, setShowPassword] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  const selectedCountry = COUNTRIES.find((c) => c.code === country);

  const filteredCountries = countrySearch.trim()
    ? COUNTRIES.filter(
        (c) =>
          c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
          c.code.toLowerCase().includes(countrySearch.toLowerCase()),
      )
    : COUNTRIES;

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) return;
    const success = await register({
      username: username.trim(),
      email: email.trim(),
      password,
      age: age ? parseInt(age, 10) : undefined,
      country,
      language: language === 'other' ? 'en' : language,
    });
    if (success) {
      router.replace('/(tabs)/home');
    }
  };

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.params?.id_token;
      if (idToken) {
        handleGoogleSignUp(idToken);
      }
    }
  }, [response]);

  const handleGoogleSignUp = async (idToken: string) => {
    setGoogleLoading(true);
    try {
      const success = await googleLogin(idToken);
      if (success) {
        router.replace('/(tabs)/home');
      }
    } catch {
      Toast.show({ type: 'error', text1: t('auth.googleError') });
    } finally {
      setGoogleLoading(false);
    }
  };

  const isFormValid = username.trim() && email.trim() && password.trim() && password.length >= 8;

  const renderCountryItem = ({ item }: { item: Country }) => (
    <TouchableOpacity
      style={[
        styles.countryItem,
        {
          backgroundColor: item.code === country ? colors.primaryDim : 'transparent',
          borderColor: item.code === country ? colors.primary : colors.border,
        },
      ]}
      onPress={() => {
        setCountry(item.code);
        setShowCountryPicker(false);
        setCountrySearch('');
      }}
      activeOpacity={0.7}
    >
      <Text style={styles.countryFlag}>{item.flag}</Text>
      <Text style={[styles.countryName, { color: colors.text }]}>{item.name}</Text>
      <Text style={[styles.countryCode, { color: colors.textDim }]}>{item.code}</Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 20, paddingBottom: Math.max(insets.bottom, 20) + 40 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <NeonText size={36}>NeuralQ</NeonText>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t('auth.register')}
          </Text>
        </View>

        <View style={styles.form}>
          {error && (
            <View style={[styles.errorBox, { backgroundColor: colors.error + '20' }]}>
              <Text style={[styles.errorText, { color: colors.error }]}>
                {error}
              </Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              {t('auth.username')}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="neuralq_user"
              placeholderTextColor={colors.textDim}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              {t('auth.email')}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="email@example.com"
              placeholderTextColor={colors.textDim}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              {t('auth.password')}
            </Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  {
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Min 8 characters"
                placeholderTextColor={colors.textDim}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={[styles.eyeButton, { borderColor: colors.border }]}
              >
                <Text style={{ color: colors.textSecondary, fontSize: 16 }}>
                  {showPassword ? '🙈' : '👁️'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Age + Country side by side */}
          <View style={styles.rowFields}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                {t('auth.age')}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="25"
                placeholderTextColor={colors.textDim}
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
                maxLength={3}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1.5 }]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                {t('auth.country')}
              </Text>
              <TouchableOpacity
                style={[
                  styles.input,
                  styles.countryButton,
                  {
                    backgroundColor: colors.surface,
                    borderColor: country ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setShowCountryPicker(true)}
                activeOpacity={0.7}
              >
                {selectedCountry ? (
                  <Text style={{ color: colors.text, fontSize: 16 }}>
                    {selectedCountry.flag} {selectedCountry.code}
                  </Text>
                ) : (
                  <Text style={{ color: colors.textDim, fontSize: 14 }}>
                    {t('auth.selectCountry')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <Button
            title={t('auth.register')}
            onPress={handleRegister}
            loading={loading}
            disabled={!isFormValid}
            size="lg"
            style={styles.button}
          />

          {/* OR Divider */}
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.orText, { color: colors.textDim }]}>OR</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          {/* Google Sign-Up */}
          <TouchableOpacity
            style={[styles.googleButton, { borderColor: colors.border }]}
            onPress={() => promptAsync()}
            disabled={!request || googleLoading}
            activeOpacity={0.7}
          >
            {googleLoading ? (
              <ActivityIndicator size="small" color="#4285F4" />
            ) : (
              <>
                <Text style={styles.googleIcon}>G</Text>
                <Text style={[styles.googleText, { color: colors.text }]}>
                  {t('auth.continueWithGoogle')}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(auth)/login')}
            style={styles.switchLink}
          >
            <Text style={[styles.switchText, { color: colors.textSecondary }]}>
              {t('auth.alreadyHaveAccount')}{' '}
              <Text style={{ color: colors.primary, fontWeight: '600' }}>
                {t('auth.login')}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Country Picker Modal */}
      <Modal
        visible={showCountryPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <View style={[styles.modalOverlay, { paddingTop: insets.top }]}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.background, borderColor: colors.border },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {t('auth.selectCountry')}
              </Text>
              <TouchableOpacity onPress={() => { setShowCountryPicker(false); setCountrySearch(''); }}>
                <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '600' }}>
                  {t('common.done')}
                </Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={[
                styles.searchInput,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder={t('auth.searchCountry')}
              placeholderTextColor={colors.textDim}
              value={countrySearch}
              onChangeText={setCountrySearch}
              autoCorrect={false}
            />
            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item.code}
              renderItem={renderCountryItem}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
  },
  form: {
    gap: 14,
  },
  errorBox: {
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  passwordRow: {
    flexDirection: 'row',
    gap: 8,
  },
  passwordInput: {
    flex: 1,
  },
  eyeButton: {
    borderWidth: 1,
    borderRadius: 12,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowFields: {
    flexDirection: 'row',
    gap: 12,
  },
  countryButton: {
    justifyContent: 'center',
  },
  button: {
    marginTop: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  orText: {
    marginHorizontal: 12,
    fontSize: 13,
    fontWeight: '600',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 10,
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4285F4',
  },
  googleText: {
    fontSize: 16,
    fontWeight: '500',
  },
  switchLink: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  switchText: {
    fontSize: 14,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    flex: 1,
    marginTop: 60,
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
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 10,
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
