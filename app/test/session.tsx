import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  BackHandler,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from '../../theme';
import { useTestStore } from '../../store/test.store';
import { useTest } from '../../hooks/useTest';
import { useTimer } from '../../hooks/useTimer';
import { useHaptic } from '../../hooks/useHaptic';
import { LoadingSpinner } from '../../components/ui';
import QuestionCard from '../../components/test/QuestionCard';
import MixedOptions from '../../components/test/MixedOptions';
import TimerBar from '../../components/test/TimerBar';
import ProgressIndicator from '../../components/test/ProgressIndicator';
import StreakCounter from '../../components/test/StreakCounter';
import AnswerFeedback from '../../components/test/AnswerFeedback';

const FEEDBACK_DURATION = 800; // ms to show correct/wrong

export default function TestSessionScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const haptic = useHaptic();

  // Store
  const questions = useTestStore((s) => s.questions);
  const currentIndex = useTestStore((s) => s.currentIndex);
  const streak = useTestStore((s) => s.streak);
  const isActive = useTestStore((s) => s.isActive);
  const nextQuestion = useTestStore((s) => s.nextQuestion);
  const isLastQuestionFn = useTestStore((s) => s.isLastQuestion);

  // Current question
  const question = questions[currentIndex] ?? null;
  const totalQuestions = questions.length;

  // Hook
  const { submitAnswer, completeTest, loading } = useTest();

  // Local state
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackCorrect, setFeedbackCorrect] = useState(false);
  const [answering, setAnswering] = useState(false);

  // Timer — each question has its own timeLimit
  const handleTimeUp = useCallback(() => {
    if (answering) return;
    // Auto-submit null (timeout)
    handleAnswer(null);
  }, [answering]);

  const timer = useTimer({
    duration: question?.timeLimit ?? 30,
    onTimeUp: handleTimeUp,
  });

  // Start timer for current question
  useEffect(() => {
    if (question && isActive) {
      setSelectedIndex(null);
      setCorrectIndex(null);
      setFeedbackVisible(false);
      setAnswering(false);
      timer.reset(question.timeLimit);
    }
  }, [currentIndex, question?.id]);

  // Prevent back navigation during test
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      confirmQuit();
      return true;
    });
    return () => backHandler.remove();
  }, []);

  const confirmQuit = () => {
    Alert.alert(
      'Quit Test?',
      'Your progress will be lost. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Quit',
          style: 'destructive',
          onPress: () => {
            useTestStore.getState().resetSession();
            router.replace('/(tabs)/home');
          },
        },
      ],
    );
  };

  async function handleAnswer(index: number | null) {
    if (answering || !question) return;
    setAnswering(true);
    timer.clear();

    const elapsed = timer.getElapsedMs();
    setSelectedIndex(index);

    // Submit to backend
    const result = await submitAnswer(question.id, index, elapsed);

    // Show feedback
    const isCorrect = result?.isCorrect ?? false;
    const correct = result?.correctAnswer ?? null;

    setCorrectIndex(correct);
    setFeedbackCorrect(isCorrect);
    setFeedbackVisible(true);

    if (isCorrect) {
      haptic.correctFeedback();
    } else {
      haptic.wrongFeedback();
    }

    // Wait, then advance
    setTimeout(() => {
      setFeedbackVisible(false);

      if (isLastQuestionFn()) {
        // Test is done — complete and go to results
        finishTest();
      } else {
        nextQuestion();
      }
    }, FEEDBACK_DURATION);
  }

  async function finishTest() {
    const result = await completeTest();
    const sessionId = useTestStore.getState().sessionId;
    useTestStore.getState().resetSession();

    if (result) {
      router.replace({
        pathname: '/test/result',
        params: { sessionId },
      });
    } else {
      // Fallback: go home if complete fails
      router.replace('/(tabs)/home');
    }
  }

  // Guard: no questions loaded
  if (!question || !isActive) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: colors.background, paddingTop: insets.top },
        ]}
      >
        <LoadingSpinner text={t('common.loading')} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + 10,
          paddingBottom: insets.bottom + 10,
        },
      ]}
    >
      {/* Top bar: progress + streak */}
      <View style={styles.topBar}>
        <ProgressIndicator
          current={currentIndex + 1}
          total={totalQuestions}
          category={question.category}
        />
      </View>

      {/* Timer bar */}
      <View style={styles.timerWrap}>
        <TimerBar progress={timer.progress} />
        <Text style={[styles.timeText, { color: colors.textDim }]}>
          {Math.ceil(timer.remaining)}s
        </Text>
      </View>

      {/* Streak */}
      <StreakCounter streak={streak} />

      {/* Question + Options */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <QuestionCard question={question} />

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

      {/* Answer Feedback overlay */}
      <AnswerFeedback isCorrect={feedbackCorrect} visible={feedbackVisible} />

      {/* Loading overlay for completion */}
      {loading && (
        <View style={[styles.loadingOverlay, { backgroundColor: colors.background + 'EE' }]}>
          <LoadingSpinner text={t('test.submitting')} fullScreen={false} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  topBar: {
    marginBottom: 8,
  },
  timerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'right',
  },
  scrollArea: {
    flex: 1,
    marginTop: 8,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
});
