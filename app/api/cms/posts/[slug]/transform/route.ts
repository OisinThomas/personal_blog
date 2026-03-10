import { NextRequest } from 'next/server';
import { validateApiKey, jsonResponse, errorResponse } from '@/lib/api/auth';
import { getPostBySlug, getPostWithNodes } from '@/lib/posts/queries';
import { replacePostNodes } from '@/lib/posts/mutations';
import { transformMarkdown, TransformedBlock } from '@/lib/api/markdown-transform';
import { uploadImageFromUrl } from '@/lib/api/image-upload';
import { validateString } from '@/lib/api/validation';
import type { CreateNodeInput } from '@/lib/api/types';

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
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

    const mdValidation = validateString(body.markdown, 'markdown', { minLength: 1 });
    if (!mdValidation.valid) return errorResponse(mdValidation.error, 400);
    const markdown = mdValidation.data;

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
