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
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { useThemeColors } from '../../theme';
import { useAuth } from '../../hooks/useAuth';
import { useGoogleAuth } from '../../services/google-auth.service';
import { Button, NeonText } from '../../components/ui';

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { login, googleLogin, loading, error } = useAuth();
  const { request, response, promptAsync } = useGoogleAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return;
    const success = await login({ email: email.trim(), password });
    if (success) {
      router.replace('/(tabs)/home');
    }
  };

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.params?.id_token;
      if (idToken) {
        handleGoogleLogin(idToken);
      }
    }
  }, [response]);

  const handleGoogleLogin = async (idToken: string) => {
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

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 40, paddingBottom: Math.max(insets.bottom, 20) + 40 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <NeonText size={36}>NeuralQ</NeonText>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t('auth.login')}
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
                placeholder="••••••••"
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

          <Button
            title={t('auth.login')}
            onPress={handleLogin}
            loading={loading}
            disabled={!email.trim() || !password.trim()}
            size="lg"
            style={styles.button}
          />

          {/* OR Divider */}
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.orText, { color: colors.textDim }]}>OR</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          {/* Google Sign-In */}
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
            onPress={() => router.push('/(auth)/register')}
            style={styles.switchLink}
          >
            <Text style={[styles.switchText, { color: colors.textSecondary }]}>
              {t('auth.dontHaveAccount')}{' '}
              <Text style={{ color: colors.primary, fontWeight: '600' }}>
                {t('auth.register')}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    marginBottom: 40,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
  },
  form: {
    gap: 16,
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
});
