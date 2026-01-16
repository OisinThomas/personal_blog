import { NextRequest } from 'next/server';
import { validateApiKey, jsonResponse, errorResponse } from '@/lib/api/auth';
import { getPostBySlug, getPostWithNodes } from '@/lib/posts/queries';
import { createNode, replacePostNodes } from '@/lib/posts/mutations';
import type { CreateNodeRequest, BulkReplaceNodesRequest } from '@/lib/api/types';

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * GET /api/cms/posts/[slug]/nodes
 * List all blocks/nodes for a post
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  try {
    const { slug } = await params;

    const result = await getPostWithNodes(slug);
    if (!result) {
      return errorResponse('Post not found', 404);
    }

    return jsonResponse({ data: result.nodes });
  } catch (error) {
    console.error('Error fetching nodes:', error);
    return errorResponse('Failed to fetch nodes', 500, error);
  }
}

/**
 * POST /api/cms/posts/[slug]/nodes
 * Add a single block/node to a post
 *
 * Body: CreateNodeRequest
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  try {
    const { slug } = await params;
    const body: CreateNodeRequest = await request.json();

    // Get post to get its ID
    const post = await getPostBySlug(slug);
    if (!post) {
      return errorResponse('Post not found', 404);
    }

    // Validate required fields
    if (!body.type) {
      return errorResponse('type is required', 400);
    }

    // Get existing nodes to determine position
    const existingResult = await getPostWithNodes(slug);
    const existingNodes = existingResult?.nodes || [];
    const position = body.position ?? existingNodes.length;

    const node = await createNode({
      post_id: post.id,
      type: body.type,
      position,
      content: body.content,
      metadata: body.metadata || {},
      asset_id: body.asset_id,
    });

    return jsonResponse({ data: node }, 201);
  } catch (error) {
    console.error('Error creating node:', error);
    return errorResponse('Failed to create node', 500, error);
  }
}

/**
 * PUT /api/cms/posts/[slug]/nodes
 * Replace all blocks/nodes for a post (bulk update)
 *
 * Body: { nodes: CreateNodeRequest[] }
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  try {
    const { slug } = await params;
    const body: BulkReplaceNodesRequest = await request.json();

    // Get post to get its ID
    const post = await getPostBySlug(slug);
    if (!post) {
      return errorResponse('Post not found', 404);
    }

    // Validate nodes array
    if (!Array.isArray(body.nodes)) {
      return errorResponse('nodes must be an array', 400);
    }

    // Validate each node has required type
    for (let i = 0; i < body.nodes.length; i++) {
      if (!body.nodes[i].type) {
        return errorResponse(`nodes[${i}].type is required`, 400);
      }
    }

    // Transform request nodes to create input format
    const nodesToCreate = body.nodes.map((node, index) => ({
      type: node.type,
      position: node.position ?? index,
      content: node.content,
      metadata: node.metadata || {},
      asset_id: node.asset_id,
    }));

    const nodes = await replacePostNodes(post.id, nodesToCreate);

    return jsonResponse({ data: nodes });
  } catch (error) {
    console.error('Error replacing nodes:', error);
    return errorResponse('Failed to replace nodes', 500, error);
  }
}
