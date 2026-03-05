export type QuestionCategory = 'SPATIAL' | 'LOGIC' | 'VERBAL' | 'MEMORY' | 'SPEED';

export type TestMode = 'ARCADE' | 'FULL_ANALYSIS';

export interface QuestionOption {
  text: string;
  imageUrl?: string;
}

export interface TestQuestion {
  id: string;
  category: QuestionCategory;
  content: string;
  imageUrl: string | null;
  options: QuestionOption[];
  timeLimit: number;
}
