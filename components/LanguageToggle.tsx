'use client';

import { useLanguage } from '@/lib/LanguageContext';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 mb-6">
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 text-sm rounded-md transition-colors ${
          language === 'en'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
      >
        English
      </button>
      <button
        onClick={() => setLanguage('ga')}
        className={`px-3 py-1 text-sm rounded-md transition-colors ${
          language === 'ga'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
      >
        Gaeilge
      </button>
    </div>
  );
}
