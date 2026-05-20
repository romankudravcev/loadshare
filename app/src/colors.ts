// Single source of truth for color values.
// Must stay in sync with tailwind.config.js — used for SVG props,
// inline styles on animated components, and dynamic opacity variants.

export const COLORS = {
  canvas:      '#F4EFE6',
  surface:     '#FBF7F2',
  surfaceAlt:  '#EFE9DD',
  ink:         '#2B2A26',
  inkSoft:     '#4A4843',
  muted:       '#8C8779',
  line:        'rgba(43,42,38,0.08)',
  lineStrong:  'rgba(43,42,38,0.18)',
  accent:      '#B8A88A',
  nudge:       '#7A8471',
  warn:        '#B76A4C',
  planner:     '#9EA88F',
  organizer:   '#C9A87C',
  reminder:    '#B8897A',
  executor:    '#8A9BA4',
} as const;

export type ColorKey = keyof typeof COLORS;
