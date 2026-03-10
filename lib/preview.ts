import { createHmac } from 'crypto';

function getPreviewSecret(): string {
  const secret = process.env.PREVIEW_SECRET;
  if (!secret) {
    throw new Error('PREVIEW_SECRET environment variable is not set');
  }
  return secret;
}

/**
 * Generate a deterministic preview token for a post.
 * Safe to share — only valid for this specific post.
 */
export function generatePreviewToken(postId: string): string {
  return createHmac('sha256', getPreviewSecret())
    .update(`preview:${postId}`)
    .digest('hex')
    .slice(0, 16);
}

/**
 * Verify a preview token matches the expected value for a post.
 */
export function verifyPreviewToken(postId: string, token: string): boolean {
  const expected = generatePreviewToken(postId);
  return token === expected;
}
