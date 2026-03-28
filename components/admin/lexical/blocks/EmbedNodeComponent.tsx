'use client';

import { useState, useCallback } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey } from 'lexical';
import { EmbedNode } from '@/lib/lexical/nodes/EmbedNode';
import { Globe, Edit2, Check, Code } from 'lucide-react';

interface EmbedNodeComponentProps {
  nodeKey: string;
}

export default function EmbedNodeComponent({ nodeKey }: EmbedNodeComponentProps) {
  const [editor] = useLexicalComposerContext();
  const [editing, setEditing] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [rawHtmlMode, setRawHtmlMode] = useState(false);
  const [htmlInput, setHtmlInput] = useState('');

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
      updateNode({ url: urlInput, html, provider: '' });
      setEditing(false);
    }
  };

  const handleHtmlSubmit = () => {
    if (htmlInput.trim()) {
      updateNode({ url: 'raw-html', html: htmlInput, provider: 'raw-html' });
      setEditing(false);
      setRawHtmlMode(false);
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
          <div className="absolute top-2 right-2 flex items-center gap-1">
            {nodeData.provider === 'raw-html' && (
              <span className="px-2 py-1 bg-gray-800/80 text-white text-xs rounded-full">
                HTML
              </span>
            )}
            <button
              onClick={() => {
                setEditing(true);
                if (nodeData.provider === 'raw-html') {
                  setRawHtmlMode(true);
                  setHtmlInput(nodeData.html);
                } else {
                  setRawHtmlMode(false);
                  setUrlInput(nodeData.url);
                }
              }}
              className="p-2 bg-gray-800/80 text-white rounded-full hover:bg-gray-700 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
          <Globe className="w-8 h-8 mx-auto mb-2 text-gray-400" />

          <div className="flex justify-center mb-3">
            <button
              onClick={() => setRawHtmlMode(false)}
              className={`px-3 py-1 text-xs rounded-l border ${
                !rawHtmlMode
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600'
              }`}
            >
              URL
            </button>
            <button
              onClick={() => setRawHtmlMode(true)}
              className={`px-3 py-1 text-xs rounded-r border-t border-b border-r flex items-center gap-1 ${
                rawHtmlMode
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600'
              }`}
            >
              <Code className="w-3 h-3" />
              Raw HTML
            </button>
          </div>

          {rawHtmlMode ? (
            <div className="max-w-lg mx-auto">
              <textarea
                value={htmlInput}
                onChange={(e) => setHtmlInput(e.target.value)}
                placeholder="Paste embed HTML (e.g. Tenor GIF, Twitter embed, etc.)..."
                className="w-full px-3 py-2 text-sm font-mono border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-y min-h-[100px]"
                autoFocus
              />
              <button
                onClick={handleHtmlSubmit}
                className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
              >
                <Check className="w-4 h-4 inline mr-1" />
                Embed
              </button>
            </div>
          ) : (
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
          )}
        </div>
      )}
    </div>
  );
}
