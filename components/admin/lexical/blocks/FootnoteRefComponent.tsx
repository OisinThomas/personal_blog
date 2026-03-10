'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey } from 'lexical';

interface FootnoteRefComponentProps {
  nodeKey: string;
  label: string;
}

export default function FootnoteRefComponent({ nodeKey, label: initialLabel }: FootnoteRefComponentProps) {
  const [editor] = useLexicalComposerContext();
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(initialLabel);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commitLabel = useCallback(() => {
    const trimmed = label.trim() || initialLabel;
    setLabel(trimmed);
    setEditing(false);
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (node && 'setLabel' in node && typeof node.setLabel === 'function') {
        node.setLabel(trimmed);
      }
    });
  }, [editor, nodeKey, label, initialLabel]);

  if (editing) {
    return (
      <span className="inline-flex items-center align-super" data-lexical-decorator="true">
        <span className="text-[10px] text-blue-600 dark:text-blue-400">[</span>
        <input
          ref={inputRef}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={commitLabel}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === 'Enter') commitLabel();
            if (e.key === 'Escape') {
              setLabel(initialLabel);
              setEditing(false);
            }
          }}
          className="w-6 text-center text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-sm outline-none px-0 py-0 leading-none"
        />
        <span className="text-[10px] text-blue-600 dark:text-blue-400">]</span>
      </span>
    );
  }

  return (
    <span
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setEditing(true);
      }}
      className="inline-flex items-center justify-center text-[10px] font-semibold text-blue-600 dark:text-blue-400 cursor-pointer select-none align-super leading-none -ml-px hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-sm px-0.5 transition-colors"
      title={`Footnote ${label} — click to edit`}
      data-lexical-decorator="true"
    >
      [{label}]
    </span>
  );
}
