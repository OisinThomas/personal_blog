'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { PostWithAsset, Asset } from '@/lib/supabase/types';
import { Trash2, Calendar, X } from 'lucide-react';
import FeaturedImagePicker from './FeaturedImagePicker';

interface PostMetadataFormProps {
  post: PostWithAsset;
  onDelete: () => void;
}

// Helper to format ISO date to datetime-local input value
function toDatetimeLocal(isoString: string | null): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  // Format: YYYY-MM-DDTHH:MM
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Helper to convert datetime-local value to ISO string
function fromDatetimeLocal(localValue: string): string | null {
  if (!localValue) return null;
  return new Date(localValue).toISOString();
}

export default function PostMetadataForm({ post, onDelete }: PostMetadataFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: post.title,
    slug: post.slug,
    description: post.description || '',
    major_tag: post.major_tag,
    sub_tag: post.sub_tag || '',
    language: post.language,
    tags: post.tags.join(', '),
    author: post.author,
    source: post.source || '',
    source_url: post.source_url || '',
    created_at: toDatetimeLocal(post.created_at),
    published_at: toDatetimeLocal(post.published_at),
    featured_image_id: post.featured_image_id,
  });

  const [featuredAsset, setFeaturedAsset] = useState<Asset | null>(
    post.featured_image
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFeaturedImageSelect = async (assetId: string | null) => {
    setFormData((prev) => ({ ...prev, featured_image_id: assetId }));

    if (assetId) {
      // Fetch the asset details to display
      const supabase = getSupabaseClient();
      const { data } = await supabase
        .from('assets')
        .select('*')
        .eq('id', assetId)
        .single();
      setFeaturedAsset(data);
    } else {
      setFeaturedAsset(null);
    }
  };

  const clearPublishedAt = () => {
    setFormData((prev) => ({ ...prev, published_at: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const supabase = getSupabaseClient();

      const { error } = await supabase
        .from('posts')
        .update({
          title: formData.title,
          slug: formData.slug,
          description: formData.description || null,
          major_tag: formData.major_tag,
          sub_tag: formData.sub_tag || null,
          language: formData.language,
          tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
          author: formData.author,
          source: formData.source || null,
          source_url: formData.source_url || null,
          created_at: fromDatetimeLocal(formData.created_at) || post.created_at,
          published_at: fromDatetimeLocal(formData.published_at),
          featured_image_id: formData.featured_image_id || null,
        })
        .eq('id', post.id);

      if (error) throw error;

      // If slug changed, redirect to new URL
      if (formData.slug !== post.slug) {
        router.push(`/admin/posts/${formData.slug}`);
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error('Error saving metadata:', err);
    } finally {
      setSaving(false);
    }
  };

  // Determine if published_at is in the future (scheduled)
  const publishedAtDate = formData.published_at ? new Date(formData.published_at) : null;
  const isScheduled = publishedAtDate && publishedAtDate > new Date();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Slug</label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Date Pickers */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Created At
            </span>
          </label>
          <input
            type="datetime-local"
            name="created_at"
            value={formData.created_at}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Published At
              {isScheduled && (
                <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-0.5 rounded-full">
                  Scheduled
                </span>
              )}
            </span>
          </label>
          <div className="flex gap-2">
            <input
              type="datetime-local"
              name="published_at"
              value={formData.published_at}
              onChange={handleChange}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {formData.published_at && (
              <button
                type="button"
                onClick={clearPublishedAt}
                className="px-3 py-2 text-gray-500 hover:text-red-600 border border-gray-300 dark:border-gray-600 rounded-md transition-colors"
                title="Clear published date"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Leave empty for unpublished drafts. Set future date to schedule.
          </p>
        </div>
      </div>

      {/* Featured Image */}
      <FeaturedImagePicker
        currentAsset={featuredAsset}
        onSelect={handleFeaturedImageSelect}
      />

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Category</label>
          <select
            name="major_tag"
            value={formData.major_tag}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Thoughts">Thoughts</option>
            <option value="Tinkering">Tinkering</option>
            <option value="Translations">Translations</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Sub-category</label>
          <input
            type="text"
            name="sub_tag"
            value={formData.sub_tag}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Language</label>
          <select
            name="language"
            value={formData.language}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="en">English</option>
            <option value="ga">Irish</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Tags (comma-separated)</label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Author</label>
          <input
            type="text"
            name="author"
            value={formData.author}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Source</label>
          <input
            type="text"
            name="source"
            value={formData.source}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Source URL</label>
          <input
            type="url"
            name="source_url"
            value={formData.source_url}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onDelete}
          className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Delete Post
        </button>

        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
