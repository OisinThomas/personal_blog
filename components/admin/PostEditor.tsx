'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { PostWithAsset, NodeWithAsset, NodeType } from '@/lib/supabase/types';
import PostMetadataForm from './PostMetadataForm';
import SortableBlock from './blocks/SortableBlock';
import { Plus, Save, Eye, Settings, Trash2 } from 'lucide-react';

interface PostEditorProps {
  post: PostWithAsset;
  initialNodes: NodeWithAsset[];
}

export default function PostEditor({ post, initialNodes }: PostEditorProps) {
  const router = useRouter();
  const [nodes, setNodes] = useState<NodeWithAsset[]>(initialNodes);
  const [saving, setSaving] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setNodes((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        // Update positions
        return newItems.map((item, index) => ({ ...item, position: index }));
      });
      setHasChanges(true);
    }
  };

  const updateNode = useCallback((nodeId: string, updates: Partial<NodeWithAsset>) => {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === nodeId ? { ...node, ...updates } : node
      )
    );
    setHasChanges(true);
  }, []);

  const addBlock = async (type: NodeType) => {
    const supabase = getSupabaseClient();
    const newPosition = nodes.length;

    const { data: newNode, error } = await supabase
      .from('nodes')
      .insert({
        post_id: post.id,
        type,
        position: newPosition,
        content: type === 'markdown' ? '' : null,
        metadata: {},
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding block:', error);
      return;
    }

    setNodes((prev) => [...prev, { ...newNode, asset: null }]);
  };

  const deleteBlock = async (nodeId: string) => {
    if (!confirm('Delete this block?')) return;

    const supabase = getSupabaseClient();
    const { error } = await supabase.from('nodes').delete().eq('id', nodeId);

    if (error) {
      console.error('Error deleting block:', error);
      return;
    }

    setNodes((prev) => prev.filter((node) => node.id !== nodeId));
    setHasChanges(true);
  };

  const saveChanges = async () => {
    setSaving(true);

    try {
      const supabase = getSupabaseClient();

      // Save all nodes
      for (const node of nodes) {
        const { error } = await supabase
          .from('nodes')
          .update({
            position: node.position,
            content: node.content,
            metadata: node.metadata,
          })
          .eq('id', node.id);

        if (error) {
          console.error('Error saving node:', error);
          throw error;
        }
      }

      setHasChanges(false);
      router.refresh();
    } catch (err) {
      console.error('Error saving changes:', err);
    } finally {
      setSaving(false);
    }
  };

  const publishPost = async () => {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('posts')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
      })
      .eq('id', post.id);

    if (error) {
      console.error('Error publishing post:', error);
      return;
    }

    router.refresh();
  };

  const unpublishPost = async () => {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('posts')
      .update({ status: 'draft' })
      .eq('id', post.id);

    if (error) {
      console.error('Error unpublishing post:', error);
      return;
    }

    router.refresh();
  };

  const deletePost = async () => {
    if (!confirm('Are you sure you want to delete this post? This cannot be undone.')) {
      return;
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase.from('posts').delete().eq('id', post.id);

    if (error) {
      console.error('Error deleting post:', error);
      return;
    }

    router.push('/admin/posts');
  };

  return (
    <div className="space-y-6">
      {/* Editor Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{post.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={post.status} />
            {post.language === 'ga' && (
              <span className="text-xs text-gray-500 dark:text-gray-400">[Irish]</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMetadata(!showMetadata)}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-md transition-colors"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>

          <Link
            href={`/blog/${post.slug}`}
            target="_blank"
            className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-md transition-colors"
          >
            <Eye className="w-4 h-4" />
            Preview
          </Link>

          {hasChanges && (
            <button
              onClick={saveChanges}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save'}
            </button>
          )}

          {post.status === 'draft' ? (
            <button
              onClick={publishPost}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors"
            >
              Publish
            </button>
          ) : (
            <button
              onClick={unpublishPost}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-md transition-colors"
            >
              Unpublish
            </button>
          )}
        </div>
      </div>

      {/* Metadata Form (Collapsible) */}
      {showMetadata && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <PostMetadataForm post={post} onDelete={deletePost} />
        </div>
      )}

      {/* Block Editor */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Content Blocks</h2>
        </div>

        <div className="p-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={nodes.map((n) => n.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {nodes.map((node) => (
                  <SortableBlock
                    key={node.id}
                    node={node}
                    onUpdate={updateNode}
                    onDelete={deleteBlock}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {nodes.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No content blocks yet. Add one below.
            </div>
          )}

          {/* Add Block Menu */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Add a block:</p>
            <div className="flex flex-wrap gap-2">
              {[
                { type: 'markdown' as NodeType, label: 'Markdown' },
                { type: 'image' as NodeType, label: 'Image' },
                { type: 'video' as NodeType, label: 'Video' },
                { type: 'code' as NodeType, label: 'Code' },
                { type: 'embed' as NodeType, label: 'Embed' },
                { type: 'divider' as NodeType, label: 'Divider' },
                { type: 'interactive' as NodeType, label: 'Interactive' },
              ].map(({ type, label }) => (
                <button
                  key={type}
                  onClick={() => addBlock(type)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    published: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    draft: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
    archived: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${
        styles[status as keyof typeof styles] || styles.draft
      }`}
    >
      {status}
    </span>
  );
}
