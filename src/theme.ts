import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';
import useAsyncStorage from './hooks/useAsyncStorage';

export type ThemeName = 'white' | 'sky' | 'black';

/** Cycle order for the header toggle. */
export const THEME_ORDER: ThemeName[] = ['white', 'sky', 'black'];

export const THEME_LABELS: Record<ThemeName, string> = {
  white: 'White',
  sky: 'Sky blue',
  black: 'Black',
};

export interface Theme {
  bg: string;
  card: string;
  ink: string;
  mute: string;
  line: string;
  inc: string;
  exp: string;
  isDark: boolean;
}

const white: Theme = {
  bg: '#EEF1EA',
  card: '#FBFCF9',
  ink: '#14231C',
  mute: '#66746B',
  line: '#DCE2D6',
  inc: '#1B7A4B',
  exp: '#C4432B',
  isDark: false,
};

// Same warm-neutral ramp as white, pulled towards a cool blue cast. Ink stays
// near-black rather than navy so body text keeps its contrast against the card.
const sky: Theme = {
  bg: '#E1EFFA',
  card: '#F6FBFF',
  ink: '#0C2531',
  mute: '#4C6C7C',
  line: '#C2DDEE',
  inc: '#0F7A72',
  exp: '#C4432B',
  isDark: false,
};

const black: Theme = {
  bg: '#0E1512',
  card: '#17211C',
  ink: '#EAF0E6',
  mute: '#93A399',
  line: '#26332C',
  inc: '#4CC98A',
  exp: '#F0775F',
  isDark: true,
};

export const THEMES: Record<ThemeName, Theme> = { white, sky, black };

export const radius = {
  sm: 10,
  md: 12,
  lg: 16,
  pill: 18,
  sheet: 22,
} as const;

/** Matches the 1.4 line-height of the old CSS body rule. */
export const lineHeight = 22;
export const fontSize = 16;

export const type = {
  h1: 24,
  h2: 18,
  h3: 16,
  small: 13,
  tiny: 11,
} as const;

/** Minimum tappable size carried over from the 44px CSS rule. */
export const TOUCH = 44;

export type ThemeContextValue = Theme & {
  /** Which of the three palettes is active. */
  name: ThemeName;
  setName: (next: ThemeName) => void;
  /** Advances white -> sky -> black -> white. */
  cycle: () => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  ...white,
  name: 'white',
  setName: () => {},
  cycle: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const scheme = useColorScheme();
  // Seed from the OS so a fresh install opens in the scheme the user is
  // already using; afterwards the saved choice wins.
  const seed = useMemo<ThemeName>(() => (scheme === 'dark' ? 'black' : 'white'), [scheme]);
  const [name, setName] = useAsyncStorage<ThemeName>('et_theme', seed);

  const cycle = useCallback(() => {
    const next = THEME_ORDER[(THEME_ORDER.indexOf(name) + 1) % THEME_ORDER.length];
    setName(next);
  }, [name, setName]);

  const value = useMemo<ThemeContextValue>(
    () => ({ ...(THEMES[name] ?? white), name, setName, cycle }),
    [name, setName, cycle],
  );

  return createElement(ThemeContext.Provider, { value }, children);
}

export const useTheme = (): ThemeContextValue => useContext(ThemeContext);