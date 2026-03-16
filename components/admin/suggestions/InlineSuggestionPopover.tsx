'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Check, X } from 'lucide-react';

interface InlineSuggestionPopoverProps {
  anchorRect: DOMRect | null;
  originalText: string;
  suggestedText: string;
  onAccept: () => void;
  onReject: () => void;
}

export default function InlineSuggestionPopover({
  anchorRect,
  originalText,
  suggestedText,
  onAccept,
  onReject,
}: InlineSuggestionPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!anchorRect) {
      setPosition(null);
      return;
    }

    const top = anchorRect.bottom + window.scrollY + 4;
    const left = Math.max(8, anchorRect.left + window.scrollX);
    setPosition({ top, left });
  }, [anchorRect]);

  // Close on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onReject();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onReject]);

  if (!position) return null;

  return createPortal(
    <div
      ref={popoverRef}
      className="fixed z-50 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
      style={{ top: position.top, left: position.left }}
    >
      <div className="px-3 py-2 space-y-2">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-red-400 font-semibold mb-0.5">
            Original
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 line-through">
            {originalText}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-emerald-500 font-semibold mb-0.5">
            Suggested
          </div>
          <div className="text-sm text-gray-800 dark:text-gray-200">
            {suggestedText}
          </div>
        </div>
      </div>
      <div className="flex border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onAccept}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
        >
          <Check className="w-3 h-3" />
          Accept
        </button>
        <div className="w-px bg-gray-200 dark:bg-gray-700" />
        <button
          onClick={onReject}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <X className="w-3 h-3" />
          Reject
        </button>
      </div>
    </div>,
    document.body
  );
}
