import { create } from 'zustand';
import {
  TestQuestion,
  TestMode,
  StartTestResponse,
  AnswerResponse,
} from '../types';

interface RecordedAnswer {
  questionId: string;
  selectedAnswer: number | null;
  responseTimeMs: number;
  isCorrect: boolean;
}

interface TestState {
  sessionId: string | null;
  mode: TestMode | null;
  verbalSkipped: boolean;
  totalTime: number;
  questions: TestQuestion[];
  currentIndex: number;
  answers: RecordedAnswer[];
  streak: number;
  maxStreak: number;
  isActive: boolean;

  startSession: (data: StartTestResponse) => void;
  recordAnswer: (
    questionId: string,
    selected: number | null,
    timeMs: number,
    result: AnswerResponse,
  ) => void;
  nextQuestion: () => void;
  getCurrentQuestion: () => TestQuestion | null;
  isLastQuestion: () => boolean;
  resetSession: () => void;
}

const initialState = {
  sessionId: null,
  mode: null,
  verbalSkipped: false,
  totalTime: 0,
  questions: [],
  currentIndex: 0,
  answers: [],
  streak: 0,
  maxStreak: 0,
  isActive: false,
};

export const useTestStore = create<TestState>((set, get) => ({
  ...initialState,

  startSession: (data: StartTestResponse) =>
    set({
      sessionId: data.sessionId,
      mode: data.mode,
      verbalSkipped: data.verbalSkipped,
      totalTime: data.totalTime,
      questions: data.questions,
      currentIndex: 0,
      answers: [],
      streak: 0,
      maxStreak: 0,
      isActive: true,
    }),

  recordAnswer: (
    questionId: string,
    selected: number | null,
    timeMs: number,
    result: AnswerResponse,
  ) =>
    set((state) => {
      const newStreak = result.isCorrect ? state.streak + 1 : 0;
      return {
        answers: [
          ...state.answers,
          {
            questionId,
            selectedAnswer: selected,
            responseTimeMs: timeMs,
            isCorrect: result.isCorrect,
          },
        ],
        streak: newStreak,
        maxStreak: Math.max(state.maxStreak, newStreak),
      };
    }),

  nextQuestion: () =>
    set((state) => ({ currentIndex: state.currentIndex + 1 })),

  getCurrentQuestion: () => {
    const { questions, currentIndex } = get();
    return currentIndex < questions.length ? questions[currentIndex] : null;
  },

  isLastQuestion: () => {
    const { questions, currentIndex } = get();
    return currentIndex >= questions.length - 1;
  },

  resetSession: () => set(initialState),
}));
