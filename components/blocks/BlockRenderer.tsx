import type { NodeWithAsset } from '@/lib/supabase/types';
import MarkdownBlock from './MarkdownBlock';
import ImageBlock from './ImageBlock';
import VideoBlock from './VideoBlock';
import EmbedBlock from './EmbedBlock';
import CodeBlock from './CodeBlock';
import DividerBlock from './DividerBlock';
import InteractiveBlock from './InteractiveBlock';

interface BlockRendererProps {
  nodes: NodeWithAsset[];
}

export default function BlockRenderer({ nodes }: BlockRendererProps) {
  return (
    <div className="space-y-6">
      {nodes.map((node) => (
        <Block key={node.id} node={node} />
      ))}
    </div>
  );
}

interface BlockProps {
  node: NodeWithAsset;
}

function Block({ node }: BlockProps) {
  switch (node.type) {
    case 'markdown':
      return <MarkdownBlock content={node.content || ''} />;

    case 'image':
      return (
        <ImageBlock
          asset={node.asset}
          metadata={node.metadata as { alt?: string; caption?: string }}
        />
      );

    case 'video':
      return (
        <VideoBlock
          content={node.content}
          metadata={
            node.metadata as {
              provider?: string;
              videoId?: string;
              autoplay?: boolean;
              loop?: boolean;
            }
          }
        />
      );

    case 'embed':
      return (
        <EmbedBlock
          content={node.content}
          metadata={
            node.metadata as {
              provider?: string;
              url?: string;
              html?: string;
            }
          }
        />
      );

    case 'code':
      return (
        <CodeBlock
          content={node.content || ''}
          metadata={
            node.metadata as {
              language?: string;
              filename?: string;
              showLineNumbers?: boolean;
            }
          }
        />
      );

    case 'divider':
      return <DividerBlock />;

    case 'interactive':
      return (
        <InteractiveBlock
          metadata={
            node.metadata as {
              componentSlug: string;
              props?: Record<string, unknown>;
            }
          }
        />
      );

    default:
      console.warn(`Unknown node type: ${node.type}`);
      return null;
  }
}
