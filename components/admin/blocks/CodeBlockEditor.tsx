'use client';

import type { NodeMetadata } from '@/lib/supabase/types';

interface CodeBlockEditorProps {
  content: string;
  metadata: NodeMetadata;
  onContentChange: (content: string) => void;
  onMetadataChange: (metadata: NodeMetadata) => void;
}

const LANGUAGES = [
  'text',
  'javascript',
  'typescript',
  'python',
  'rust',
  'go',
  'java',
  'c',
  'cpp',
  'csharp',
  'ruby',
  'php',
  'swift',
  'kotlin',
  'sql',
  'html',
  'css',
  'json',
  'yaml',
  'markdown',
  'bash',
  'shell',
];

export default function CodeBlockEditor({
  content,
  metadata,
  onContentChange,
  onMetadataChange,
}: CodeBlockEditorProps) {
  const codeMetadata = metadata as {
    language?: string;
    filename?: string;
    showLineNumbers?: boolean;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
            Language
          </label>
          <select
            value={codeMetadata.language || 'text'}
            onChange={(e) =>
              onMetadataChange({ ...codeMetadata, language: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
            Filename (optional)
          </label>
          <input
            type="text"
            value={codeMetadata.filename || ''}
            onChange={(e) =>
              onMetadataChange({ ...codeMetadata, filename: e.target.value })
            }
            placeholder="e.g., index.ts"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={codeMetadata.showLineNumbers || false}
            onChange={(e) =>
              onMetadataChange({ ...codeMetadata, showLineNumbers: e.target.checked })
            }
            className="rounded border-gray-300 dark:border-gray-600"
          />
          <span className="text-sm text-gray-900 dark:text-white">Show line numbers</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Code</label>
        <textarea
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          rows={12}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-900 text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          spellCheck={false}
        />
      </div>
    </div>
  );
}
