'use client';

import { useCallback } from 'react';
import { Check, X, Trash2, ArrowRightLeft } from 'lucide-react';
import { markdownToHtmlSync } from '@/lib/utils';

interface SuggestionBlockComponentProps {
  nodeKey: string;
  suggestionType: 'block-replacement' | 'block-deletion';
  originalBlockJSON: string;
  suggestedMarkdown: string;
  reason?: string;
  author: string;
}

export default function SuggestionBlockComponent({
  nodeKey,
  suggestionType,
  originalBlockJSON,
  suggestedMarkdown,
  reason,
  author,
}: SuggestionBlockComponentProps) {
  const originalPreview = getOriginalPreview(originalBlockJSON);
  const suggestedHtml = suggestedMarkdown
    ? markdownToHtmlSync(suggestedMarkdown)
    : '';
  const isDeletion = suggestionType === 'block-deletion';

  const handleAccept = useCallback(() => {
    window.dispatchEvent(
      new CustomEvent('suggestion-action', {
        detail: { action: 'accept', nodeKey, type: 'block' },
      })
    );
  }, [nodeKey]);

  const handleReject = useCallback(() => {
    window.dispatchEvent(
      new CustomEvent('suggestion-action', {
        detail: { action: 'reject', nodeKey, type: 'block' },
      })
    );
  }, [nodeKey]);

  return (
    <div className="lexical-suggestion-block my-2 rounded-lg border-2 border-dashed border-emerald-400 dark:border-emerald-600 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-200 dark:border-emerald-800">
        <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
          {isDeletion ? (
            <>
              <Trash2 className="w-3 h-3" />
              Suggested deletion
            </>
          ) : (
            <>
              <ArrowRightLeft className="w-3 h-3" />
              Suggested replacement
            </>
          )}
          <span className="text-emerald-500 dark:text-emerald-600">by {author}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleAccept}
            className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors"
          >
            <Check className="w-3 h-3" />
            Accept
          </button>
          <button
            onClick={handleReject}
            className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
          >
            <X className="w-3 h-3" />
            Reject
          </button>
        </div>
      </div>

      {/* Diff view */}
      <div className="divide-y divide-emerald-200 dark:divide-emerald-800">
        {/* Original */}
        <div className="px-3 py-2 bg-red-50/50 dark:bg-red-900/10">
          <div className="text-[10px] uppercase tracking-wider text-red-400 dark:text-red-500 font-semibold mb-1">
            Original
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 line-through opacity-75">
            {originalPreview || '(empty)'}
          </div>
        </div>

        {/* Suggested */}
        {isDeletion ? (
          <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800/50">
            <div className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-semibold mb-1">
              Action
            </div>
            <div className="text-sm italic text-gray-500 dark:text-gray-400">
              {reason || 'Delete this block'}
            </div>
          </div>
        ) : (
          <div className="px-3 py-2 bg-emerald-50/50 dark:bg-emerald-900/10">
            <div className="text-[10px] uppercase tracking-wider text-emerald-500 dark:text-emerald-600 font-semibold mb-1">
              Suggested
            </div>
            <div
              className="text-sm text-gray-800 dark:text-gray-200 prose dark:prose-invert prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: suggestedHtml }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/** Extract a text preview from the original block's serialized JSON */
function getOriginalPreview(jsonStr: string): string {
  if (!jsonStr) return '';
  try {
    const json = JSON.parse(jsonStr);
    return extractText(json);
  } catch {
    return '(original content)';
  }
}

function extractText(node: Record<string, unknown>): string {
  if (node.text && typeof node.text === 'string') {
    return node.text;
  }
  if (Array.isArray(node.children)) {
    return node.children.map((c: Record<string, unknown>) => extractText(c)).join('');
  }
  return '';
}
