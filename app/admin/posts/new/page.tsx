import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import PostForm from '@/components/admin/PostForm';

export default async function NewPostPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
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
              <span className="text-gray-400">/</span>
              <Link href="/admin/posts" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Posts
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 dark:text-white">New Post</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Create New Post</h1>
        <PostForm />
      </main>
    </div>
  );
}
