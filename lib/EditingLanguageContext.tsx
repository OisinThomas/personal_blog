'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

interface EditingLanguageContextValue {
  language: string;
  setLanguage: (lang: string) => void;
}

const EditingLanguageContext = createContext<EditingLanguageContextValue>({
  language: 'en',
  setLanguage: () => {},
});

export function EditingLanguageProvider({
  children,
  defaultLanguage = 'en',
}: {
  children: ReactNode;
  defaultLanguage?: string;
}) {
  const [language, setLanguage] = useState(defaultLanguage);

  return (
    <EditingLanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </EditingLanguageContext.Provider>
  );
}

export function useEditingLanguage() {
  return useContext(EditingLanguageContext);
}
