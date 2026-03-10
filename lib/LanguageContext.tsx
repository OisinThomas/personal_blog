'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'ga' | 'ja';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
});

export function LanguageProvider({
  defaultLanguage = 'en',
  children,
}: {
  defaultLanguage?: Language;
  children: ReactNode;
}) {
  const [language, setLanguage] = useState<Language>(defaultLanguage);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
