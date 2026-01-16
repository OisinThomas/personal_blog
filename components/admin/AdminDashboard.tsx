'use client';

import Link from 'next/link';
import { signOut } from '@/lib/supabase/auth';
import { useRouter } from 'next/navigation';
import { FileText, Image as ImageIcon, Edit3, LogOut, Plus } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

interface AdminDashboardProps {
  user: User;
  stats: {
    publishedPosts: number;
    draftPosts: number;
    totalAssets: number;
  };
  recentPosts: Array<{
    id: string;
    slug: string;
    title: string;
    status: string;
    published_at: string | null;
    updated_at: string;
  }>;
}

export default function AdminDashboard({ user, stats, recentPosts }: AdminDashboardProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Blog CMS</h1>
              <nav className="hidden md:flex items-center gap-4">
                <Link
                  href="/admin/posts"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Posts
                </Link>
                <Link
                  href="/admin/assets"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Assets
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
                {user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="mb-8">
          <Link
            href="/admin/posts/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Post
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Published</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.publishedPosts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <Edit3 className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Drafts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.draftPosts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <ImageIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Assets</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalAssets}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Posts */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Posts</h2>
          </div>

          {recentPosts.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
              <p>No posts yet.</p>
              <Link
                href="/admin/posts/new"
                className="text-blue-600 hover:underline mt-2 inline-block"
              >
                Create your first post
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentPosts.map((post) => (
                <li key={post.id}>
                  <Link
                    href={`/admin/posts/${post.slug}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{post.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Published: {post.published_at ? new Date(post.published_at).toISOString().split('T')[0] : 'Draft'}
                        {post.updated_at !== post.published_at && post.published_at && (
                          <span className="ml-2">· Updated: {new Date(post.updated_at).toISOString().split('T')[0]}</span>
                        )}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        post.status === 'published'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                          : post.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                      }`}
                    >
                      {post.status}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {recentPosts.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/admin/posts"
                className="text-blue-600 hover:underline text-sm"
              >
                View all posts &rarr;
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
