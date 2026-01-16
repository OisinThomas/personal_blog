'use client';

import type { NodeMetadata } from '@/lib/supabase/types';

interface EmbedBlockEditorProps {
  content: string;
  metadata: NodeMetadata;
  onContentChange: (content: string) => void;
  onMetadataChange: (metadata: NodeMetadata) => void;
}

export default function EmbedBlockEditor({
  content,
  metadata,
  onContentChange,
  onMetadataChange,
}: EmbedBlockEditorProps) {
  const embedMetadata = metadata as {
    provider?: string;
    url?: string;
    html?: string;
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
          Provider (optional)
        </label>
        <input
          type="text"
          value={embedMetadata.provider || ''}
          onChange={(e) =>
            onMetadataChange({ ...embedMetadata, provider: e.target.value })
          }
          placeholder="e.g., Twitter, CodePen, etc."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
          Embed URL
        </label>
        <input
          type="url"
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="https://..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Enter a URL to embed via iframe
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
          Custom HTML (optional)
        </label>
        <textarea
          value={embedMetadata.html || ''}
          onChange={(e) =>
            onMetadataChange({ ...embedMetadata, html: e.target.value })
          }
          rows={6}
          placeholder="<iframe>...</iframe>"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          If provided, this HTML will be rendered instead of the URL
        </p>
      </div>

      {content && !embedMetadata.html && (
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
          <iframe
            src={content}
            title="Embed preview"
            className="w-full h-64"
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        </div>
      )}
    </div>
  );
}
