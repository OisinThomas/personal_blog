import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminDashboard from '@/components/admin/AdminDashboard';

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  // Fetch dashboard stats
  const [postsResult, draftsResult, assetsResult] = await Promise.all([
    supabase.from('posts').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('posts').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('assets').select('id', { count: 'exact', head: true }),
  ]);

  const stats = {
    publishedPosts: postsResult.count ?? 0,
    draftPosts: draftsResult.count ?? 0,
    totalAssets: assetsResult.count ?? 0,
  };

  // Fetch recent posts (by published date)
  const { data: recentPosts } = await supabase
    .from('posts')
    .select('id, slug, title, status, published_at, updated_at')
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(5);

  return (
    <AdminDashboard
      user={user}
      stats={stats}
      recentPosts={recentPosts ?? []}
    />
  );
}
