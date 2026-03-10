'use client';

import { useState, useCallback } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey } from 'lexical';
import { CodeBlockNode } from '@/lib/lexical/nodes/CodeBlockNode';

const LANGUAGES = [
  '', 'javascript', 'typescript', 'python', 'rust', 'go', 'java', 'c', 'cpp',
  'csharp', 'ruby', 'php', 'swift', 'kotlin', 'html', 'css', 'sql', 'bash',
  'json', 'yaml', 'toml', 'markdown', 'plaintext',
];

interface CodeBlockNodeComponentProps {
  nodeKey: string;
}

export default function CodeBlockNodeComponent({ nodeKey }: CodeBlockNodeComponentProps) {
  const [editor] = useLexicalComposerContext();

  const [nodeData, setNodeData] = useState(() => {
    let data = { code: '', language: '', filename: '' };
    editor.getEditorState().read(() => {
      const node = $getNodeByKey(nodeKey);
      if (node instanceof CodeBlockNode) {
        data = {
          code: node.getCode(),
          language: node.getLanguage(),
          filename: node.getFilename(),
        };
      }
    });
    return data;
  });

  const updateNode = useCallback(
    (updates: Partial<typeof nodeData>) => {
      const newData = { ...nodeData, ...updates };
      setNodeData(newData);
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if (node instanceof CodeBlockNode) {
          if (updates.code !== undefined) node.setCode(updates.code);
          if (updates.language !== undefined) node.setLanguage(updates.language);
          if (updates.filename !== undefined) node.setFilename(updates.filename);
        }
      });
    },
    [editor, nodeKey, nodeData]
  );

  return (
    <div className="my-2 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden" data-lexical-decorator="true">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <select
          value={nodeData.language}
          onChange={(e) => updateNode({ language: e.target.value })}
          className="text-xs px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Language</option>
          {LANGUAGES.filter(Boolean).map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={nodeData.filename}
          onChange={(e) => updateNode({ filename: e.target.value })}
          placeholder="filename"
          className="text-xs px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 flex-1"
        />
      </div>
      <textarea
        value={nodeData.code}
        onChange={(e) => updateNode({ code: e.target.value })}
        placeholder="Enter code..."
        className="w-full min-h-[120px] p-3 bg-gray-900 text-gray-100 font-mono text-sm resize-y focus:outline-none"
        spellCheck={false}
        onKeyDown={(e) => {
          // Allow Tab key for indentation
          if (e.key === 'Tab') {
            e.preventDefault();
            const target = e.target as HTMLTextAreaElement;
            const start = target.selectionStart;
            const end = target.selectionEnd;
            const newCode = nodeData.code.slice(0, start) + '  ' + nodeData.code.slice(end);
            updateNode({ code: newCode });
            // Restore cursor position
            requestAnimationFrame(() => {
              target.selectionStart = target.selectionEnd = start + 2;
            });
          }
        }}
      />
    </div>
  );
}
