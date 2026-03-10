'use client';

import { useState } from 'react';
import type { Footnote } from '@/lib/supabase/types';
import { Plus, Trash2 } from 'lucide-react';

interface FootnoteEditorProps {
  footnotes: Footnote[];
  onChange: (footnotes: Footnote[]) => void;
}

export default function FootnoteEditor({ footnotes, onChange }: FootnoteEditorProps) {
  const addFootnote = () => {
    const newId = `fn-${Date.now()}`;
    const newLabel = `${footnotes.length + 1}`;
    onChange([...footnotes, { id: newId, label: newLabel, content: '' }]);
  };

  const updateFootnote = (index: number, updates: Partial<Footnote>) => {
    const updated = footnotes.map((fn, i) =>
      i === index ? { ...fn, ...updates } : fn
    );
    onChange(updated);
  };

  const removeFootnote = (index: number) => {
    onChange(footnotes.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {footnotes.map((fn, index) => (
        <div key={fn.id} className="flex items-start gap-2">
          <input
            type="text"
            value={fn.label}
            onChange={(e) => updateFootnote(index, { label: e.target.value })}
            className="w-12 px-2 py-1.5 text-sm text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <input
            type="text"
            value={fn.content}
            onChange={(e) => updateFootnote(index, { content: e.target.value })}
            placeholder="Footnote content..."
            className="flex-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={() => removeFootnote(index)}
            className="p-1.5 text-red-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        onClick={addFootnote}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-500 transition-colors"
      >
        <Plus className="w-4 h-4" /> Add footnote
      </button>
    </div>
  );
}
