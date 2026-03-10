'use client';

import { useState, useCallback } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey } from 'lexical';
import { VideoNode } from '@/lib/lexical/nodes/VideoNode';
import { Video, Edit2, Check } from 'lucide-react';

interface VideoNodeComponentProps {
  nodeKey: string;
}

function parseVideoUrl(url: string): { provider: string; videoId: string } | null {
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) return { provider: 'youtube', videoId: ytMatch[1] };

  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return { provider: 'vimeo', videoId: vimeoMatch[1] };

  return null;
}

export default function VideoNodeComponent({ nodeKey }: VideoNodeComponentProps) {
  const [editor] = useLexicalComposerContext();
  const [editing, setEditing] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const [nodeData, setNodeData] = useState(() => {
    let data = { provider: '', videoId: '', caption: '' };
    editor.getEditorState().read(() => {
      const node = $getNodeByKey(nodeKey);
      if (node instanceof VideoNode) {
        data = {
          provider: node.getProvider(),
          videoId: node.getVideoId(),
          caption: node.getCaption(),
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
        if (node instanceof VideoNode) {
          if (updates.provider !== undefined) node.setProvider(updates.provider);
          if (updates.videoId !== undefined) node.setVideoId(updates.videoId);
          if (updates.caption !== undefined) node.setCaption(updates.caption);
        }
      });
    },
    [editor, nodeKey, nodeData]
  );

  const handleUrlSubmit = () => {
    const parsed = parseVideoUrl(urlInput);
    if (parsed) {
      updateNode(parsed);
      setEditing(false);
    }
  };

  const getEmbedUrl = () => {
    if (nodeData.provider === 'youtube') {
      return `https://www.youtube.com/embed/${nodeData.videoId}`;
    }
    if (nodeData.provider === 'vimeo') {
      return `https://player.vimeo.com/video/${nodeData.videoId}`;
    }
    return '';
  };

  const embedUrl = getEmbedUrl();

  return (
    <div className="my-2" data-lexical-decorator="true">
      {embedUrl && !editing ? (
        <div className="relative">
          <div className="aspect-video rounded-lg overflow-hidden bg-black">
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allowFullScreen
              allow="autoplay; encrypted-media"
            />
          </div>
          <button
            onClick={() => {
              setEditing(true);
              setUrlInput('');
            }}
            className="absolute top-2 right-2 p-2 bg-gray-800/80 text-white rounded-full hover:bg-gray-700 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <input
            type="text"
            value={nodeData.caption}
            onChange={(e) => updateNode({ caption: e.target.value })}
            placeholder="Caption (optional)"
            className="mt-2 w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
          <Video className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <div className="flex items-center gap-2 max-w-md mx-auto">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
              placeholder="Paste YouTube or Vimeo URL..."
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
