export interface CelebrityMatch {
  min: number;
  max: number;
  key: string;
  label: string;
  emoji: string;
}

export const CELEBRITY_MATCHES: CelebrityMatch[] = [
  { min: 55, max: 75, key: 'goldfish', label: 'A Goldfish', emoji: '🐠' },
  { min: 76, max: 85, key: 'patrick_star', label: 'Patrick Star', emoji: '⭐' },
  { min: 86, max: 95, key: 'homer_simpson', label: 'Homer Simpson', emoji: '🍩' },
  { min: 96, max: 105, key: 'average_joe', label: 'An Average Human', emoji: '🧑' },
  { min: 106, max: 115, key: 'hermione', label: 'Hermione Granger', emoji: '📚' },
  { min: 116, max: 125, key: 'tony_stark', label: 'Tony Stark', emoji: '🦾' },
  { min: 126, max: 139, key: 'sherlock', label: 'Sherlock Holmes', emoji: '🔍' },
  { min: 140, max: 159, key: 'rick_sanchez', label: 'Rick Sanchez', emoji: '🧪' },
  { min: 160, max: 195, key: 'doc_manhattan', label: 'Dr. Manhattan', emoji: '🔵' },
];

export function getCelebrityMatch(iqScore: number): CelebrityMatch {
  const match = CELEBRITY_MATCHES.find(
    (c) => iqScore >= c.min && iqScore <= c.max,
  );
  return match || CELEBRITY_MATCHES[3]; // default: Average Human
}
