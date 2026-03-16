import { NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { withApiAuth, errorResponse, jsonResponse } from '@/lib/api/auth';
import { markdownToLexicalJson } from '@/lib/lexical/markdown-to-lexical';
import { processRemoteImages } from '@/lib/api/image-upload';
import { validateEditorState } from '@/lib/api/validation';

interface ContentBody {
  content_markdown?: string;
  editor_state?: Record<string, unknown>;
  auto_upload_images?: boolean;
}

function countWords(editorState: Record<string, unknown>): number {
  const text = extractText(editorState);
  return text.split(/\s+/).filter(Boolean).length;
}

function extractText(obj: unknown): string {
  if (!obj || typeof obj !== 'object') return '';
  const record = obj as Record<string, unknown>;
  const parts: string[] = [];
  if (typeof record.text === 'string') {
    parts.push(record.text);
  }
  if (typeof record.code === 'string') {
    parts.push(record.code);
  }
  if (typeof record.content === 'string') {
    parts.push(record.content);
  }
  if (Array.isArray(record.children)) {
    for (const child of record.children) {
      parts.push(extractText(child));
    }
  }
  return parts.join(' ');
}

export const PATCH = withApiAuth(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
  ) => {
    const { slug } = await params;

    let body: ContentBody;
    try {
      body = await request.json();
    } catch {
      return errorResponse('Invalid JSON body', 400);
    }

    const { content_markdown, editor_state: rawEditorState, auto_upload_images } = body;

    // Validate: must provide one but not both
    if (content_markdown && rawEditorState) {
      return errorResponse('Provide content_markdown OR editor_state, not both', 400);
    }
    if (!content_markdown && !rawEditorState) {
      return errorResponse('content_markdown or editor_state is required', 400);
    }

    const supabase = createServiceClient();

    // Find the post
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('id, title, status')
      .eq('slug', slug)
      .single();

    if (fetchError || !post) {
      return errorResponse('Post not found', 404);
    }

    let editorState: Record<string, unknown>;

    if (content_markdown) {
      // Convert markdown to Lexical JSON
      editorState = markdownToLexicalJson(content_markdown);
      // Default to auto-uploading images in markdown mode
      const shouldUpload = auto_upload_images !== false;
      if (shouldUpload) {
        editorState = await processRemoteImages(editorState);
      }
    } else {
      // Validate the editor state structure
      const esValidation = validateEditorState(rawEditorState);
      if (!esValidation.valid) return errorResponse(esValidation.error, 400);
      editorState = esValidation.data;
      if (auto_upload_images === true) {
        editorState = await processRemoteImages(editorState);
      }
    }

    // Save to database
    const { error: updateError } = await supabase
      .from('posts')
      .update({ editor_state: editorState })
      .eq('id', post.id);

    if (updateError) {
      return errorResponse('Failed to save content', 500, updateError.message);
    }

    const wordCount = countWords(editorState);

    return jsonResponse({
      message: 'Content saved successfully',
      slug,
      post: { id: post.id, title: post.title, status: post.status },
      word_count: wordCount,
      editor_state: editorState,
    });
  }
);
