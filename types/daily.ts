export interface DailyChallenge {
  id: string;
  date: string;
  question: {
    id: string;
    category: string;
    content: string;
    imageUrl: string | null;
    options: Array<{ text: string; imageUrl?: string }>;
    timeLimit: number;
    difficultyLevel: number;
  };
  totalAttempts: number;
  correctAttempts: number;
  alreadyAttempted: boolean;
  userAnswer: {
    selectedAnswer: number;
    isCorrect: boolean;
    brainPointsEarned: number;
  } | null;
}

export interface DailyAttemptResponse {
  isCorrect: boolean;
  correctAnswer: number;
  explanation: string | null;
  brainPointsEarned: number;
  neuralCoinsEarned: number;
  streakBonus: number;
  streak: number;
  newBadges: string[];
}

export interface DailyStats {
  brainPoints: number;
  currentStreak: number;
  longestStreak: number;
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;
}
