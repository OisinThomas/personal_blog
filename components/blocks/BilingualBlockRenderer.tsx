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

const LANG_ORDER: string[] = ['en', 'ga', 'ja'];

function sortLanguages(langs: string[]): string[] {
  return [...langs].sort((a, b) => {
    const ai = LANG_ORDER.indexOf(a);
    const bi = LANG_ORDER.indexOf(b);
    // Known languages by defined order, unknown languages at the end alphabetically
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.localeCompare(b);
  });
}

export default function BilingualBlockRenderer({ languages, content, isHtml }: BilingualBlockRendererProps) {
  const { language, setLanguage } = useLanguage();
  const sorted = sortLanguages(languages);

  return (
    <div className="group/lang relative my-4">
      {/* Language toggle — above content on small screens, in left margin on wide screens */}
      <div className="z-10 flex flex-row rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 mb-1 w-fit md:absolute md:top-0 md:mb-0 md:right-full md:mr-2">
        {sorted.map((lang, i) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang as 'en' | 'ga' | 'ja')}
            className={`
              w-7 py-0.5 flex items-center justify-center text-[10px] font-bold tracking-wider
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

      {/* Content — light outline on toggle hover */}
      <div className="transition-all duration-150 border-y border-transparent group-hover/lang:border-gray-200 dark:group-hover/lang:border-gray-700">
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
    </div>
  );
}
