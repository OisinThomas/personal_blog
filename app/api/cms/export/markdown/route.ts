import { NextResponse } from 'next/server';
import JSZip from 'jszip';
import { createClient } from '@/lib/supabase/server';
import { postToMarkdown } from '@/lib/export/nodes-to-markdown';
import type { PostWithAsset, NodeWithAsset } from '@/lib/supabase/types';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch all posts
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select(`*, featured_image:assets!featured_image_id(*)`)
    .order('published_at', { ascending: false, nullsFirst: false });

  if (postsError) {
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }

  // Fetch all nodes for all posts, ordered by position
  const postIds = posts.map((p: PostWithAsset) => p.id);
  const { data: allNodes, error: nodesError } = await supabase
    .from('nodes')
    .select(`*, asset:assets(*)`)
    .in('post_id', postIds)
    .order('position', { ascending: true });

  if (nodesError) {
    return NextResponse.json({ error: 'Failed to fetch nodes' }, { status: 500 });
  }

  // Group nodes by post_id
  const nodesByPost = new Map<string, NodeWithAsset[]>();
  for (const node of allNodes as NodeWithAsset[]) {
    const existing = nodesByPost.get(node.post_id) ?? [];
    existing.push(node);
    nodesByPost.set(node.post_id, existing);
  }

  // Build ZIP
  const zip = new JSZip();
  for (const post of posts as PostWithAsset[]) {
    const nodes = nodesByPost.get(post.id) ?? [];
    const markdown = postToMarkdown(post, nodes);
    zip.file(`${post.slug}.md`, markdown);
  }

  const buffer = await zip.generateAsync({ type: 'arraybuffer' });
  const date = new Date().toISOString().split('T')[0];

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="blog-export-${date}.zip"`,
    },
  });
}
