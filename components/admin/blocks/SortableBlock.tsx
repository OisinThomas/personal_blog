'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import type { NodeWithAsset } from '@/lib/supabase/types';
import MarkdownBlockEditor from './MarkdownBlockEditor';
import ImageBlockEditor from './ImageBlockEditor';
import VideoBlockEditor from './VideoBlockEditor';
import CodeBlockEditor from './CodeBlockEditor';
import EmbedBlockEditor from './EmbedBlockEditor';
import DividerBlockEditor from './DividerBlockEditor';
import InteractiveBlockEditor from './InteractiveBlockEditor';

interface SortableBlockProps {
  node: NodeWithAsset;
  onUpdate: (nodeId: string, updates: Partial<NodeWithAsset>) => void;
  onDelete: (nodeId: string) => void;
}

export default function SortableBlock({ node, onUpdate, onDelete }: SortableBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const blockTypeLabels: Record<string, string> = {
    markdown: 'Markdown',
    image: 'Image',
    video: 'Video',
    code: 'Code',
    embed: 'Embed',
    divider: 'Divider',
    interactive: 'Interactive',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
    >
      {/* Block Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-white"
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {blockTypeLabels[node.type] || node.type}
          </span>
        </div>
        <button
          onClick={() => onDelete(node.id)}
          className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-600 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Block Content */}
      <div className="p-4">
        <BlockEditor node={node} onUpdate={onUpdate} />
      </div>
    </div>
  );
}

interface BlockEditorProps {
  node: NodeWithAsset;
  onUpdate: (nodeId: string, updates: Partial<NodeWithAsset>) => void;
}

function BlockEditor({ node, onUpdate }: BlockEditorProps) {
  const handleContentChange = (content: string) => {
    onUpdate(node.id, { content });
  };

  const handleMetadataChange = (metadata: NodeWithAsset['metadata']) => {
    onUpdate(node.id, { metadata });
  };

  switch (node.type) {
    case 'markdown':
      return (
        <MarkdownBlockEditor
          content={node.content || ''}
          onChange={handleContentChange}
        />
      );

    case 'image':
      return (
        <ImageBlockEditor
          node={node}
          onUpdate={(updates) => onUpdate(node.id, updates)}
        />
      );

    case 'video':
      return (
        <VideoBlockEditor
          content={node.content || ''}
          metadata={node.metadata}
          onContentChange={handleContentChange}
          onMetadataChange={handleMetadataChange}
        />
      );

    case 'code':
      return (
        <CodeBlockEditor
          content={node.content || ''}
          metadata={node.metadata}
          onContentChange={handleContentChange}
          onMetadataChange={handleMetadataChange}
        />
      );

    case 'embed':
      return (
        <EmbedBlockEditor
          content={node.content || ''}
          metadata={node.metadata}
          onContentChange={handleContentChange}
          onMetadataChange={handleMetadataChange}
        />
      );

    case 'divider':
      return <DividerBlockEditor />;

    case 'interactive':
      return (
        <InteractiveBlockEditor
          metadata={node.metadata}
          onMetadataChange={handleMetadataChange}
        />
      );

    default:
      return (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Unknown block type: {node.type}
        </div>
      );
  }
}
