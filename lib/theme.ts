export const colors = {
  primary: '#22C55E',
  primaryLight: '#F0FDF4',
  primaryDark: '#16A34A',
  primaryBorder: '#DCFCE7',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceSecondary: '#F8FAFC',
  muted: '#F1F5F9',
  text: '#1a1a2e',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  textMuted: '#CBD5E1',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  error: '#EF4444',
  errorLight: '#FEF2F2',
  errorDark: '#DC2626',
  success: '#22C55E',
  successDark: '#15803D',
  warning: '#F59E0B',
  info: '#3B82F6',
  overlay: 'rgba(0,0,0,0.5)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const typography = {
  h1: { fontSize: 24, fontWeight: '700' as const, color: colors.text },
  h2: { fontSize: 20, fontWeight: '700' as const, color: colors.text },
  h3: { fontSize: 18, fontWeight: '600' as const, color: colors.text },
  body: { fontSize: 14, fontWeight: '400' as const, color: colors.text },
  bodySmall: { fontSize: 13, fontWeight: '400' as const, color: colors.textSecondary },
  caption: { fontSize: 12, fontWeight: '400' as const, color: colors.textTertiary },
  captionSmall: { fontSize: 11, fontWeight: '400' as const, color: colors.textTertiary },
  label: { fontSize: 14, fontWeight: '600' as const, color: colors.text },
  labelSmall: { fontSize: 12, fontWeight: '500' as const, color: colors.textSecondary },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
};
