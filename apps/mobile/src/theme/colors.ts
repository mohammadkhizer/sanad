export const colors = {
  light: {
    // 60% Surfaces & backgrounds
    background: '#F8F5EE',
    surface: '#FFFFFF',
    surfaceElevated: '#EDE8DC',

    // 30% Headers, nav, cards
    primary: '#0F4C45',
    primaryDark: '#0A332E',
    primaryLight: '#186A61',

    // 10% Accents & badges (Antique Gold)
    accent: '#C9A227',
    accentDark: '#9E7E19',
    accentText: '#1F2933', // Dark text on gold for WCAG AA compliance

    // Typography
    text: '#1F2933',
    textSecondary: '#5C6A79',
    textMuted: '#8C9BA5',
    textInverse: '#FFFFFF',

    // Borders & dividers
    border: '#E2DCCF',
    borderStrong: '#C5BCAC',

    // Semantic
    success: '#2E7D5B',
    warning: '#D98E04',
    error: '#B3261E',
    info: '#2F6F9F',
  },
  dark: {
    // 60% Surfaces & backgrounds (Night Green)
    background: '#0E1512',
    surface: '#16221E',
    surfaceElevated: '#1D2D27',

    // 30% Headers, nav, cards
    primary: '#1B3B35',
    primaryDark: '#122824',
    primaryLight: '#2A584F',

    // 10% Accents & badges (Antique Gold)
    accent: '#C9A227',
    accentDark: '#9E7E19',
    accentText: '#1F2933',

    // Typography
    text: '#F2EFE6',
    textSecondary: '#A2B0A9',
    textMuted: '#687870',
    textInverse: '#0E1512',

    // Borders & dividers
    border: '#24342D',
    borderStrong: '#32473E',

    // Semantic
    success: '#38A169',
    warning: '#DD6B20',
    error: '#E53E3E',
    info: '#3182CE',
  },
} as const;

export type ThemeColors = typeof colors.light;

