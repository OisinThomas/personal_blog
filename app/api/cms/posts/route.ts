import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, jsonResponse, errorResponse } from '@/lib/api/auth';
import { getAllPosts } from '@/lib/posts/queries';
import { validateListPostsQuery, validateCreatePostInput } from '@/lib/api/validation';
import { createServiceClient } from '@/lib/supabase/server';

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

    const validation = validateListPostsQuery(searchParams);
    if (!validation.valid) return errorResponse(validation.error, 400);

    const { status, major_tag, limit } = validation.data;

    const posts = await getAllPosts({
      status,
      majorTag: major_tag,
      limit,
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
    const body = await request.json();

    const validation = validateCreatePostInput(body);
    if (!validation.valid) return errorResponse(validation.error, 400);

    const supabase = createServiceClient();
    const { data: post, error } = await supabase
      .from('posts')
      .insert(validation.data)
      .select()
      .single();

    if (error) throw error;

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
