import { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from '../../theme';
import { useSettingsStore } from '../../store/settings.store';
import { storage } from '../../utils/storage';
import i18n from '../../i18n';
import { Button } from '../../components/ui';
import OnboardingSlide from '../../components/onboarding/OnboardingSlide';
import LanguageSelector from '../../components/onboarding/LanguageSelector';

export default function OnboardingScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { language, setLanguage } = useSettingsStore();
  const scrollRef = useRef<ScrollView>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const slides = [
    {
      emoji: '🧠',
      title: t('onboarding.slide1Title'),
      description: t('onboarding.slide1Desc'),
    },
    {
      emoji: '🌍',
      title: t('onboarding.slide2Title'),
      description: t('onboarding.slide2Desc'),
    },
  ];

  const totalPages = 3;

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentPage(page);
  };

  const goNext = () => {
    if (currentPage < totalPages - 1) {
      scrollRef.current?.scrollTo({
        x: (currentPage + 1) * width,
        animated: true,
      });
    }
  };

  const handleGetStarted = async () => {
    await storage.setOnboardingDone();
    router.replace('/(auth)/register');
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        bounces={false}
      >
        {/* Slide 1 & 2 */}
        {slides.map((slide, i) => (
          <OnboardingSlide
            key={i}
            emoji={slide.emoji}
            title={slide.title}
            description={slide.description}
          />
        ))}

        {/* Slide 3: Language selector — vertical scroll for small screens */}
        <ScrollView
          style={{ width }}
          contentContainerStyle={styles.langSlide}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Text style={styles.langEmoji}>🗣️</Text>
          <Text style={[styles.langTitle, { color: colors.primary }]}>
            {t('onboarding.slide3Title')}
          </Text>
          <Text style={[styles.langDesc, { color: colors.textSecondary }]}>
            {t('onboarding.slide3Desc')}
          </Text>
          <View style={styles.langGrid}>
            <LanguageSelector
              selected={language}
              onSelect={(lang) => {
                setLanguage(lang);
                i18n.changeLanguage(lang === 'other' ? 'en' : lang);
              }}
            />
          </View>
          <View style={styles.startButton}>
            <Button
              title={t('onboarding.getStarted')}
              onPress={handleGetStarted}
              size="lg"
            />
          </View>
        </ScrollView>
      </ScrollView>

      {/* Dots + Next button */}
      <View
        style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}
      >
        <View style={styles.dots}>
          {Array.from({ length: totalPages }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    i === currentPage ? colors.primary : colors.border,
                  width: i === currentPage ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>
        {currentPage < totalPages - 1 && (
          <Button title={t('common.next')} onPress={goNext} variant="ghost" />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  langSlide: {
    paddingTop: 48,
    paddingBottom: 80,
    alignItems: 'center',
  },
  langEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  langTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 1,
  },
  langDesc: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 32,
  },
  langGrid: {
    width: '100%',
  },
  startButton: {
    paddingHorizontal: 32,
    marginTop: 20,
    width: '100%',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
