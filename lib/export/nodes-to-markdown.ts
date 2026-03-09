import type {
  PostWithAsset,
  NodeWithAsset,
  VideoNodeMetadata,
  CodeNodeMetadata,
  EmbedNodeMetadata,
  ImageNodeMetadata,
  InteractiveNodeMetadata,
} from '@/lib/supabase/types';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

function getAssetUrl(bucket: string, storagePath: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${storagePath}`;
}

function nodeToMarkdown(node: NodeWithAsset): string {
  switch (node.type) {
    case 'markdown':
      return node.content ?? '';

    case 'image': {
      const meta = node.metadata as ImageNodeMetadata;
      const alt = meta.alt ?? node.asset?.alt_text ?? '';
      const url = node.asset
        ? getAssetUrl(node.asset.bucket, node.asset.storage_path)
        : node.content ?? '';
      const caption = meta.caption ?? node.asset?.caption;
      let result = `![${alt}](${url})`;
      if (caption) {
        result += `\n*${caption}*`;
      }
      return result;
    }

    case 'video': {
      const meta = node.metadata as VideoNodeMetadata;
      let url = node.content ?? '';
      if (meta.provider === 'youtube' && meta.videoId) {
        url = `https://www.youtube.com/watch?v=${meta.videoId}`;
      } else if (meta.provider === 'vimeo' && meta.videoId) {
        url = `https://vimeo.com/${meta.videoId}`;
      }
      const caption = meta.caption;
      let result = url;
      if (caption) {
        result += `\n*${caption}*`;
      }
      return result;
    }

    case 'code': {
      const meta = node.metadata as CodeNodeMetadata;
      const lang = meta.language ?? '';
      return `\`\`\`${lang}\n${node.content ?? ''}\n\`\`\``;
    }

    case 'embed': {
      const meta = node.metadata as EmbedNodeMetadata;
      if (meta.url) {
        return `<!-- embed: ${meta.url} -->`;
      }
      if (meta.html) {
        return meta.html;
      }
      return node.content ?? '';
    }

    case 'divider':
      return '---';

    case 'interactive': {
      const meta = node.metadata as InteractiveNodeMetadata;
      return `<!-- interactive: ${meta.componentSlug} -->`;
    }

    default:
      return node.content ?? '';
  }
}

function buildFrontmatter(post: PostWithAsset): string {
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

export function postToMarkdown(post: PostWithAsset, nodes: NodeWithAsset[]): string {
  const frontmatter = buildFrontmatter(post);
  const body = nodes.map(nodeToMarkdown).join('\n\n');
  return `${frontmatter}\n\n${body}\n`;
}
