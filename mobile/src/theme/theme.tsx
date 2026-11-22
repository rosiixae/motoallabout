import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

// Grundfarben aus dem Prototyp
export const colors = {
  background: '#F3F4F1',
  card: '#FFFFFF',
  border: '#DDE0DC',
  inputBorder: '#C9CDC8',
  text: '#16191D',
  textSoft: '#3A3F45',
  muted: '#5B6168',
  track: '#E7E9E5',
  danger: '#B42318',
  warning: '#B45309',
  warningSoft: '#FEF3C7',
  success: '#15803D',
  successSoft: '#DCFCE7',
  white: '#FFFFFF',
} as const;

export const fonts = {
  // Barlow Condensed folgt in Phase 8; bis dahin die Systemschrift
  heading: undefined as string | undefined,
  body: undefined as string | undefined,
};

export const accentThemes = {
  Orange: { accent: '#C2410C', accentDark: '#9A3412', accentSoft: '#FDE8DC' },
  Petrol: { accent: '#0F766E', accentDark: '#115E59', accentSoft: '#CCFBF1' },
  Blau: { accent: '#1D4ED8', accentDark: '#1E3A8A', accentSoft: '#DBEAFE' },
  Violett: { accent: '#7E22CE', accentDark: '#581C87', accentSoft: '#F3E8FF' },
  Pink: { accent: '#DB2777', accentDark: '#9D174D', accentSoft: '#FCE7F3' },
  Rot: { accent: '#DC2626', accentDark: '#991B1B', accentSoft: '#FEE2E2' },
} as const;

export type AccentName = keyof typeof accentThemes;
export type Accent = (typeof accentThemes)[AccentName];

const STORAGE_KEY = 'motoallabout.farbe';

type ThemeValue = {
  accentName: AccentName;
  accent: Accent;
  setAccentName: (name: AccentName) => void;
};

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [accentName, setName] = useState<AccentName>('Orange');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved && saved in accentThemes) setName(saved as AccentName);
      })
      .catch(() => {});
  }, []);

  const value = useMemo<ThemeValue>(
    () => ({
      accentName,
      accent: accentThemes[accentName],
      setAccentName: (name) => {
        setName(name);
        AsyncStorage.setItem(STORAGE_KEY, name).catch(() => {});
      },
    }),
    [accentName],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme muss innerhalb von ThemeProvider verwendet werden');
  return value;
}
