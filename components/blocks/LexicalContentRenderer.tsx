import Image from 'next/image';
import CodeBlock from './CodeBlock';
import VideoBlock from './VideoBlock';
import EmbedBlock from './EmbedBlock';
import BilingualBlockRenderer from './BilingualBlockRenderer';
import { markdownToHtmlSync } from '@/lib/utils';

// Types for Lexical serialized JSON
interface LexicalNode {
  type: string;
  version: number;
  children?: LexicalNode[];
  [key: string]: unknown;
}

interface TextNode extends LexicalNode {
  type: 'text';
  text: string;
  format: number;
  style?: string;
}

interface LinkNode extends LexicalNode {
  type: 'link';
  url: string;
  target?: string;
  rel?: string;
}

interface HeadingNode extends LexicalNode {
  type: 'heading';
  tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

interface ListNode extends LexicalNode {
  type: 'list';
  listType: 'bullet' | 'number' | 'check';
}

interface ImageNodeData extends LexicalNode {
  type: 'image';
  assetId: string;
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
}

interface CodeBlockNodeData extends LexicalNode {
  type: 'codeblock';
  code: string;
  language: string;
  filename: string;
}

interface VideoNodeData extends LexicalNode {
  type: 'video';
  provider: string;
  videoId: string;
  caption: string;
}

interface EmbedNodeData extends LexicalNode {
  type: 'embed';
  url: string;
  html: string;
  provider: string;
}

interface TableBlockNodeData extends LexicalNode {
  type: 'tableblock';
  headers: string[];
  rows: string[][];
  alignments: string[];
}

interface CalloutNodeData extends LexicalNode {
  type: 'callout';
  variant: string;
}

interface ToggleContainerNodeData extends LexicalNode {
  type: 'toggle-container';
  open: boolean;
}

interface BilingualNodeData extends LexicalNode {
  type: 'bilingual';
  languages: string[];
  content: Record<string, string>;
}

interface InteractiveNodeData extends LexicalNode {
  type: 'interactive';
  componentSlug: string;
  props: Record<string, unknown>;
}

interface FootnoteRefNodeData extends LexicalNode {
  type: 'footnote-ref';
  footnoteId: string;
  label: string;
}

interface LexicalContentRendererProps {
  editorState: Record<string, unknown>;
}

export default function LexicalContentRenderer({ editorState }: LexicalContentRendererProps) {
  const root = (editorState as { root?: LexicalNode }).root;
  if (!root?.children) return null;

  return (
    <div className="space-y-1">
      {root.children.map((node, index) => (
        <RenderNode key={index} node={node} />
      ))}
    </div>
  );
}

function RenderNode({ node }: { node: LexicalNode }) {
  switch (node.type) {
    case 'paragraph':
      return <RenderParagraph node={node} />;
    case 'heading':
      return <RenderHeading node={node as HeadingNode} />;
    case 'text':
      return <RenderText node={node as TextNode} />;
    case 'link':
      return <RenderLink node={node as LinkNode} />;
    case 'list':
      return <RenderList node={node as ListNode} />;
    case 'listitem':
      return <RenderListItem node={node} />;
    case 'quote':
      return <RenderQuote node={node} />;
    case 'horizontalrule':
      return <hr className="my-8 border-t border-gray-300 dark:border-gray-600" />;
    case 'image':
      return <RenderImage node={node as ImageNodeData} />;
    case 'codeblock':
      return <RenderCodeBlock node={node as CodeBlockNodeData} />;
    case 'video':
      return <RenderVideo node={node as VideoNodeData} />;
    case 'embed':
      return <RenderEmbed node={node as EmbedNodeData} />;
    case 'tableblock':
      return <RenderTable node={node as TableBlockNodeData} />;
    case 'callout':
      return <RenderCallout node={node as CalloutNodeData} />;
    case 'toggle-container':
      return <RenderToggle node={node as ToggleContainerNodeData} />;
    case 'toggle-title':
      return <RenderChildren node={node} />;
    case 'toggle-content':
      return <RenderChildren node={node} />;
    case 'bilingual':
      return <RenderBilingual node={node as BilingualNodeData} />;
    case 'interactive':
      return <RenderInteractive node={node as InteractiveNodeData} />;
    case 'footnote-ref':
      return <RenderFootnoteRef node={node as FootnoteRefNodeData} />;
    case 'linebreak':
      return <br />;
    default:
      return null;
  }
}

function RenderChildren({ node }: { node: LexicalNode }) {
  if (!node.children) return null;
  return (
    <>
      {node.children.map((child, i) => (
        <RenderNode key={i} node={child} />
      ))}
    </>
  );
}

function getAlignmentStyle(format: unknown): React.CSSProperties | undefined {
  const alignMap: Record<number, string> = {
    1: 'left',
    2: 'center',
    3: 'right',
    4: 'justify',
  };
  if (typeof format === 'number' && format in alignMap) {
    return { textAlign: alignMap[format] as React.CSSProperties['textAlign'] };
  }
  if (typeof format === 'string' && ['left', 'center', 'right', 'justify'].includes(format)) {
    return { textAlign: format as React.CSSProperties['textAlign'] };
  }
  return undefined;
}

function RenderParagraph({ node }: { node: LexicalNode }) {
  // Empty paragraphs become spacing
  if (!node.children || node.children.length === 0) {
    return <p className="mb-4">&nbsp;</p>;
  }
  return (
    <p className="mb-4" style={getAlignmentStyle(node.format)}>
      <RenderChildren node={node} />
    </p>
  );
}

function RenderHeading({ node }: { node: HeadingNode }) {
  const Tag = node.tag;
  const headingClasses: Record<string, string> = {
    h1: 'text-3xl font-bold mt-8 mb-4',
    h2: 'text-2xl font-bold mt-6 mb-3',
    h3: 'text-xl font-bold mt-5 mb-2',
    h4: 'text-lg font-bold mt-4 mb-2',
    h5: 'text-base font-bold mt-3 mb-1',
    h6: 'text-sm font-bold mt-3 mb-1',
  };
  return (
    <Tag className={headingClasses[node.tag]} style={getAlignmentStyle(node.format)}>
      <RenderChildren node={node} />
    </Tag>
  );
}

// Lexical format bitmask: 1=bold, 2=italic, 4=strikethrough, 8=underline, 16=code, 32=subscript, 64=superscript
function RenderText({ node }: { node: TextNode }) {
  let content: React.ReactNode = node.text;
  const format = node.format || 0;

  if (format & 16) {
    content = (
      <code className="bg-gray-100 dark:bg-gray-800 text-red-500 dark:text-red-400 px-1 py-0.5 rounded text-sm font-mono">
        {content}
      </code>
    );
  }
  if (format & 1) content = <strong>{content}</strong>;
  if (format & 2) content = <em>{content}</em>;
  if (format & 4) content = <s>{content}</s>;
  if (format & 8) content = <u>{content}</u>;

  return <>{content}</>;
}

function RenderLink({ node }: { node: LinkNode }) {
  return (
    <a
      href={node.url}
      target={node.target ?? undefined}
      rel={node.rel ?? 'noopener noreferrer'}
      className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300"
    >
      <RenderChildren node={node} />
    </a>
  );
}

function RenderList({ node }: { node: ListNode }) {
  if (node.listType === 'number') {
    return (
      <ol className="list-decimal pl-6 mb-4">
        <RenderChildren node={node} />
      </ol>
    );
  }
  return (
    <ul className="list-disc pl-6 mb-4">
      <RenderChildren node={node} />
    </ul>
  );
}

function RenderListItem({ node }: { node: LexicalNode }) {
  // Check if list item contains a nested list
  const hasNestedList = node.children?.some(c => c.type === 'list');
  return (
    <li className="mb-1">
      <RenderChildren node={node} />
    </li>
  );
}

function RenderQuote({ node }: { node: LexicalNode }) {
  return (
    <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-4 text-gray-600 dark:text-gray-400">
      <RenderChildren node={node} />
    </blockquote>
  );
}

function RenderImage({ node }: { node: ImageNodeData }) {
  if (!node.src) return null;

  return (
    <figure className="my-8">
      <Image
        src={node.src}
        alt={node.alt || ''}
        width={node.width || 800}
        height={node.height || 600}
        className="w-full h-auto rounded-lg"
      />
      {node.caption && (
        <figcaption className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
          {node.caption}
        </figcaption>
      )}
    </figure>
  );
}

function RenderCodeBlock({ node }: { node: CodeBlockNodeData }) {
  return (
    <CodeBlock
      content={node.code}
      metadata={{ language: node.language, filename: node.filename }}
    />
  );
}

function RenderVideo({ node }: { node: VideoNodeData }) {
  return (
    <VideoBlock
      content={null}
      metadata={{
        provider: node.provider,
        videoId: node.videoId,
        caption: node.caption,
      }}
    />
  );
}

function RenderEmbed({ node }: { node: EmbedNodeData }) {
  return (
    <EmbedBlock
      content={null}
      metadata={{ url: node.url, html: node.html, provider: node.provider }}
    />
  );
}

function RenderTable({ node }: { node: TableBlockNodeData }) {
  return (
    <div className="my-8 overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            {node.headers.map((header, i) => (
              <th
                key={i}
                className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-semibold"
                style={{ textAlign: (node.alignments?.[i] as 'left' | 'center' | 'right') ?? 'left' }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {node.rows.map((row, rowIdx) => (
            <tr key={rowIdx}>
              {row.map((cell, colIdx) => (
                <td
                  key={colIdx}
                  className="border border-gray-300 dark:border-gray-600 px-4 py-2"
                  style={{ textAlign: (node.alignments?.[colIdx] as 'left' | 'center' | 'right') ?? 'left' }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const CALLOUT_STYLES: Record<string, { bg: string; border: string; icon: string }> = {
  info: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-300 dark:border-blue-700', icon: 'ℹ️' },
  warning: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-300 dark:border-yellow-700', icon: '⚠️' },
  success: { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-300 dark:border-green-700', icon: '✅' },
  error: { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-300 dark:border-red-700', icon: '❌' },
  note: { bg: 'bg-gray-50 dark:bg-gray-800/50', border: 'border-gray-300 dark:border-gray-600', icon: '📝' },
};

function RenderCallout({ node }: { node: CalloutNodeData }) {
  const style = CALLOUT_STYLES[node.variant] ?? CALLOUT_STYLES.note;
  return (
    <div className={`my-6 p-4 rounded-lg border-l-4 ${style.bg} ${style.border}`}>
      <div className="flex gap-3">
        <span className="flex-shrink-0">{style.icon}</span>
        <div className="flex-1">
          <RenderChildren node={node} />
        </div>
      </div>
    </div>
  );
}

function RenderToggle({ node }: { node: ToggleContainerNodeData }) {
  const titleNode = node.children?.find(c => c.type === 'toggle-title');
  const contentNode = node.children?.find(c => c.type === 'toggle-content');

  return (
    <details className="my-4 border border-gray-200 dark:border-gray-700 rounded-lg" open={node.open}>
      <summary className="px-4 py-3 cursor-pointer font-medium hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-t-lg">
        {titleNode && <RenderChildren node={titleNode} />}
      </summary>
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
        {contentNode && <RenderChildren node={contentNode} />}
      </div>
    </details>
  );
}

function RenderBilingual({ node }: { node: BilingualNodeData }) {
  // Pre-render markdown to HTML on the server
  const htmlContent: Record<string, string> = {};
  for (const lang of node.languages) {
    htmlContent[lang] = markdownToHtmlSync(node.content[lang] ?? '');
  }
  return <BilingualBlockRenderer languages={node.languages} content={htmlContent} isHtml />;
}

function RenderFootnoteRef({ node }: { node: FootnoteRefNodeData }) {
  return (
    <sup className="text-[0.75em] leading-none">
      <a
        href={`#fn-${node.footnoteId}`}
        id={`fnref-${node.footnoteId}`}
        className="text-blue-600 dark:text-blue-400 hover:underline no-underline font-medium"
      >
        [{node.label}]
      </a>
    </sup>
  );
}

function RenderInteractive({ node }: { node: InteractiveNodeData }) {
  return (
    <div className="my-6 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center text-gray-500">
      Interactive component: {node.componentSlug}
    </div>
  );
}

// Helper function to detect bilingual nodes in Lexical JSON
export function detectBilingualNodes(editorState: Record<string, unknown>): boolean {
  const root = (editorState as { root?: LexicalNode }).root;
  if (!root?.children) return false;

  function walk(nodes: LexicalNode[]): boolean {
    for (const node of nodes) {
      if (node.type === 'bilingual') return true;
      if (node.children && walk(node.children)) return true;
    }
    return false;
  }

  return walk(root.children);
}
