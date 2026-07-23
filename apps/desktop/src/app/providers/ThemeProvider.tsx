import { createContext, useContext, useState, useEffect, FC, ReactNode } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';
type Density = 'comfortable' | 'compact';

interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  density: Density;
  highContrast: boolean;
  setTheme: (mode: ThemeMode) => void;
  setDensity: (density: Density) => void;
  setHighContrast: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  resolvedTheme: 'light',
  density: 'comfortable',
  highContrast: false,
  setTheme: () => {},
  setDensity: () => {},
  setHighContrast: () => {},
});

export const useTheme = (): ThemeContextType => useContext(ThemeContext);

interface Props {
  children: ReactNode;
}

export const ThemeProvider: FC<Props> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [density, setDensity] = useState<Density>('comfortable');
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    let activeTheme: 'light' | 'dark' = 'dark';
    if (theme === 'system') {
      activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      activeTheme = theme;
    }
    setResolvedTheme(activeTheme);
    document.documentElement.setAttribute('data-theme', activeTheme);
    document.documentElement.setAttribute('data-density', density);
    if (highContrast) {
      document.documentElement.setAttribute('data-high-contrast', 'true');
    } else {
      document.documentElement.removeAttribute('data-high-contrast');
    }
  }, [theme, density, highContrast]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        density,
        highContrast,
        setTheme,
        setDensity,
        setHighContrast,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
