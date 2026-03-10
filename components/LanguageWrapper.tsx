'use client';

import { ReactNode } from 'react';
import { LanguageProvider } from '@/lib/LanguageContext';
import type { Language } from '@/lib/supabase/types';

interface LanguageWrapperProps {
  hasBilingual: boolean;
  postLanguage: Language;
  children: ReactNode;
}

export default function LanguageWrapper({
  hasBilingual,
  postLanguage,
  children,
}: LanguageWrapperProps) {
  if (!hasBilingual) {
    return <>{children}</>;
  }

  return (
    <LanguageProvider defaultLanguage={postLanguage}>
      {children}
    </LanguageProvider>
  );
}
