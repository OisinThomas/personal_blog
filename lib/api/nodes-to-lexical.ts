import { markdownToLexicalJson } from '@/lib/lexical/markdown-to-lexical';
import type {
  NodeWithAsset,
  ImageNodeMetadata,
  VideoNodeMetadata,
  EmbedNodeMetadata,
  CodeNodeMetadata,
  InteractiveNodeMetadata,
} from '@/lib/supabase/types';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

/**
 * Converts an array of legacy NodeWithAsset objects into a Lexical editor state JSON.
 * Nodes must be pre-sorted by position.
 */
export function convertNodesToLexicalState(
  nodes: NodeWithAsset[]
): Record<string, unknown> {
  const children: Record<string, unknown>[] = [];

  for (const node of nodes) {
    switch (node.type) {
      case 'markdown': {
        const lexicalJson = markdownToLexicalJson(node.content || '');
        const root = lexicalJson.root as { children: Record<string, unknown>[] };
        children.push(...root.children);
        break;
      }

      case 'image': {
        const meta = node.metadata as ImageNodeMetadata;
        const asset = node.asset;
        let src = '';
        if (asset) {
          src = `${SUPABASE_URL}/storage/v1/object/public/${asset.bucket}/${asset.storage_path}`;
        }
        children.push({
          type: 'image',
          version: 1,
          assetId: node.asset_id || '',
          src,
          alt: meta.alt || asset?.alt_text || '',
          caption: meta.caption || asset?.caption || '',
          width: meta.width || asset?.width || 0,
          height: meta.height || asset?.height || 0,
        });
        break;
      }

      case 'code': {
        const meta = node.metadata as CodeNodeMetadata;
        children.push({
          type: 'codeblock',
          version: 1,
          code: node.content || '',
          language: meta.language || '',
          filename: meta.filename || '',
        });
        break;
      }

      case 'video': {
        const meta = node.metadata as VideoNodeMetadata;
        children.push({
          type: 'video',
          version: 1,
          provider: meta.provider || '',
          videoId: meta.videoId || '',
          caption: meta.caption || '',
        });
        break;
      }

      case 'embed': {
        const meta = node.metadata as EmbedNodeMetadata;
        children.push({
          type: 'embed',
          version: 1,
          url: meta.url || '',
          html: meta.html || '',
          provider: meta.provider || '',
        });
        break;
      }

      case 'divider': {
        children.push({
          type: 'horizontalrule',
          version: 1,
        });
        break;
      }

      case 'interactive': {
        const meta = node.metadata as InteractiveNodeMetadata;
        children.push({
          type: 'interactive',
          version: 1,
          componentSlug: meta.componentSlug,
          props: meta.props || {},
        });
        break;
      }
    }
  }

  // Ensure at least one paragraph (matches markdownToLexicalJson behavior)
  if (children.length === 0) {
    children.push({
      type: 'paragraph',
      version: 1,
      children: [{ type: 'text', version: 1, text: '', format: 0, mode: 'normal', style: '', detail: 0 }],
      direction: 'ltr',
      format: '',
      indent: 0,
      textFormat: 0,
      textStyle: '',
    });
  }

  return {
    root: {
      type: 'root',
      version: 1,
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
    },
  };
}
