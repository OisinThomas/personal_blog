import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import { createClient } from '@/lib/supabase/server';
import { validateApiKey } from '@/lib/api/auth';
import { postToMarkdown, buildFrontmatter } from '@/lib/export/nodes-to-markdown';
import { lexicalToMarkdown } from '@/lib/export/lexical-to-markdown';
import type { PostWithAsset, NodeWithAsset, Footnote } from '@/lib/supabase/types';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

function getAssetPublicUrl(bucket: string, storagePath: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${storagePath}`;
}

/**
 * Collect all image URLs from a Lexical editor state.
 */
function collectLexicalImageUrls(obj: unknown): string[] {
  if (!obj || typeof obj !== 'object') return [];
  const record = obj as Record<string, unknown>;
  const urls: string[] = [];
  if (record.type === 'image' && typeof record.src === 'string' && record.src) {
    urls.push(record.src);
  }
  if (Array.isArray(record.children)) {
    for (const child of record.children) {
      urls.push(...collectLexicalImageUrls(child));
    }
  }
  return urls;
}

/**
 * Collect all image URLs from legacy nodes.
 */
function collectNodeImageUrls(nodes: NodeWithAsset[]): string[] {
  const urls: string[] = [];
  for (const node of nodes) {
    if (node.type === 'image' && node.asset) {
      urls.push(getAssetPublicUrl(node.asset.bucket, node.asset.storage_path));
    }
  }
  return urls;
}

/**
 * Download an asset and return its buffer + filename for the ZIP.
 */
async function downloadAsset(
  url: string
): Promise<{ buffer: ArrayBuffer; filename: string } | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BlogCMS/1.0)' },
    });
    if (!res.ok) return null;
    const buffer = await res.arrayBuffer();
    // Derive filename from URL path
    const pathname = new URL(url).pathname;
    const filename = pathname.split('/').pop() || 'image.jpg';
    return { buffer, filename };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  // Dual auth: Supabase session OR API key
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const apiKeyError = validateApiKey(request);
    if (apiKeyError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // Fetch all posts
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select(`*, featured_image:assets!featured_image_id(*)`)
    .order('published_at', { ascending: false, nullsFirst: false });

  if (postsError) {
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }

  // Fetch all nodes for legacy posts
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

  // Collect all image URLs and download assets for the ZIP
  const allImageUrls = new Set<string>();
  for (const post of posts as PostWithAsset[]) {
    if (post.editor_state) {
      for (const url of collectLexicalImageUrls(post.editor_state)) {
        allImageUrls.add(url);
      }
    } else {
      const nodes = nodesByPost.get(post.id) ?? [];
      for (const url of collectNodeImageUrls(nodes)) {
        allImageUrls.add(url);
      }
    }
  }

  // Download all assets and build URL-to-relative-path map
  const assetUrlMap = new Map<string, string>();
  const assetBuffers = new Map<string, ArrayBuffer>();

  await Promise.all(
    [...allImageUrls].map(async (url) => {
      const result = await downloadAsset(url);
      if (result) {
        const relativePath = `assets/${result.filename}`;
        assetUrlMap.set(url, relativePath);
        assetBuffers.set(relativePath, result.buffer);
      }
    })
  );

  // Build ZIP
  const zip = new JSZip();

  for (const post of posts as PostWithAsset[]) {
    let markdown: string;

    if (post.editor_state) {
      // Lexical post
      const frontmatter = buildFrontmatter(post);
      const footnotes = (post as PostWithAsset & { footnotes?: Footnote[] }).footnotes ?? [];
      const body = lexicalToMarkdown(post.editor_state, {
        assetUrlMap,
        footnotes,
      });
      markdown = `${frontmatter}\n\n${body}`;
    } else {
      // Legacy node-based post
      const nodes = nodesByPost.get(post.id) ?? [];
      markdown = postToMarkdown(post, nodes, assetUrlMap);
    }

    zip.file(`${post.slug}.md`, markdown);
  }

  // Add asset files to ZIP
  for (const [path, buffer] of assetBuffers) {
    zip.file(path, buffer);
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
