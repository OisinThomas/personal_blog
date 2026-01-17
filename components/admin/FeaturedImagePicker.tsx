'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { Asset } from '@/lib/supabase/types';
import { ImageIcon, X, Upload, Check } from 'lucide-react';

interface FeaturedImagePickerProps {
  currentAsset: Asset | null;
  onSelect: (assetId: string | null) => void;
}

export default function FeaturedImagePicker({
  currentAsset,
  onSelect,
}: FeaturedImagePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(
    currentAsset?.id || null
  );

  useEffect(() => {
    if (isOpen) {
      loadAssets();
    }
  }, [isOpen]);

  const loadAssets = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .like('mime_type', 'image/%')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setAssets(data || []);
    } catch (err) {
      console.error('Error loading assets:', err);
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    try {
      const supabase = getSupabaseClient();
      const file = acceptedFiles[0];

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
        return;
      }

      // Get dimensions
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
          width: dimensions.width || null,
          height: dimensions.height || null,
        })
        .select()
        .single();

      if (assetError) {
        console.error('Asset error:', assetError);
        return;
      }

      // Add to list and select it
      setAssets((prev) => [asset, ...prev]);
      setSelectedId(asset.id);
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    maxFiles: 1,
  });

  const handleConfirm = () => {
    onSelect(selectedId);
    setIsOpen(false);
  };

  const handleRemove = () => {
    onSelect(null);
    setSelectedId(null);
  };

  const getAssetUrl = (asset: Asset) =>
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${asset.bucket}/${asset.storage_path}`;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
        Featured Image
      </label>

      {currentAsset ? (
        <div className="relative inline-block">
          <Image
            src={getAssetUrl(currentAsset)}
            alt={currentAsset.alt_text || 'Featured image'}
            width={200}
            height={120}
            className="rounded-md object-cover border border-gray-300 dark:border-gray-600"
          />
          <div className="absolute top-2 right-2 flex gap-1">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs"
            >
              Change
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-md text-gray-600 dark:text-gray-300 hover:border-blue-500 hover:text-blue-500 transition-colors"
        >
          <ImageIcon className="w-4 h-4" />
          Select Featured Image
        </button>
      )}

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Select Featured Image
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Upload area */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors mb-4 ${
                  isDragActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="w-6 h-6 mx-auto mb-2 text-gray-500 dark:text-gray-400" />
                {uploading ? (
                  <p className="text-sm text-gray-500">Uploading...</p>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Drop an image here or click to upload
                  </p>
                )}
              </div>

              {/* Asset grid */}
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {assets.map((asset) => (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => setSelectedId(asset.id)}
                      className={`relative rounded-md overflow-hidden border-2 transition-colors ${
                        selectedId === asset.id
                          ? 'border-blue-500'
                          : 'border-transparent hover:border-gray-400'
                      }`}
                    >
                      <Image
                        src={getAssetUrl(asset)}
                        alt={asset.alt_text || asset.filename}
                        width={150}
                        height={100}
                        className="w-full h-24 object-cover"
                      />
                      {selectedId === asset.id && (
                        <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                          <Check className="w-6 h-6 text-blue-600" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {!loading && assets.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No images found. Upload one above.
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!selectedId}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors"
              >
                Select
              </button>
            </div>
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
