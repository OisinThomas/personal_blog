'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey } from 'lexical';
import { $isImageNode, ImageNode } from '@/lib/lexical/nodes/ImageNode';
import { getSupabaseClient } from '@/lib/supabase/client';
import { Upload, X, Trash2 } from 'lucide-react';

interface ImageNodeComponentProps {
  nodeKey: string;
}

export default function ImageNodeComponent({ nodeKey }: ImageNodeComponentProps) {
  const [editor] = useLexicalComposerContext();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Read current node data
  const [nodeData, setNodeData] = useState(() => {
    let data = { assetId: '', src: '', alt: '', caption: '', width: 0, height: 0 };
    editor.getEditorState().read(() => {
      const node = $getNodeByKey(nodeKey);
      if (node instanceof ImageNode) {
        data = {
          assetId: node.getAssetId(),
          src: node.getSrc(),
          alt: node.getAlt(),
          caption: node.getCaption(),
          width: node.getWidth(),
          height: node.getHeight(),
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
        if (node instanceof ImageNode) {
          if (updates.assetId !== undefined) node.setAssetId(updates.assetId);
          if (updates.src !== undefined) node.setSrc(updates.src);
          if (updates.alt !== undefined) node.setAlt(updates.alt);
          if (updates.caption !== undefined) node.setCaption(updates.caption);
          if (updates.width !== undefined) node.setWidth(updates.width);
          if (updates.height !== undefined) node.setHeight(updates.height);
        }
      });
    },
    [editor, nodeKey, nodeData]
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setUploading(true);
      setError(null);

      try {
        const supabase = getSupabaseClient();
        const ext = file.name.split('.').pop();
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const storagePath = `posts/${filename}`;

        const { error: uploadError } = await supabase.storage
          .from('blog-assets')
          .upload(storagePath, file);

        if (uploadError) throw uploadError;

        const dimensions = await getImageDimensions(file);

        const { data: asset, error: assetError } = await supabase
          .from('assets')
          .insert({
            storage_path: storagePath,
            bucket: 'blog-assets',
            filename: file.name,
            mime_type: file.type,
            file_size: file.size,
            width: dimensions.width,
            height: dimensions.height,
          })
          .select()
          .single();

        if (assetError) throw assetError;

        const src = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/blog-assets/${storagePath}`;
        updateNode({
          assetId: asset.id,
          src,
          width: dimensions.width,
          height: dimensions.height,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setUploading(false);
      }
    },
    [updateNode]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
    maxFiles: 1,
  });

  const removeImage = useCallback(() => {
    updateNode({ assetId: '', src: '', width: 0, height: 0 });
  }, [updateNode]);

  const deleteBlock = useCallback(() => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (node) {
        node.remove();
      }
    });
  }, [editor, nodeKey]);

  return (
    <div className="my-2" data-lexical-decorator="true">
      {error && (
        <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded text-red-700 dark:text-red-400 text-sm mb-2">
          {error}
        </div>
      )}

      {nodeData.src ? (
        <figure className="relative group/img">
          <Image
            src={nodeData.src}
            alt={nodeData.alt || 'Uploaded image'}
            width={nodeData.width || 800}
            height={nodeData.height || 600}
            className="w-full h-auto rounded-lg"
          />
          <div className="absolute top-2 right-2 flex items-center gap-1">
            <button
              onClick={removeImage}
              title="Remove image"
              className="p-2 bg-gray-800/80 text-white rounded-full hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={deleteBlock}
              title="Delete block"
              className="p-2 bg-red-600/90 text-white rounded-full hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <input
              type="text"
              value={nodeData.alt}
              onChange={(e) => updateNode({ alt: e.target.value })}
              placeholder="Alt text"
              className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <input
              type="text"
              value={nodeData.caption}
              onChange={(e) => updateNode({ caption: e.target.value })}
              placeholder="Caption"
              className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </figure>
      ) : (
        <div className="relative">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-500 dark:text-gray-400" />
            {uploading ? (
              <p className="text-gray-500 dark:text-gray-400">Uploading...</p>
            ) : isDragActive ? (
              <p className="text-blue-600">Drop the image here</p>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                Drag and drop an image, or click to select
              </p>
            )}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); deleteBlock(); }}
            title="Delete block"
            className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = document.createElement('img');
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = URL.createObjectURL(file);
  });
}
