import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import { createClient } from '@/lib/supabase/server';
import { validateApiKey } from '@/lib/api/auth';
import { buildFrontmatter } from '@/lib/export/nodes-to-markdown';
import { lexicalToMarkdown } from '@/lib/export/lexical-to-markdown';
import type { PostWithAsset, Footnote } from '@/lib/supabase/types';

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

  // Collect all image URLs from Lexical editor states
  const allImageUrls = new Set<string>();
  for (const post of posts as PostWithAsset[]) {
    if (post.editor_state) {
      for (const url of collectLexicalImageUrls(post.editor_state)) {
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
    if (!post.editor_state) continue;

    const frontmatter = buildFrontmatter(post);
    const footnotes = (post as PostWithAsset & { footnotes?: Footnote[] }).footnotes ?? [];
    const body = lexicalToMarkdown(post.editor_state, {
      assetUrlMap,
      footnotes,
    });
    zip.file(`${post.slug}.md`, `${frontmatter}\n\n${body}`);
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
