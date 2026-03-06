export interface BadgeInfo {
  emoji: string;
  title: string;
  description: string;
}

export const BADGE_INFO: Record<string, BadgeInfo> = {
  first_test:     { emoji: '\uD83C\uDFAF', title: 'First Steps',       description: 'Completed first IQ test' },
  test_5:         { emoji: '\uD83D\uDD2C', title: 'Brain Warming Up',  description: 'Completed 5 tests' },
  test_25:        { emoji: '\uD83C\uDFC6', title: 'Test Master',       description: 'Completed 25 tests' },
  iq_120:         { emoji: '\uD83D\uDCA1', title: 'Sharp Mind',        description: 'Scored IQ 120+' },
  iq_140:         { emoji: '\uD83E\uDDEC', title: 'Genius',            description: 'Scored IQ 140+' },
  iq_160:         { emoji: '\u26A1',       title: 'Transcendent',      description: 'Scored IQ 160+' },
  streak_7:       { emoji: '\uD83D\uDD25', title: 'Weekly Brain',      description: '7-day daily streak' },
  streak_30:      { emoji: '\uD83D\uDC8E', title: 'Monthly Brain',     description: '30-day daily streak' },
  logic_master:   { emoji: '\uD83E\uDDEE', title: 'Logic Master',      description: '90+ in Logic' },
  spatial_master: { emoji: '\uD83C\uDFA8', title: 'Spatial Master',    description: '90+ in Spatial' },
  speed_master:   { emoji: '\u26A1',       title: 'Speed Demon',       description: '90+ in Speed' },
  top_100:        { emoji: '\uD83C\uDF0D', title: 'Elite 100',         description: 'Global top 100' },
  country_1:      { emoji: '\uD83C\uDFC5', title: 'National Champion', description: '#1 in country' },
};

export const ALL_BADGE_KEYS = Object.keys(BADGE_INFO);
