// Matches the Figma Make export exactly (dark navy + gold accent theme).
export const colors = {
  bg: '#080E1A',
  surface: '#0D1625',
  surface2: '#131F33',
  border: '#1A2B44',
  gold: '#C9A84C',
  goldLight: '#E0C070',
  goldDim: 'rgba(201,168,76,0.15)',
  success: '#34D399',
  successDim: 'rgba(52,211,153,0.10)',
  warning: '#FBBF24',
  warningDim: 'rgba(251,191,36,0.10)',
  danger: '#F87171',
  dangerDim: 'rgba(248,113,113,0.10)',
  ink: '#EDF1FF',
  muted: '#5E7A9E',
  purple: '#A78BFA',
  blue: '#60A5FA',
} as const;

export const fonts = {
  regular: 'Cairo_400Regular',
  medium: 'Cairo_500Medium',
  semiBold: 'Cairo_600SemiBold',
  bold: 'Cairo_700Bold',
  extraBold: 'Cairo_800ExtraBold',
} as const;

export const radii = {
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
  huge: 24,
  pill: 100,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

// Deterministic per-user color/avatar so it stays stable regardless of list
// order. The three seeded brothers keep the exact Figma-assigned colors;
// anyone added later gets a stable pick from the same palette via a hash of
// their id.
const KNOWN_USER_COLORS: Record<string, string> = {
  'هاني': colors.blue,
  'حمادة': colors.purple,
  'معاذ': colors.gold,
  Hani: colors.blue,
  Hamada: colors.purple,
  Moath: colors.gold,
};

const FALLBACK_PALETTE = [colors.blue, colors.purple, colors.gold, colors.success, colors.warning, colors.danger];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function colorForUser(displayName: string, id: string): string {
  if (KNOWN_USER_COLORS[displayName]) return KNOWN_USER_COLORS[displayName];
  return FALLBACK_PALETTE[hashString(id) % FALLBACK_PALETTE.length];
}

export function initialOf(displayName: string): string {
  return displayName.trim().charAt(0);
}
