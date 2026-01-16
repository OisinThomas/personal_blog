'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { MajorTag, Language, PostStatus } from '@/lib/supabase/types';

const postSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  description: z.string().optional(),
  major_tag: z.enum(['Thoughts', 'Tinkering', 'Translations']),
  sub_tag: z.string().optional(),
  language: z.enum(['en', 'ga']),
  tags: z.string().optional(),
  author: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']),
  source: z.string().optional(),
  source_url: z.string().url().optional().or(z.literal('')),
});

type PostFormData = z.infer<typeof postSchema>;

interface PostFormProps {
  initialData?: Partial<PostFormData>;
  postId?: string;
}

export default function PostForm({ initialData, postId }: PostFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      description: initialData?.description || '',
      major_tag: initialData?.major_tag || 'Thoughts',
      sub_tag: initialData?.sub_tag || '',
      language: initialData?.language || 'en',
      tags: initialData?.tags || '',
      author: initialData?.author || 'Oisin Thomas',
      status: initialData?.status || 'draft',
      source: initialData?.source || '',
      source_url: initialData?.source_url || '',
    },
  });

  const title = watch('title');

  // Auto-generate slug from title
  const generateSlug = () => {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    setValue('slug', slug);
  };

  const onSubmit = async (data: PostFormData) => {
    setLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseClient();

      const postData = {
        ...data,
        tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        source_url: data.source_url || null,
        description: data.description || null,
        sub_tag: data.sub_tag || null,
        source: data.source || null,
      };

      if (postId) {
        // Update existing post
        const { error: updateError } = await supabase
          .from('posts')
          .update(postData)
          .eq('id', postId);

        if (updateError) throw updateError;
      } else {
        // Create new post
        const { data: newPost, error: createError } = await supabase
          .from('posts')
          .insert(postData)
          .select()
          .single();

        if (createError) throw createError;

        // Create initial empty markdown node
        const { error: nodeError } = await supabase.from('nodes').insert({
          post_id: newPost.id,
          type: 'markdown',
          position: 0,
          content: '',
          metadata: {},
        });

        if (nodeError) throw nodeError;

        router.push(`/admin/posts/${newPost.slug}`);
        return;
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-6 space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            {...register('title')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        {/* Slug */}
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Slug *
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="slug"
              {...register('slug')}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={generateSlug}
              className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              Generate
            </button>
          </div>
          {errors.slug && (
            <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            {...register('description')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="major_tag" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Category *
            </label>
            <select
              id="major_tag"
              {...register('major_tag')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Thoughts">Thoughts</option>
              <option value="Tinkering">Tinkering</option>
              <option value="Translations">Translations</option>
            </select>
          </div>

          <div>
            <label htmlFor="sub_tag" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Sub-category
            </label>
            <input
              type="text"
              id="sub_tag"
              {...register('sub_tag')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Language */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Language *
            </label>
            <select
              id="language"
              {...register('language')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="en">English</option>
              <option value="ga">Irish (Gaeilge)</option>
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Status *
            </label>
            <select
              id="status"
              {...register('status')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            id="tags"
            {...register('tags')}
            placeholder="ai, writing, tech"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Author */}
        <div>
          <label htmlFor="author" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Author
          </label>
          <input
            type="text"
            id="author"
            {...register('author')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Source */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="source" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Source
            </label>
            <input
              type="text"
              id="source"
              {...register('source')}
              placeholder="Substack"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="source_url" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Source URL
            </label>
            <input
              type="url"
              id="source_url"
              {...register('source_url')}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors"
        >
          {loading ? 'Saving...' : postId ? 'Update Post' : 'Create Post'}
        </button>
      </div>
    </form>
  );
}
