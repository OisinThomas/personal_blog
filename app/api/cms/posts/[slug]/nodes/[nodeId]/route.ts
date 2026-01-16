import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateApiKey, jsonResponse, errorResponse } from '@/lib/api/auth';
import { getPostBySlug } from '@/lib/posts/queries';
import { updateNode, deleteNode } from '@/lib/posts/mutations';
import type { UpdateNodeRequest, NodeWithAsset } from '@/lib/api/types';

interface RouteParams {
  params: Promise<{
    slug: string;
    nodeId: string;
  }>;
}

/**
 * Get a single node by ID
 */
async function getNodeById(nodeId: string): Promise<NodeWithAsset | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('nodes')
    .select(`
      *,
      asset:assets(*)
    `)
    .eq('id', nodeId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data as NodeWithAsset;
}

/**
 * GET /api/cms/posts/[slug]/nodes/[nodeId]
 * Get a single block/node by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  try {
    const { slug, nodeId } = await params;

    // Verify post exists
    const post = await getPostBySlug(slug);
    if (!post) {
      return errorResponse('Post not found', 404);
    }

    const node = await getNodeById(nodeId);
    if (!node) {
      return errorResponse('Node not found', 404);
    }

    // Verify node belongs to this post
    if (node.post_id !== post.id) {
      return errorResponse('Node does not belong to this post', 404);
    }

    return jsonResponse({ data: node });
  } catch (error) {
    console.error('Error fetching node:', error);
    return errorResponse('Failed to fetch node', 500, error);
  }
}

/**
 * PATCH /api/cms/posts/[slug]/nodes/[nodeId]
 * Update a single block/node
 *
 * Body: UpdateNodeRequest
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  try {
    const { slug, nodeId } = await params;
    const body: UpdateNodeRequest = await request.json();

    // Verify post exists
    const post = await getPostBySlug(slug);
    if (!post) {
      return errorResponse('Post not found', 404);
    }

    // Verify node exists and belongs to post
    const existingNode = await getNodeById(nodeId);
    if (!existingNode) {
      return errorResponse('Node not found', 404);
    }
    if (existingNode.post_id !== post.id) {
      return errorResponse('Node does not belong to this post', 404);
    }

    const node = await updateNode({
      id: nodeId,
      ...body,
    });

    return jsonResponse({ data: node });
  } catch (error) {
    console.error('Error updating node:', error);
    return errorResponse('Failed to update node', 500, error);
  }
}

/**
 * DELETE /api/cms/posts/[slug]/nodes/[nodeId]
 * Delete a single block/node
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  try {
    const { slug, nodeId } = await params;

    // Verify post exists
    const post = await getPostBySlug(slug);
    if (!post) {
      return errorResponse('Post not found', 404);
    }

    // Verify node exists and belongs to post
    const existingNode = await getNodeById(nodeId);
    if (!existingNode) {
      return errorResponse('Node not found', 404);
    }
    if (existingNode.post_id !== post.id) {
      return errorResponse('Node does not belong to this post', 404);
    }

    await deleteNode(nodeId);

    return jsonResponse({ data: { message: 'Node deleted successfully' } });
  } catch (error) {
    console.error('Error deleting node:', error);
    return errorResponse('Failed to delete node', 500, error);
  }
}
