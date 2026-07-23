import { createContext, useContext, useState, useEffect, FC, ReactNode } from 'react';

type Direction = 'ltr' | 'rtl';
type Locale = 'en' | 'ar';

interface I18nRtlContextType {
  locale: Locale;
  direction: Direction;
  setLocale: (locale: Locale) => void;
  setDirection: (direction: Direction) => void;
}

const I18nRtlContext = createContext<I18nRtlContextType>({
  locale: 'en',
  direction: 'ltr',
  setLocale: () => {},
  setDirection: () => {},
});

export const useI18nRtl = (): I18nRtlContextType => useContext(I18nRtlContext);

interface Props {
  children: ReactNode;
}

export const I18nRtlProvider: FC<Props> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>('en');
  const [direction, setDirection] = useState<Direction>('ltr');

  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = locale;
  }, [locale, direction]);

  const handleSetLocale = (newLocale: Locale): void => {
    setLocale(newLocale);
    setDirection(newLocale === 'ar' ? 'rtl' : 'ltr');
  };

  return (
    <I18nRtlContext.Provider
      value={{
        locale,
        direction,
        setLocale: handleSetLocale,
        setDirection,
      }}
    >
      {children}
    </I18nRtlContext.Provider>
  );
};
