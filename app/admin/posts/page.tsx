import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import type { Post } from '@/lib/supabase/types';

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort = 'published_at' } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  const sortColumn = sort === 'updated_at' ? 'updated_at' : 'published_at';
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .order(sortColumn, { ascending: false, nullsFirst: false });

  if (error) {
    console.error('Error fetching posts:', error);
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-xl font-bold text-gray-900 dark:text-white">
                Blog CMS
              </Link>
              <nav className="flex items-center gap-4">
                <span className="text-gray-900 dark:text-white font-medium">Posts</span>
                <Link
                  href="/admin/assets"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Assets
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Posts</h1>
          <Link
            href="/admin/posts/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Post
          </Link>
        </div>

        {/* Posts Table */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <div className="flex gap-2">
                    <Link
                      href="/admin/posts?sort=published_at"
                      className={sortColumn === 'published_at' ? 'text-blue-600 underline' : 'hover:text-gray-700 dark:hover:text-gray-200'}
                    >
                      Published
                    </Link>
                    <span>/</span>
                    <Link
                      href="/admin/posts?sort=updated_at"
                      className={sortColumn === 'updated_at' ? 'text-blue-600 underline' : 'hover:text-gray-700 dark:hover:text-gray-200'}
                    >
                      Updated
                    </Link>
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {posts?.map((post: Post) => (
                <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <Link
                        href={`/admin/posts/${post.slug}`}
                        className="font-medium text-gray-900 dark:text-white hover:text-blue-600"
                      >
                        {post.title}
                      </Link>
                      {post.language === 'ga' && (
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">[GA]</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">/blog/{post.slug}</div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={post.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {post.major_tag}
                    {post.sub_tag && ` / ${post.sub_tag}`}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    <div>
                      {sortColumn === 'published_at'
                        ? (post.published_at ? new Date(post.published_at).toISOString().split('T')[0] : 'Draft')
                        : new Date(post.updated_at).toISOString().split('T')[0]}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        title="View post"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/posts/${post.slug}`}
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        title="Edit post"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {(!posts || posts.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No posts yet.{' '}
                    <Link href="/admin/posts/new" className="text-blue-600 hover:underline">
                      Create your first post
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
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
