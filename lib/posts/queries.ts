import { createClient } from '@/lib/supabase/server';
import type { Post, PostWithAsset, Node, NodeWithAsset, MajorTag } from '@/lib/supabase/types';

export async function getAllPosts(options?: {
  status?: 'published' | 'draft' | 'archived';
  majorTag?: MajorTag;
  limit?: number;
}): Promise<PostWithAsset[]> {
  const supabase = await createClient();

  let query = supabase
    .from('posts')
    .select(`
      *,
      featured_image:assets!featured_image_id(*)
    `)
    .order('published_at', { ascending: false, nullsFirst: false });

  if (options?.status) {
    query = query.eq('status', options.status);
  }

  if (options?.majorTag) {
    query = query.eq('major_tag', options.majorTag);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }

  return data as PostWithAsset[];
}

export async function getPublishedPosts(options?: {
  majorTag?: MajorTag;
  limit?: number;
}): Promise<PostWithAsset[]> {
  return getAllPosts({ status: 'published', ...options });
}

export async function getPostBySlug(slug: string): Promise<PostWithAsset | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      featured_image:assets!featured_image_id(*)
    `)
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Error fetching post:', error);
    throw error;
  }

  return data as PostWithAsset;
}

export async function getPostWithNodes(slug: string): Promise<{
  post: PostWithAsset;
  nodes: NodeWithAsset[];
} | null> {
  const supabase = await createClient();

  // Fetch post
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select(`
      *,
      featured_image:assets!featured_image_id(*)
    `)
    .eq('slug', slug)
    .single();

  if (postError) {
    if (postError.code === 'PGRST116') {
      return null;
    }
    throw postError;
  }

  // Fetch nodes for this post
  const { data: nodes, error: nodesError } = await supabase
    .from('nodes')
    .select(`
      *,
      asset:assets(*)
    `)
    .eq('post_id', post.id)
    .order('position', { ascending: true });

  if (nodesError) {
    throw nodesError;
  }

  return {
    post: post as PostWithAsset,
    nodes: nodes as NodeWithAsset[],
  };
}

export async function getPostSlugs(): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('posts')
    .select('slug')
    .eq('status', 'published');

  if (error) {
    console.error('Error fetching post slugs:', error);
    throw error;
  }

  return data.map((post: { slug: string }) => post.slug);
}

export async function getPostsByMajorTag(): Promise<Record<MajorTag, PostWithAsset[]>> {
  const posts = await getPublishedPosts();

  const grouped: Record<MajorTag, PostWithAsset[]> = {
    'Thoughts': [],
    'Tinkering': [],
    'Translations': [],
  };

  for (const post of posts) {
    if (grouped[post.major_tag]) {
      grouped[post.major_tag].push(post);
    }
  }

  return grouped;
}

export async function searchPosts(query: string): Promise<PostWithAsset[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      featured_image:assets!featured_image_id(*)
    `)
    .eq('status', 'published')
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error searching posts:', error);
    throw error;
  }

  return data as PostWithAsset[];
}

export async function getPublishedPostsByTag(tag: string): Promise<PostWithAsset[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      featured_image:assets!featured_image_id(*)
    `)
    .eq('status', 'published')
    .contains('tags', [tag])
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts by tag:', error);
    throw error;
  }

  return data as PostWithAsset[];
}
