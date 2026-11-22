export interface AppTheme {
  dark: boolean;
  colors: {
    background: string;
    surface: string;
    surfaceAlt: string;
    primary: string;
    primarySoft: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    danger: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
    pill: number;
  };
}

export const LightTheme: AppTheme = {
  dark: false,
  colors: {
    background: "#F8FAFC",
    surface: "#FFFFFF",
    surfaceAlt: "#F1F5F9",
    primary: "#2563EB",
    primarySoft: "#EFF6FF",
    text: "#0F172A",
    textSecondary: "#64748B",
    border: "#E2E8F0",
    success: "#16A34A",
    warning: "#F59E0B",
    danger: "#DC2626",
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  radius: { sm: 8, md: 12, lg: 20, pill: 999 },
};

export const DarkTheme: AppTheme = {
  dark: true,
  colors: {
    background: "#0F172A",
    surface: "#1E293B",
    surfaceAlt: "#334155",
    primary: "#3B82F6",
    primarySoft: "#1E3A8A",
    text: "#F8FAFC",
    textSecondary: "#94A3B8",
    border: "#334155",
    success: "#22C55E",
    warning: "#FBBF24",
    danger: "#EF4444",
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  radius: { sm: 8, md: 12, lg: 20, pill: 999 },
};
