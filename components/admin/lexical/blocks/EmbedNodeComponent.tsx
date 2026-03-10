'use client';

import { useState, useCallback } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey } from 'lexical';
import { EmbedNode } from '@/lib/lexical/nodes/EmbedNode';
import { Globe, Edit2, Check } from 'lucide-react';

interface EmbedNodeComponentProps {
  nodeKey: string;
}

export default function EmbedNodeComponent({ nodeKey }: EmbedNodeComponentProps) {
  const [editor] = useLexicalComposerContext();
  const [editing, setEditing] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const [nodeData, setNodeData] = useState(() => {
    let data = { url: '', html: '', provider: '' };
    editor.getEditorState().read(() => {
      const node = $getNodeByKey(nodeKey);
      if (node instanceof EmbedNode) {
        data = {
          url: node.getUrl(),
          html: node.getHtml(),
          provider: node.getProvider(),
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
        if (node instanceof EmbedNode) {
          if (updates.url !== undefined) node.setUrl(updates.url);
          if (updates.html !== undefined) node.setHtml(updates.html);
          if (updates.provider !== undefined) node.setProvider(updates.provider);
        }
      });
    },
    [editor, nodeKey, nodeData]
  );

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      const html = `<iframe src="${urlInput}" width="100%" height="400" frameborder="0" allowfullscreen></iframe>`;
      updateNode({ url: urlInput, html });
      setEditing(false);
    }
  };

  return (
    <div className="my-2" data-lexical-decorator="true">
      {nodeData.url && !editing ? (
        <div className="relative border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div
            className="min-h-[200px]"
            dangerouslySetInnerHTML={{ __html: nodeData.html }}
          />
          <button
            onClick={() => {
              setEditing(true);
              setUrlInput(nodeData.url);
            }}
            className="absolute top-2 right-2 p-2 bg-gray-800/80 text-white rounded-full hover:bg-gray-700 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
          <Globe className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <div className="flex items-center gap-2 max-w-md mx-auto">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
              placeholder="Paste embed URL..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
            <button
              onClick={handleUrlSubmit}
              className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
