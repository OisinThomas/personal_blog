import type { NodeType, NodeMetadata, CodeNodeMetadata, VideoNodeMetadata, ImageNodeMetadata } from '@/lib/supabase/types';

export interface TransformedBlock {
  type: NodeType;
  content?: string;
  metadata?: NodeMetadata;
  sourceUrl?: string; // For remote images that need to be uploaded
  altText?: string;   // For images - extracted from markdown
}

export interface TransformSummary {
  totalBlocks: number;
  markdownBlocks: number;
  codeBlocks: number;
  imageBlocks: number;
  videoBlocks: number;
  imagesRequiringUpload: number;
}

export interface TransformResult {
  blocks: TransformedBlock[];
  summary: TransformSummary;
}

// Regex patterns
const CODE_BLOCK_REGEX = /```(\w+)?\n([\s\S]*?)```/g;
const IMAGE_REGEX = /!\[([^\]]*)\]\(([^)]+)\)/g;
const YOUTUBE_REGEX = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[^\s]*)?/g;
const VIMEO_REGEX = /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/g;

/**
 * Detect video provider and extract video ID from URL
 */
function parseVideoUrl(url: string): { provider: 'youtube' | 'vimeo'; videoId: string } | null {
  // YouTube
  const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (youtubeMatch) {
    return { provider: 'youtube', videoId: youtubeMatch[1] };
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return { provider: 'vimeo', videoId: vimeoMatch[1] };
  }

  return null;
}

/**
 * Check if URL is a remote URL that needs downloading
 */
function isRemoteUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}

/**
 * Token types for markdown parsing
 */
type TokenType = 'code' | 'image' | 'video' | 'text';

interface Token {
  type: TokenType;
  content: string;
  start: number;
  end: number;
  metadata?: Record<string, unknown>;
}

/**
 * Tokenize markdown content, extracting special blocks
 */
function tokenize(markdown: string): Token[] {
  const tokens: Token[] = [];
  const markers: { start: number; end: number; token: Token }[] = [];

  // Find all code blocks
  let match: RegExpExecArray | null;
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;

  while ((match = codeBlockRegex.exec(markdown)) !== null) {
    markers.push({
      start: match.index,
      end: match.index + match[0].length,
      token: {
        type: 'code',
        content: match[2].trim(),
        start: match.index,
        end: match.index + match[0].length,
        metadata: { language: match[1] || 'text' },
      },
    });
  }

  // Find all images
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  while ((match = imageRegex.exec(markdown)) !== null) {
    // Skip if inside a code block
    const isInsideCodeBlock = markers.some(
      (m) => m.token.type === 'code' && match!.index >= m.start && match!.index < m.end
    );
    if (isInsideCodeBlock) continue;

    markers.push({
      start: match.index,
      end: match.index + match[0].length,
      token: {
        type: 'image',
        content: match[2], // URL
        start: match.index,
        end: match.index + match[0].length,
        metadata: { alt: match[1] },
      },
    });
  }

  // Find standalone video URLs (YouTube, Vimeo)
  // Look for URLs that are on their own line
  const lines = markdown.split('\n');
  let lineStart = 0;
  for (const line of lines) {
    const trimmedLine = line.trim();

    // Check if line is just a video URL
    const videoInfo = parseVideoUrl(trimmedLine);
    if (videoInfo && trimmedLine.match(/^https?:\/\//)) {
      // Make sure it's not inside a code block or part of other syntax
      const isInsideMarker = markers.some(
        (m) => lineStart >= m.start && lineStart < m.end
      );

      if (!isInsideMarker) {
        markers.push({
          start: lineStart,
          end: lineStart + line.length,
          token: {
            type: 'video',
            content: videoInfo.videoId,
            start: lineStart,
            end: lineStart + line.length,
            metadata: { provider: videoInfo.provider },
          },
        });
      }
    }
    lineStart += line.length + 1; // +1 for newline
  }

  // Sort markers by position
  markers.sort((a, b) => a.start - b.start);

  // Build tokens array, filling in text between special blocks
  let currentPos = 0;
  for (const marker of markers) {
    // Add text before this marker
    if (marker.start > currentPos) {
      const text = markdown.slice(currentPos, marker.start).trim();
      if (text) {
        tokens.push({
          type: 'text',
          content: text,
          start: currentPos,
          end: marker.start,
        });
      }
    }
    tokens.push(marker.token);
    currentPos = marker.end;
  }

  // Add remaining text
  if (currentPos < markdown.length) {
    const text = markdown.slice(currentPos).trim();
    if (text) {
      tokens.push({
        type: 'text',
        content: text,
        start: currentPos,
        end: markdown.length,
      });
    }
  }

  return tokens;
}

/**
 * Convert tokens to blocks
 */
function tokensToBlocks(tokens: Token[]): TransformedBlock[] {
  const blocks: TransformedBlock[] = [];

  for (const token of tokens) {
    switch (token.type) {
      case 'code': {
        const metadata: CodeNodeMetadata = {
          language: (token.metadata?.language as string) || 'text',
          showLineNumbers: true,
        };
        blocks.push({
          type: 'code',
          content: token.content,
          metadata,
        });
        break;
      }

      case 'image': {
        const imageUrl = token.content;
        const altText = (token.metadata?.alt as string) || '';
        const metadata: ImageNodeMetadata = {
          alt: altText,
        };

        if (isRemoteUrl(imageUrl)) {
          // Remote image - mark for upload
          blocks.push({
            type: 'image',
            sourceUrl: imageUrl,
            altText,
            metadata,
          });
        } else {
          // Local/relative path - store as content for now
          blocks.push({
            type: 'image',
            content: imageUrl,
            altText,
            metadata,
          });
        }
        break;
      }

      case 'video': {
        const metadata: VideoNodeMetadata = {
          provider: token.metadata?.provider as 'youtube' | 'vimeo',
          videoId: token.content,
        };
        blocks.push({
          type: 'video',
          content: token.content,
          metadata,
        });
        break;
      }

      case 'text': {
        // Split by dividers (---)
        const parts = token.content.split(/\n---+\n/);
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i].trim();
          if (part) {
            blocks.push({
              type: 'markdown',
              content: part,
            });
          }
          // Add divider between parts (but not after the last one)
          if (i < parts.length - 1) {
            blocks.push({
              type: 'divider',
            });
          }
        }
        break;
      }
    }
  }

  return blocks;
}

/**
 * Transform markdown content into structured blocks
 */
export function transformMarkdown(markdown: string): TransformResult {
  const tokens = tokenize(markdown);
  const blocks = tokensToBlocks(tokens);

  // Calculate summary
  const summary: TransformSummary = {
    totalBlocks: blocks.length,
    markdownBlocks: blocks.filter((b) => b.type === 'markdown').length,
    codeBlocks: blocks.filter((b) => b.type === 'code').length,
    imageBlocks: blocks.filter((b) => b.type === 'image').length,
    videoBlocks: blocks.filter((b) => b.type === 'video').length,
    imagesRequiringUpload: blocks.filter(
      (b) => b.type === 'image' && b.sourceUrl
    ).length,
  };

  return { blocks, summary };
}

/**
 * Download an image from a remote URL
 */
export async function downloadImage(url: string): Promise<{
  buffer: ArrayBuffer;
  contentType: string;
  filename: string;
}> {
  const response = await fetch(url, {
    headers: {
      // Some CDNs require a User-Agent
      'User-Agent': 'Mozilla/5.0 (compatible; BlogCMS/1.0)',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type') || 'image/jpeg';
  const buffer = await response.arrayBuffer();

  // Extract filename from URL or generate one
  let filename = url.split('/').pop()?.split('?')[0] || 'image';
  if (!filename.includes('.')) {
    // Add extension based on content type
    const ext = contentType.split('/')[1]?.split(';')[0] || 'jpg';
    filename = `${filename}.${ext}`;
  }

  return { buffer, contentType, filename };
}
