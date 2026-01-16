import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, jsonResponse, errorResponse } from '@/lib/api/auth';
import { getAllPosts } from '@/lib/posts/queries';
import { createPost } from '@/lib/posts/mutations';
import type { ListPostsQuery, CreatePostRequest, MajorTag, PostStatus } from '@/lib/api/types';

/**
 * GET /api/cms/posts
 * List all posts with optional filtering
 *
 * Query params:
 * - status: 'draft' | 'published' | 'archived'
 * - major_tag: 'Thoughts' | 'Tinkering' | 'Translations'
 * - limit: number
 */
export async function GET(request: NextRequest) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);

    const options: ListPostsQuery = {};

    const status = searchParams.get('status') as PostStatus | null;
    if (status) {
      options.status = status;
    }

    const majorTag = searchParams.get('major_tag') as MajorTag | null;
    if (majorTag) {
      options.major_tag = majorTag;
    }

    const limit = searchParams.get('limit');
    if (limit) {
      options.limit = parseInt(limit, 10);
    }

    const posts = await getAllPosts({
      status: options.status,
      majorTag: options.major_tag,
      limit: options.limit,
    });

    return jsonResponse({ data: posts });
  } catch (error) {
    console.error('Error listing posts:', error);
    return errorResponse('Failed to list posts', 500, error);
  }
}

/**
 * POST /api/cms/posts
 * Create a new post
 *
 * Body: CreatePostInput
 */
export async function POST(request: NextRequest) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  try {
    const body: CreatePostRequest = await request.json();

    // Validate required fields
    if (!body.slug) {
      return errorResponse('slug is required', 400);
    }
    if (!body.title) {
      return errorResponse('title is required', 400);
    }
    if (!body.major_tag) {
      return errorResponse('major_tag is required', 400);
    }

    const post = await createPost(body);

    return jsonResponse({ data: post }, 201);
  } catch (error: unknown) {
    console.error('Error creating post:', error);

    // Check for unique constraint violation
    if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
      return errorResponse('A post with this slug already exists', 409);
    }

    return errorResponse('Failed to create post', 500, error);
  }
}
