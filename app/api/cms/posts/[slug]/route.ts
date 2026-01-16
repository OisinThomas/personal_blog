import { NextRequest } from 'next/server';
import { validateApiKey, jsonResponse, errorResponse } from '@/lib/api/auth';
import { getPostBySlug, getPostWithNodes } from '@/lib/posts/queries';
import { updatePostBySlug, deletePost } from '@/lib/posts/mutations';
import type { UpdatePostRequest } from '@/lib/api/types';

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * GET /api/cms/posts/[slug]
 * Get a single post by slug
 *
 * Query params:
 * - include_nodes: boolean - Include all blocks/nodes for this post
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const includeNodes = searchParams.get('include_nodes') === 'true';

    if (includeNodes) {
      const result = await getPostWithNodes(slug);
      if (!result) {
        return errorResponse('Post not found', 404);
      }
      return jsonResponse({
        data: {
          ...result.post,
          nodes: result.nodes,
        },
      });
    }

    const post = await getPostBySlug(slug);
    if (!post) {
      return errorResponse('Post not found', 404);
    }

    return jsonResponse({ data: post });
  } catch (error) {
    console.error('Error fetching post:', error);
    return errorResponse('Failed to fetch post', 500, error);
  }
}

/**
 * PATCH /api/cms/posts/[slug]
 * Update a post's metadata
 *
 * Body: Partial<CreatePostInput>
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  try {
    const { slug } = await params;
    const body: UpdatePostRequest = await request.json();

    // Check post exists first
    const existing = await getPostBySlug(slug);
    if (!existing) {
      return errorResponse('Post not found', 404);
    }

    const post = await updatePostBySlug(slug, body);

    return jsonResponse({ data: post });
  } catch (error) {
    console.error('Error updating post:', error);
    return errorResponse('Failed to update post', 500, error);
  }
}

/**
 * DELETE /api/cms/posts/[slug]
 * Delete a post
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  try {
    const { slug } = await params;

    // Get post to get its ID (we need ID for deletion)
    const post = await getPostBySlug(slug);
    if (!post) {
      return errorResponse('Post not found', 404);
    }

    await deletePost(post.id);

    return jsonResponse({ data: { message: 'Post deleted successfully' } });
  } catch (error) {
    console.error('Error deleting post:', error);
    return errorResponse('Failed to delete post', 500, error);
  }
}
