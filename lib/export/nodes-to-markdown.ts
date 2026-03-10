import type { PostWithAsset } from '@/lib/supabase/types';

export function buildFrontmatter(post: PostWithAsset): string {
  const fields: Record<string, unknown> = {
    title: post.title,
    slug: post.slug,
    author: post.author,
    major_tag: post.major_tag,
    language: post.language,
    status: post.status,
    tags: post.tags,
  };

  if (post.description) fields.description = post.description;
  if (post.sub_tag) fields.sub_tag = post.sub_tag;
  if (post.published_at) fields.published_at = post.published_at;
  if (post.created_at) fields.created_at = post.created_at;
  if (post.source) fields.source = post.source;
  if (post.source_url) fields.source_url = post.source_url;

  const lines = ['---'];
  for (const [key, value] of Object.entries(fields)) {
    if (Array.isArray(value)) {
      lines.push(`${key}: [${value.map((v) => `"${v}"`).join(', ')}]`);
    } else if (typeof value === 'string' && (value.includes(':') || value.includes('"') || value.includes("'"))) {
      lines.push(`${key}: "${value.replace(/"/g, '\\"')}"`);
    } else {
      lines.push(`${key}: ${value}`);
    }
  }
  lines.push('---');
  return lines.join('\n');
}
