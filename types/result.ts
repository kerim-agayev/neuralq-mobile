import { TestMode, TestQuestion } from './question';

export interface TestResult {
  id: string;
  iqScore: number;
  zScore: number;
  rawScore: number;
  spatialScore: number | null;
  logicScore: number | null;
  verbalScore: number | null;
  memoryScore: number | null;
  speedScore: number | null;
  spatialPercentile: number | null;
  logicPercentile: number | null;
  verbalPercentile: number | null;
  memoryPercentile: number | null;
  speedPercentile: number | null;
  cognitiveAge: number | null;
  celebrityMatch: string | null;
  countryRank: number | null;
  globalRank: number | null;
  certificateUrl: string | null;
  completedAt: string;
}

export interface StartTestResponse {
  sessionId: string;
  mode: TestMode;
  verbalSkipped: boolean;
  totalTime: number;
  questions: TestQuestion[];
}

export interface AnswerResponse {
  isCorrect: boolean;
  correctAnswer: number;
  explanation: string | null;
}

export interface AnswerInput {
  questionId: string;
  selectedAnswer: number | null;
  responseTimeMs: number;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  displayName: string | null;
  iqScore: number;
  country: string | null;
  rank: number;
}
