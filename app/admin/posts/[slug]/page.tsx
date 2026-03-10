import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import PostEditor from '@/components/admin/PostEditor';
import type { PostWithAsset } from '@/lib/supabase/types';
import { generatePreviewToken } from '@/lib/preview';

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  // Fetch post with featured image
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select(`
      *,
      featured_image:assets!featured_image_id(*)
    `)
    .eq('slug', slug)
    .single();

  if (postError || !post) {
    notFound();
  }

  const typedPost = post as unknown as PostWithAsset;
  const previewToken = generatePreviewToken(typedPost.id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-xl font-bold text-gray-900 dark:text-white">
                Blog CMS
              </Link>
              <span className="text-gray-400">/</span>
              <Link href="/admin/posts" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Posts
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 dark:text-white truncate max-w-xs">{typedPost.title}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <PostEditor post={typedPost} previewToken={previewToken} />
      </main>
    </div>
  );
}
