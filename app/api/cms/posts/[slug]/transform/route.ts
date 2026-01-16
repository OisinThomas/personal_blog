import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateApiKey, jsonResponse, errorResponse } from '@/lib/api/auth';
import { getPostBySlug, getPostWithNodes } from '@/lib/posts/queries';
import { replacePostNodes } from '@/lib/posts/mutations';
import { transformMarkdown, downloadImage, TransformedBlock } from '@/lib/api/markdown-transform';
import type { CreateNodeInput, Asset } from '@/lib/api/types';

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Upload an image from URL to Supabase storage
 */
async function uploadImageFromUrl(
  url: string,
  altText?: string
): Promise<Asset> {
  const supabase = await createClient();

  // Download the image
  const { buffer, contentType, filename } = await downloadImage(url);

  // Generate unique storage path
  const ext = filename.split('.').pop() || 'jpg';
  const uniqueFilename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const storagePath = `posts/${uniqueFilename}`;

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from('blog-assets')
    .upload(storagePath, buffer, {
      contentType,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Storage upload failed: ${uploadError.message}`);
  }

  // Create asset record
  const { data: asset, error: assetError } = await supabase
    .from('assets')
    .insert({
      storage_path: storagePath,
      bucket: 'blog-assets',
      filename,
      mime_type: contentType,
      file_size: buffer.byteLength,
      alt_text: altText || null,
    })
    .select()
    .single();

  if (assetError) {
    // Try to clean up uploaded file
    await supabase.storage.from('blog-assets').remove([storagePath]);
    throw new Error(`Asset record creation failed: ${assetError.message}`);
  }

  return asset as Asset;
}

/**
 * Convert transformed blocks to node inputs, uploading images as needed
 */
async function blocksToNodes(
  blocks: TransformedBlock[]
): Promise<{ nodes: Omit<CreateNodeInput, 'post_id'>[]; assetsCreated: number }> {
  const nodes: Omit<CreateNodeInput, 'post_id'>[] = [];
  let assetsCreated = 0;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    if (block.type === 'image' && block.sourceUrl) {
      // Download and upload remote image
      try {
        const asset = await uploadImageFromUrl(block.sourceUrl, block.altText);
        assetsCreated++;

        nodes.push({
          type: 'image',
          position: i,
          content: undefined,
          metadata: {
            alt: block.altText || asset.alt_text || '',
            caption: block.metadata?.caption || '',
          },
          asset_id: asset.id,
        });
      } catch (error) {
        console.error(`Failed to upload image from ${block.sourceUrl}:`, error);
        // Create a markdown block with the image reference instead
        nodes.push({
          type: 'markdown',
          position: i,
          content: `![${block.altText || 'Image'}](${block.sourceUrl})`,
          metadata: {},
        });
      }
    } else if (block.type === 'image') {
      // Local image path - create node without asset
      nodes.push({
        type: 'image',
        position: i,
        content: block.content,
        metadata: block.metadata || {},
      });
    } else {
      nodes.push({
        type: block.type,
        position: i,
        content: block.content,
        metadata: block.metadata || {},
      });
    }
  }

  return { nodes, assetsCreated };
}

/**
 * POST /api/cms/posts/[slug]/transform
 * Transform markdown content into structured blocks
 *
 * Query params:
 * - apply: boolean - If true, apply the transformation (replace existing nodes)
 *
 * Body:
 * - markdown: string - The markdown content to transform
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const apply = searchParams.get('apply') === 'true';

    // Get post
    const post = await getPostBySlug(slug);
    if (!post) {
      return errorResponse('Post not found', 404);
    }

    const body = await request.json();
    const { markdown } = body;

    if (!markdown || typeof markdown !== 'string') {
      return errorResponse('markdown field is required and must be a string', 400);
    }

    // Transform markdown to blocks
    const { blocks, summary } = transformMarkdown(markdown);

    if (!apply) {
      // Preview mode - just return the transformation result
      return jsonResponse({
        data: {
          blocks,
          summary,
        },
      });
    }

    // Apply mode - convert blocks to nodes and save
    const { nodes: nodeInputs, assetsCreated } = await blocksToNodes(blocks);

    // Replace all nodes for this post
    const nodes = await replacePostNodes(post.id, nodeInputs);

    // Fetch the updated post with nodes
    const result = await getPostWithNodes(slug);

    return jsonResponse({
      data: {
        post: result?.post,
        nodes: result?.nodes || nodes,
        assetsCreated,
        summary,
      },
    });
  } catch (error) {
    console.error('Error transforming markdown:', error);
    return errorResponse('Failed to transform markdown', 500, error);
  }
}
