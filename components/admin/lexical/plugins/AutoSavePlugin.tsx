'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import type { EditorState } from 'lexical';

interface AutoSavePluginProps {
  onSave: (editorState: Record<string, unknown>) => Promise<void>;
  debounceMs?: number;
}

export default function AutoSavePlugin({
  onSave,
  debounceMs = 2000,
}: AutoSavePluginProps) {
  const [editor] = useLexicalComposerContext();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>('');

  const doSave = useCallback(
    async (editorState: EditorState) => {
      const json = editorState.toJSON() as unknown as Record<string, unknown>;
      const jsonStr = JSON.stringify(json);

      // Skip if nothing changed
      if (jsonStr === lastSavedRef.current) return;

      setSaveStatus('saving');
      try {
        await onSave(json);
        lastSavedRef.current = jsonStr;
        setSaveStatus('saved');
        // Reset to idle after 2s
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch {
        setSaveStatus('error');
      }
    },
    [onSave]
  );

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState, dirtyElements, dirtyLeaves }) => {
      // Only save if something actually changed
      if (dirtyElements.size === 0 && dirtyLeaves.size === 0) return;

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        doSave(editorState);
      }, debounceMs);
    });
  }, [editor, debounceMs, doSave]);

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="text-xs text-gray-500 dark:text-gray-400">
      {saveStatus === 'saving' && 'Saving...'}
      {saveStatus === 'saved' && 'Saved'}
      {saveStatus === 'error' && (
        <span className="text-red-500">Save failed</span>
      )}
    </div>
  );
}
