'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { NodeWithAsset, Asset } from '@/lib/supabase/types';
import { Upload, X } from 'lucide-react';

interface ImageBlockEditorProps {
  node: NodeWithAsset;
  onUpdate: (updates: Partial<NodeWithAsset>) => void;
}

export default function ImageBlockEditor({ node, onUpdate }: ImageBlockEditorProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const metadata = node.metadata as { alt?: string; caption?: string };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const supabase = getSupabaseClient();

      // Generate unique filename
      const ext = file.name.split('.').pop();
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const storagePath = `posts/${filename}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('blog-assets')
        .upload(storagePath, file);

      if (uploadError) throw uploadError;

      // Get image dimensions
      const dimensions = await getImageDimensions(file);

      // Create asset record
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

      // Update node with asset
      const { error: nodeError } = await supabase
        .from('nodes')
        .update({ asset_id: asset.id })
        .eq('id', node.id);

      if (nodeError) throw nodeError;

      onUpdate({ asset_id: asset.id, asset: asset as Asset });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [node.id, onUpdate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    maxFiles: 1,
  });

  const handleMetadataChange = (field: 'alt' | 'caption', value: string) => {
    onUpdate({
      metadata: { ...metadata, [field]: value },
    });
  };

  const removeImage = async () => {
    const supabase = getSupabaseClient();
    await supabase.from('nodes').update({ asset_id: null }).eq('id', node.id);
    onUpdate({ asset_id: null, asset: null });
  };

  const imageUrl = node.asset
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${node.asset.bucket}/${node.asset.storage_path}`
    : null;

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {imageUrl ? (
        <div className="relative">
          <Image
            src={imageUrl}
            alt={metadata?.alt || 'Uploaded image'}
            width={node.asset?.width || 800}
            height={node.asset?.height || 600}
            className="w-full h-auto rounded-lg"
          />
          <button
            onClick={removeImage}
            className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
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
      )}

      {imageUrl && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
              Alt Text
            </label>
            <input
              type="text"
              value={metadata?.alt || ''}
              onChange={(e) => handleMetadataChange('alt', e.target.value)}
              placeholder="Describe the image"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
              Caption
            </label>
            <input
              type="text"
              value={metadata?.caption || ''}
              onChange={(e) => handleMetadataChange('caption', e.target.value)}
              placeholder="Optional caption"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
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
    img.onerror = () => {
      resolve({ width: 0, height: 0 });
    };
    img.src = URL.createObjectURL(file);
  });
}
