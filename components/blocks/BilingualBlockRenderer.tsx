'use client';

import { useLanguage } from '@/lib/LanguageContext';

interface BilingualBlockRendererProps {
  languages: string[];
  content: Record<string, string>;
  isHtml?: boolean;
}

const LANG_LABELS: Record<string, string> = {
  en: 'EN',
  ga: 'GA',
  ja: 'JA',
};

export default function BilingualBlockRenderer({ languages, content, isHtml }: BilingualBlockRendererProps) {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="relative my-4">
      {/* Language toggle in the left margin */}
      <div className={`absolute top-0 flex flex-row rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 ${languages.length > 2 ? '-left-[4.5rem] w-16' : '-left-14 w-12'}`}>
        {languages.map((lang, i) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang as 'en' | 'ga' | 'ja')}
            className={`
              flex-1 py-1 flex items-center justify-center text-[10px] font-bold tracking-wider
              transition-all duration-150 select-none
              ${i === 0 ? '' : 'border-l border-gray-200 dark:border-gray-700'}
              ${language === lang
                ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900'
                : 'bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
              }
            `}
          >
            {LANG_LABELS[lang] ?? lang.toUpperCase().slice(0, 2)}
          </button>
        ))}
      </div>

      {/* Content — stays in the normal text flow */}
      {languages.map((lang) => (
        <div key={lang} className={language === lang ? '' : 'hidden'}>
          {isHtml ? (
            <div
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: content[lang] ?? '' }}
            />
          ) : (
            <div className="whitespace-pre-wrap">{content[lang] ?? ''}</div>
          )}
        </div>
      ))}
    </div>
  );
}
