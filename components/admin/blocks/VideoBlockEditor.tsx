'use client';

import type { NodeMetadata } from '@/lib/supabase/types';

interface VideoBlockEditorProps {
  content: string;
  metadata: NodeMetadata;
  onContentChange: (content: string) => void;
  onMetadataChange: (metadata: NodeMetadata) => void;
}

export default function VideoBlockEditor({
  content,
  metadata,
  onContentChange,
  onMetadataChange,
}: VideoBlockEditorProps) {
  const videoMetadata = metadata as {
    provider?: 'youtube' | 'vimeo' | 'self-hosted';
    videoId?: string;
    autoplay?: boolean;
    loop?: boolean;
    caption?: string;
  };

  const handleProviderChange = (provider: string) => {
    onMetadataChange({ ...videoMetadata, provider: provider as 'youtube' | 'vimeo' | 'self-hosted' });
  };

  const handleOptionChange = (option: 'autoplay' | 'loop', value: boolean) => {
    onMetadataChange({ ...videoMetadata, [option]: value });
  };

  const handleCaptionChange = (caption: string) => {
    onMetadataChange({ ...videoMetadata, caption: caption || undefined });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
          Provider
        </label>
        <select
          value={videoMetadata.provider || 'youtube'}
          onChange={(e) => handleProviderChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="youtube">YouTube</option>
          <option value="vimeo">Vimeo</option>
          <option value="self-hosted">Self-hosted URL</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
          {videoMetadata.provider === 'self-hosted' ? 'Video URL' : 'Video ID'}
        </label>
        <input
          type="text"
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder={
            videoMetadata.provider === 'youtube'
              ? 'e.g., dQw4w9WgXcQ'
              : videoMetadata.provider === 'vimeo'
              ? 'e.g., 123456789'
              : 'https://...'
          }
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {videoMetadata.provider !== 'self-hosted' && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Enter just the video ID, not the full URL
          </p>
        )}
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={videoMetadata.autoplay || false}
            onChange={(e) => handleOptionChange('autoplay', e.target.checked)}
            className="rounded border-gray-300 dark:border-gray-600"
          />
          <span className="text-sm text-gray-900 dark:text-white">Autoplay</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={videoMetadata.loop || false}
            onChange={(e) => handleOptionChange('loop', e.target.checked)}
            className="rounded border-gray-300 dark:border-gray-600"
          />
          <span className="text-sm text-gray-900 dark:text-white">Loop</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
          Caption (optional)
        </label>
        <input
          type="text"
          value={videoMetadata.caption || ''}
          onChange={(e) => handleCaptionChange(e.target.value)}
          placeholder="Add a caption for this video"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {content && videoMetadata.provider === 'youtube' && (
        <div className="aspect-video rounded-lg overflow-hidden">
          <iframe
            src={`https://www.youtube.com/embed/${content}`}
            title="Video preview"
            className="w-full h-full"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
}
