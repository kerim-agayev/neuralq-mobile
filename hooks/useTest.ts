import { useState, useCallback } from 'react';
import { useTestStore } from '../store/test.store';
import { testService } from '../services/test.service';
import { TestMode } from '../types';
import { useSettingsStore } from '../store/settings.store';

export function useTest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const store = useTestStore();
  const language = useSettingsStore((s) => s.language);

  const startTest = useCallback(
    async (mode: TestMode) => {
      setLoading(true);
      setError(null);
      try {
        const verbalLang = language === 'other' ? 'en' : language;
        const response = await testService.startTest(mode, verbalLang);
        store.startSession(response);
        return response;
      } catch (err: any) {
        const msg =
          err.response?.data?.error || err.message || 'Failed to start test';
        setError(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [language, store],
  );

  const submitAnswer = useCallback(
    async (questionId: string, selectedAnswer: number | null, responseTimeMs: number) => {
      if (!store.sessionId) return null;
      try {
        const result = await testService.submitAnswer(store.sessionId, {
          questionId,
          selectedAnswer,
          responseTimeMs,
        });
        store.recordAnswer(questionId, selectedAnswer, responseTimeMs, result);
        return result;
      } catch (err: any) {
        // Store locally even if API fails
        store.recordAnswer(questionId, selectedAnswer, responseTimeMs, {
          isCorrect: false,
          correctAnswer: -1,
          explanation: null,
        });
        return null;
      }
    },
    [store],
  );

  const completeTest = useCallback(async () => {
    if (!store.sessionId) return null;
    setLoading(true);
    try {
      const result = await testService.completeTest(store.sessionId);
      return result;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to complete test');
      return null;
    } finally {
      setLoading(false);
    }
  }, [store]);

  return {
    loading,
    error,
    startTest,
    submitAnswer,
    completeTest,
  };
}
