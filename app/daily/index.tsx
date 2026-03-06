import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { useThemeColors } from '../../theme';
import { dailyService } from '../../services/daily.service';
import { useTimer } from '../../hooks/useTimer';
import { useHaptic } from '../../hooks/useHaptic';
import QuestionCard from '../../components/test/QuestionCard';
import MixedOptions from '../../components/test/MixedOptions';
import TimerBar from '../../components/test/TimerBar';
import AnswerFeedback from '../../components/test/AnswerFeedback';
import BadgeUnlockModal from '../../components/badges/BadgeUnlockModal';
import { DailyChallenge, DailyAttemptResponse } from '../../types';

type ScreenState = 'loading' | 'question' | 'result' | 'already_done' | 'error';

export default function DailyChallengeScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const haptic = useHaptic();

  const [state, setState] = useState<ScreenState>('loading');
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [attemptResult, setAttemptResult] = useState<DailyAttemptResponse | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackCorrect, setFeedbackCorrect] = useState(false);
  const [answering, setAnswering] = useState(false);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const startTimeRef = useRef<number>(0);

  // Timer
  const handleTimeUp = useCallback(() => {
    if (answering) return;
    handleAnswer(null);
  }, [answering]);

  const timer = useTimer({
    duration: challenge?.question?.timeLimit ?? 30,
    onTimeUp: handleTimeUp,
  });

  // Fetch today's challenge
  useEffect(() => {
    fetchChallenge();
  }, []);

  const fetchChallenge = async () => {
    setState('loading');
    try {
      const data = await dailyService.getToday();
      setChallenge(data);
      if (data.alreadyAttempted) {
        setState('already_done');
      } else {
        setState('question');
        startTimeRef.current = Date.now();
      }
    } catch {
      setState('error');
    }
  };

  // Start timer when question is shown
  useEffect(() => {
    if (state === 'question' && challenge?.question) {
      timer.reset(challenge.question.timeLimit);
    }
  }, [state, challenge?.question?.id]);

  async function handleAnswer(index: number | null) {
    if (answering || !challenge) return;
    setAnswering(true);
    timer.clear();

    const responseTimeMs = Date.now() - startTimeRef.current;
    setSelectedIndex(index);

    try {
      const result = await dailyService.submitAttempt({
        selectedAnswer: index ?? -1,
        responseTimeMs,
      });
      setAttemptResult(result);
      setCorrectIndex(result.correctAnswer);
      setFeedbackCorrect(result.isCorrect);
      setFeedbackVisible(true);

      if (result.isCorrect) {
        haptic.correctFeedback();
      } else {
        haptic.wrongFeedback();
      }

      if (result.newBadges && result.newBadges.length > 0) {
        setUnlockedBadges(result.newBadges);
      }

      // Show feedback briefly, then show result screen
      setTimeout(() => {
        setFeedbackVisible(false);
        setState('result');
      }, 1000);
    } catch {
      Toast.show({ type: 'error', text1: t('common.error') });
      setAnswering(false);
    }
  }

  const totalAttempts = challenge?.totalAttempts ?? 0;
  const correctRate = totalAttempts > 0
    ? Math.round(((challenge?.correctAttempts ?? 0) / totalAttempts) * 100)
    : 0;

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // === LOADING ===
  if (state === 'loading') {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // === ERROR ===
  if (state === 'error') {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <Text style={[styles.errorEmoji]}>{'🧠'}</Text>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>
          {t('daily.noChallenge')}
        </Text>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.primaryDim, borderColor: colors.primary }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.backBtnText, { color: colors.primary }]}>{t('common.goBack')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // === ALREADY DONE ===
  if (state === 'already_done' && challenge) {
    const userAnswer = challenge.userAnswer;
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16, paddingBottom: Math.max(insets.bottom, 20) + 40 },
        ]}
      >
        <TouchableOpacity style={styles.navBack} onPress={() => router.back()}>
          <Text style={[styles.navBackArrow, { color: colors.primary }]}>{'‹'}</Text>
          <Text style={[styles.navBackText, { color: colors.primary }]}>{t('common.back')}</Text>
        </TouchableOpacity>

        <View style={styles.doneHeader}>
          <Text style={styles.doneEmoji}>{userAnswer?.isCorrect ? '\u2705' : '\u274C'}</Text>
          <Text style={[styles.doneTitle, { color: colors.text }]}>
            {t('daily.alreadyDone')}
          </Text>
          {userAnswer && (
            <Text style={[styles.doneSubtext, { color: colors.textSecondary }]}>
              {userAnswer.isCorrect ? t('daily.correct') : t('daily.incorrect')}
              {' \u2022 '}+{userAnswer.brainPointsEarned} BP
            </Text>
          )}
        </View>

        {/* Stats */}
        <View style={[styles.statsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.statRow}>
            <Text style={styles.statEmoji}>{'\uD83D\uDCCA'}</Text>
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {t('daily.gotItRight', { percent: correctRate })}
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statEmoji}>{'\uD83D\uDC65'}</Text>
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {t('daily.peopleAttempted', { count: totalAttempts })}
            </Text>
          </View>
        </View>

        <Text style={[styles.comeBack, { color: colors.textDim }]}>
          {t('daily.comeBackTomorrow')}
        </Text>

        <TouchableOpacity
          style={[styles.homeBtn, { backgroundColor: colors.primaryDim, borderColor: colors.primary }]}
          onPress={() => router.replace('/(tabs)/home')}
        >
          <Text style={[styles.homeBtnText, { color: colors.primary }]}>{t('common.goBack')}</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // === RESULT (just answered) ===
  if (state === 'result' && attemptResult) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16, paddingBottom: Math.max(insets.bottom, 20) + 40 },
        ]}
      >
        <View style={styles.resultHeader}>
          <Text style={styles.resultEmoji}>
            {attemptResult.isCorrect ? '\u2705' : '\u274C'}
          </Text>
          <Text style={[styles.resultTitle, { color: attemptResult.isCorrect ? colors.success : colors.error }]}>
            {attemptResult.isCorrect ? t('daily.correct') : t('daily.incorrect')}
          </Text>
        </View>

        {/* Points earned */}
        <View style={[styles.rewardsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.rewardRow}>
            <Text style={styles.rewardEmoji}>{'\uD83E\uDDE0'}</Text>
            <Text style={[styles.rewardText, { color: colors.text }]}>
              {t('daily.pointsEarned', { points: attemptResult.brainPointsEarned })}
            </Text>
          </View>
          <View style={styles.rewardRow}>
            <Text style={styles.rewardEmoji}>{'\uD83E\uDE99'}</Text>
            <Text style={[styles.rewardText, { color: colors.text }]}>
              {t('daily.coinsEarned', { coins: attemptResult.neuralCoinsEarned })}
            </Text>
          </View>
          {attemptResult.streakBonus > 0 && (
            <View style={styles.rewardRow}>
              <Text style={styles.rewardEmoji}>{'\uD83C\uDF81'}</Text>
              <Text style={[styles.rewardText, { color: colors.warning }]}>
                +{attemptResult.streakBonus} NC streak bonus!
              </Text>
            </View>
          )}
        </View>

        {/* Explanation */}
        {attemptResult.explanation && (
          <View style={[styles.explanationCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.explanationLabel, { color: colors.textDim }]}>Explanation</Text>
            <Text style={[styles.explanationText, { color: colors.text }]}>
              {attemptResult.explanation}
            </Text>
          </View>
        )}

        {/* Community stats */}
        <View style={[styles.statsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.statRow}>
            <Text style={styles.statEmoji}>{'\uD83D\uDCCA'}</Text>
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {t('daily.gotItRight', { percent: correctRate })}
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statEmoji}>{'\uD83D\uDD25'}</Text>
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {t('daily.streakDays', { count: attemptResult.streak })}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.homeBtn, { backgroundColor: colors.primaryDim, borderColor: colors.primary }]}
          onPress={() => router.replace('/(tabs)/home')}
        >
          <Text style={[styles.homeBtnText, { color: colors.primary }]}>{t('common.goBack')}</Text>
        </TouchableOpacity>

        <BadgeUnlockModal
          badgeNames={unlockedBadges}
          onClose={() => setUnlockedBadges([])}
        />
      </ScrollView>
    );
  }

  // === QUESTION ===
  if (state === 'question' && challenge) {
    const question = challenge.question;
    // Map to TestQuestion format for QuestionCard reuse
    const testQuestion = {
      id: question.id,
      category: question.category as 'LOGIC' | 'SPATIAL' | 'VERBAL' | 'MEMORY' | 'SPEED',
      content: question.content,
      imageUrl: question.imageUrl,
      options: question.options,
      timeLimit: question.timeLimit,
    };

    return (
      <View
        style={[
          styles.questionContainer,
          {
            backgroundColor: colors.background,
            paddingTop: insets.top + 12,
            paddingBottom: Math.max(insets.bottom, 20) + 20,
          },
        ]}
      >
        {/* Header */}
        <View style={styles.questionHeader}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.navBackArrow, { color: colors.primary }]}>{'‹'}</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t('daily.title')}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Date + community stats */}
        <View style={styles.dateRow}>
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>{today}</Text>
          {totalAttempts > 0 && (
            <Text style={[styles.communityText, { color: colors.textDim }]}>
              {totalAttempts} players {'\u2022'} {correctRate}% correct
            </Text>
          )}
        </View>

        {/* Timer */}
        <View style={styles.timerWrap}>
          <TimerBar progress={timer.progress} />
          <Text style={[styles.timeText, { color: colors.textDim }]}>
            {Math.ceil(timer.remaining)}s
          </Text>
        </View>

        {/* Question + Options */}
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <QuestionCard question={testQuestion} />
          <MixedOptions
            options={question.options}
            selectedIndex={selectedIndex}
            correctIndex={correctIndex}
            disabled={answering}
            onSelect={(i) => {
              haptic.tapFeedback();
              handleAnswer(i);
            }}
          />
        </ScrollView>

        {/* Answer feedback overlay */}
        <AnswerFeedback isCorrect={feedbackCorrect} visible={feedbackVisible} />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  // Nav back
  navBack: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  navBackArrow: {
    fontSize: 28,
    fontWeight: '300',
    marginRight: 4,
  },
  navBackText: {
    fontSize: 15,
    fontWeight: '600',
  },
  // Error
  errorEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  backBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  backBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  // Already done
  doneHeader: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 20,
  },
  doneEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  doneTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  doneSubtext: {
    fontSize: 15,
    marginTop: 6,
  },
  comeBack: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  // Stats card
  statsCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 12,
    marginTop: 16,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statEmoji: {
    fontSize: 18,
  },
  statText: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Result
  resultHeader: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 24,
  },
  resultEmoji: {
    fontSize: 56,
    marginBottom: 8,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  // Rewards
  rewardsCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rewardEmoji: {
    fontSize: 20,
  },
  rewardText: {
    fontSize: 15,
    fontWeight: '600',
  },
  // Explanation
  explanationCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginTop: 16,
  },
  explanationLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 20,
  },
  // Home button
  homeBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 24,
  },
  homeBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Question state
  questionContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  dateRow: {
    alignItems: 'center',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
  },
  communityText: {
    fontSize: 12,
    marginTop: 2,
  },
  timerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'right',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
});
