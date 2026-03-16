'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot } from 'lexical';
import { $isSuggestionMarkNode, SuggestionMarkNode } from '@/lib/lexical/nodes/SuggestionMarkNode';
import { $isSuggestionBlockNode, SuggestionBlockNode } from '@/lib/lexical/nodes/SuggestionBlockNode';
import { Check, X, ChevronDown, ChevronUp, Sparkles, ArrowRightLeft, Trash2 } from 'lucide-react';

interface SuggestionInfo {
  key: string;
  type: 'inline' | 'block-replacement' | 'block-deletion';
  originalPreview: string;
  suggestedPreview: string;
  reason?: string;
}

export default function SuggestionPanel() {
  const [editor] = useLexicalComposerContext();
  const [expanded, setExpanded] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionInfo[]>([]);

  const scanSuggestions = useCallback(() => {
    editor.getEditorState().read(() => {
      const found: SuggestionInfo[] = [];
      const root = $getRoot();

      function walk(node: ReturnType<typeof $getRoot>): void {
        for (const child of node.getChildren()) {
          if ($isSuggestionMarkNode(child)) {
            found.push({
              key: child.getKey(),
              type: 'inline',
              originalPreview: child.getTextContent().slice(0, 80),
              suggestedPreview: child.getSuggestedText().slice(0, 80),
            });
          } else if ($isSuggestionBlockNode(child)) {
            found.push({
              key: child.getKey(),
              type: child.getSuggestionType(),
              originalPreview: extractTextFromJSON(child.getOriginalBlockJSON()).slice(0, 80),
              suggestedPreview: child.getSuggestedMarkdown().slice(0, 80),
              reason: child.getReason(),
            });
          }
          if ('getChildren' in child && typeof child.getChildren === 'function') {
            walk(child as unknown as ReturnType<typeof $getRoot>);
          }
        }
      }

      walk(root);
      setSuggestions(found);
    });
  }, [editor]);

  // Scan on mount and on editor updates
  useEffect(() => {
    scanSuggestions();
    return editor.registerUpdateListener(() => {
      scanSuggestions();
    });
  }, [editor, scanSuggestions]);

  const handleAcceptAll = useCallback(() => {
    window.dispatchEvent(
      new CustomEvent('suggestion-action', {
        detail: { action: 'accept-all' },
      })
    );
  }, []);

  const handleRejectAll = useCallback(() => {
    window.dispatchEvent(
      new CustomEvent('suggestion-action', {
        detail: { action: 'reject-all' },
      })
    );
  }, []);

  const handleAccept = useCallback((nodeKey: string, type: string) => {
    window.dispatchEvent(
      new CustomEvent('suggestion-action', {
        detail: {
          action: 'accept',
          nodeKey,
          type: type === 'inline' ? 'inline' : 'block',
        },
      })
    );
  }, []);

  const handleReject = useCallback((nodeKey: string, type: string) => {
    window.dispatchEvent(
      new CustomEvent('suggestion-action', {
        detail: {
          action: 'reject',
          nodeKey,
          type: type === 'inline' ? 'inline' : 'block',
        },
      })
    );
  }, []);

  if (suggestions.length === 0) return null;

  return (
    <div className="mt-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
      >
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        <Sparkles className="w-4 h-4" />
        Suggestions ({suggestions.length})
      </button>

      {expanded && (
        <div className="mt-3 bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-800 rounded-lg overflow-hidden">
          {/* Batch actions */}
          <div className="flex items-center justify-between px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-200 dark:border-emerald-800">
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
              {suggestions.length} pending suggestion{suggestions.length !== 1 ? 's' : ''}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAcceptAll}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors"
              >
                <Check className="w-3 h-3" />
                Accept All
              </button>
              <button
                onClick={handleRejectAll}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              >
                <X className="w-3 h-3" />
                Reject All
              </button>
            </div>
          </div>

          {/* Suggestion list */}
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {suggestions.map((s) => (
              <div key={s.key} className="px-4 py-2 flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {s.type === 'inline' ? (
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  ) : s.type === 'block-deletion' ? (
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  ) : (
                    <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 dark:text-gray-400 line-through truncate">
                    {s.originalPreview || '(empty)'}
                  </div>
                  <div className="text-xs text-gray-800 dark:text-gray-200 truncate">
                    {s.type === 'block-deletion'
                      ? (s.reason || 'Delete block')
                      : (s.suggestedPreview || '(empty)')}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleAccept(s.key, s.type)}
                    className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded transition-colors"
                    title="Accept"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleReject(s.key, s.type)}
                    className="p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    title="Reject"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function extractTextFromJSON(jsonStr: string): string {
  try {
    const json = JSON.parse(jsonStr);
    return extractText(json);
  } catch {
    return '';
  }
}

function extractText(node: Record<string, unknown>): string {
  if (node.text && typeof node.text === 'string') return node.text;
  if (Array.isArray(node.children)) {
    return node.children.map((c: Record<string, unknown>) => extractText(c)).join('');
  }
  return '';
}
