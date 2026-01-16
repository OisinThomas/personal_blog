'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { Asset } from '@/lib/supabase/types';
import { Upload, Trash2, Copy, Check } from 'lucide-react';

interface AssetLibraryProps {
  initialAssets: Asset[];
}

export default function AssetLibrary({ initialAssets }: AssetLibraryProps) {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);

    try {
      const supabase = getSupabaseClient();

      for (const file of acceptedFiles) {
        // Generate unique filename
        const ext = file.name.split('.').pop();
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const storagePath = `uploads/${filename}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('blog-assets')
          .upload(storagePath, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          continue;
        }

        // Get dimensions if image
        let dimensions = { width: 0, height: 0 };
        if (file.type.startsWith('image/')) {
          dimensions = await getImageDimensions(file);
        }

        // Create asset record
        const { data: asset, error: assetError } = await supabase
          .from('assets')
          .insert({
            storage_path: storagePath,
            bucket: 'blog-assets',
            filename: file.name,
            mime_type: file.type,
            file_size: file.size,
            width: dimensions.width || null,
            height: dimensions.height || null,
          })
          .select()
          .single();

        if (assetError) {
          console.error('Asset error:', assetError);
          continue;
        }

        setAssets((prev) => [asset, ...prev]);
      }

      router.refresh();
    } finally {
      setUploading(false);
    }
  }, [router]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'],
      'video/*': ['.mp4', '.webm', '.mov'],
    },
  });

  const deleteAsset = async (asset: Asset) => {
    if (!confirm('Delete this asset? It may break posts using it.')) return;

    const supabase = getSupabaseClient();

    // Delete from storage
    await supabase.storage.from(asset.bucket).remove([asset.storage_path]);

    // Delete record
    await supabase.from('assets').delete().eq('id', asset.id);

    setAssets((prev) => prev.filter((a) => a.id !== asset.id));
    router.refresh();
  };

  const copyUrl = async (asset: Asset) => {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${asset.bucket}/${asset.storage_path}`;
    await navigator.clipboard.writeText(url);
    setCopied(asset.id);
    setTimeout(() => setCopied(null), 2000);
  };

  const getAssetUrl = (asset: Asset) =>
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${asset.bucket}/${asset.storage_path}`;

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-10 h-10 mx-auto mb-3 text-gray-500 dark:text-gray-400" />
        {uploading ? (
          <p className="text-gray-500 dark:text-gray-400">Uploading...</p>
        ) : isDragActive ? (
          <p className="text-blue-600">Drop files here</p>
        ) : (
          <>
            <p className="text-gray-900 dark:text-white font-medium">
              Drag and drop files here, or click to select
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Supports images (PNG, JPG, GIF, WebP, SVG) and videos (MP4, WebM)
            </p>
          </>
        )}
      </div>

      {/* Asset Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {assets.map((asset) => (
          <div
            key={asset.id}
            className="group relative bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden"
          >
            {asset.mime_type.startsWith('image/') ? (
              <Image
                src={getAssetUrl(asset)}
                alt={asset.alt_text || asset.filename}
                width={200}
                height={200}
                className="w-full h-32 object-cover"
              />
            ) : (
              <div className="w-full h-32 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {asset.mime_type.split('/')[1].toUpperCase()}
                </span>
              </div>
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                onClick={() => copyUrl(asset)}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                title="Copy URL"
              >
                {copied === asset.id ? (
                  <Check className="w-4 h-4 text-white" />
                ) : (
                  <Copy className="w-4 h-4 text-white" />
                )}
              </button>
              <button
                onClick={() => deleteAsset(asset)}
                className="p-2 bg-red-500/80 hover:bg-red-500 rounded-full transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Info */}
            <div className="p-2">
              <p className="text-xs text-gray-900 dark:text-white truncate">{asset.filename}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatFileSize(asset.file_size)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {assets.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No assets uploaded yet. Drag and drop files above to upload.
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

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
