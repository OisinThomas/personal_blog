import type { Footnote } from '@/lib/supabase/types';

// Lexical node types (mirrors LexicalContentRenderer.tsx interfaces)
interface LexicalNode {
  type: string;
  version?: number;
  children?: LexicalNode[];
  format?: number | string;
  [key: string]: unknown;
}

interface TextNode extends LexicalNode {
  type: 'text';
  text: string;
  format: number;
}

interface LinkNode extends LexicalNode {
  type: 'link';
  url: string;
}

interface HeadingNode extends LexicalNode {
  type: 'heading';
  tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

interface ListNode extends LexicalNode {
  type: 'list';
  listType: 'bullet' | 'number' | 'check';
}

interface ImageNode extends LexicalNode {
  type: 'image';
  src: string;
  alt: string;
  caption: string;
  assetId?: string;
}

interface CodeBlockNode extends LexicalNode {
  type: 'codeblock';
  code: string;
  language: string;
  filename: string;
}

interface VideoNode extends LexicalNode {
  type: 'video';
  provider: string;
  videoId: string;
  caption: string;
}

interface EmbedNode extends LexicalNode {
  type: 'embed';
  url: string;
}

interface TableBlockNode extends LexicalNode {
  type: 'tableblock';
  headers: string[];
  rows: string[][];
  alignments: string[];
}

interface CalloutNode extends LexicalNode {
  type: 'callout';
  variant: string;
}

interface BilingualNode extends LexicalNode {
  type: 'bilingual';
  languages: string[];
  content: Record<string, string>;
}

interface InteractiveNode extends LexicalNode {
  type: 'interactive';
  componentSlug: string;
}

interface FootnoteRefNode extends LexicalNode {
  type: 'footnote-ref';
  footnoteId: string;
  label: string;
}

interface LexicalToMarkdownOptions {
  assetUrlMap?: Map<string, string>; // remap image src URLs to relative paths
  footnotes?: Footnote[];
}

export function lexicalToMarkdown(
  editorState: Record<string, unknown>,
  options?: LexicalToMarkdownOptions
): string {
  const root = (editorState as { root?: LexicalNode }).root;
  if (!root?.children) return '';

  const parts: string[] = [];
  for (const node of root.children) {
    const md = nodeToMarkdown(node, options, 0);
    if (md !== null) {
      parts.push(md);
    }
  }

  let result = parts.join('\n\n');

  // Append footnotes section
  if (options?.footnotes?.length) {
    result += '\n\n';
    for (const fn of options.footnotes) {
      result += `[^${fn.label}]: ${fn.content}\n`;
    }
  }

  return result.trimEnd() + '\n';
}

function nodeToMarkdown(
  node: LexicalNode,
  options: LexicalToMarkdownOptions | undefined,
  depth: number
): string | null {
  switch (node.type) {
    case 'paragraph':
      return renderParagraph(node, options);
    case 'heading':
      return renderHeading(node as HeadingNode, options);
    case 'list':
      return renderList(node as ListNode, options, depth);
    case 'quote':
      return renderQuote(node, options);
    case 'horizontalrule':
      return '---';
    case 'image':
      return renderImage(node as ImageNode, options);
    case 'codeblock':
      return renderCodeBlock(node as CodeBlockNode);
    case 'video':
      return renderVideo(node as VideoNode);
    case 'embed':
      return renderEmbed(node as EmbedNode);
    case 'tableblock':
      return renderTable(node as TableBlockNode);
    case 'callout':
      return renderCallout(node as CalloutNode, options);
    case 'toggle-container':
      return renderToggle(node, options);
    case 'bilingual':
      return renderBilingual(node as BilingualNode);
    case 'interactive':
      return `<!-- interactive: ${(node as InteractiveNode).componentSlug} -->`;
    case 'linebreak':
      return '\n';
    default:
      // Unknown block-level node: try to render children
      if (node.children) {
        return renderInlineChildren(node.children, options);
      }
      return null;
  }
}

function renderInlineChildren(
  children: LexicalNode[],
  options: LexicalToMarkdownOptions | undefined
): string {
  return children.map((child) => renderInline(child, options)).join('');
}

function renderInline(
  node: LexicalNode,
  options: LexicalToMarkdownOptions | undefined
): string {
  switch (node.type) {
    case 'text':
      return renderText(node as TextNode);
    case 'link':
      return renderLink(node as LinkNode, options);
    case 'footnote-ref':
      return `[^${(node as FootnoteRefNode).label}]`;
    case 'linebreak':
      return '\n';
    default:
      if (node.children) {
        return renderInlineChildren(node.children, options);
      }
      return '';
  }
}

// Lexical format bitmask: 1=bold, 2=italic, 4=strikethrough, 8=underline, 16=code
function renderText(node: TextNode): string {
  let text = node.text;
  const fmt = node.format || 0;

  if (fmt & 16) text = `\`${text}\``;
  if (fmt & 1) text = `**${text}**`;
  if (fmt & 2) text = `*${text}*`;
  if (fmt & 4) text = `~~${text}~~`;
  // underline has no standard markdown equivalent, skip

  return text;
}

function renderLink(node: LinkNode, options: LexicalToMarkdownOptions | undefined): string {
  const text = node.children ? renderInlineChildren(node.children, options) : '';
  return `[${text}](${node.url})`;
}

function renderParagraph(
  node: LexicalNode,
  options: LexicalToMarkdownOptions | undefined
): string {
  if (!node.children || node.children.length === 0) return '';
  return renderInlineChildren(node.children, options);
}

function renderHeading(
  node: HeadingNode,
  options: LexicalToMarkdownOptions | undefined
): string {
  const level = parseInt(node.tag.slice(1), 10);
  const prefix = '#'.repeat(level);
  const text = node.children ? renderInlineChildren(node.children, options) : '';
  return `${prefix} ${text}`;
}

function renderList(
  node: ListNode,
  options: LexicalToMarkdownOptions | undefined,
  depth: number
): string {
  if (!node.children) return '';
  const indent = '  '.repeat(depth);
  const lines: string[] = [];

  node.children.forEach((item, i) => {
    if (item.type !== 'listitem') return;

    const inlineParts: string[] = [];
    const nestedLists: string[] = [];

    for (const child of item.children ?? []) {
      if (child.type === 'list') {
        nestedLists.push(renderList(child as ListNode, options, depth + 1));
      } else {
        inlineParts.push(renderInline(child, options));
      }
    }

    const prefix = node.listType === 'number' ? `${i + 1}. ` : '- ';
    lines.push(`${indent}${prefix}${inlineParts.join('')}`);
    lines.push(...nestedLists);
  });

  return lines.join('\n');
}

function renderQuote(
  node: LexicalNode,
  options: LexicalToMarkdownOptions | undefined
): string {
  if (!node.children) return '>';
  // Each child paragraph in the quote gets "> " prefix
  const parts = node.children.map((child) => {
    const text = child.children ? renderInlineChildren(child.children, options) : '';
    return `> ${text}`;
  });
  return parts.join('\n');
}

function renderImage(
  node: ImageNode,
  options: LexicalToMarkdownOptions | undefined
): string {
  let src = node.src;
  if (options?.assetUrlMap && options.assetUrlMap.has(src)) {
    src = options.assetUrlMap.get(src)!;
  }
  let result = `![${node.alt || ''}](${src})`;
  if (node.caption) {
    result += `\n*${node.caption}*`;
  }
  return result;
}

function renderCodeBlock(node: CodeBlockNode): string {
  const lang = node.language || '';
  return `\`\`\`${lang}\n${node.code}\n\`\`\``;
}

function renderVideo(node: VideoNode): string {
  let url = '';
  if (node.provider === 'youtube' && node.videoId) {
    url = `https://www.youtube.com/watch?v=${node.videoId}`;
  } else if (node.provider === 'vimeo' && node.videoId) {
    url = `https://vimeo.com/${node.videoId}`;
  } else {
    url = node.videoId || '';
  }
  let result = url;
  if (node.caption) {
    result += `\n*${node.caption}*`;
  }
  return result;
}

function renderEmbed(node: EmbedNode): string {
  return `<!-- embed: ${node.url} -->`;
}

function renderTable(node: TableBlockNode): string {
  if (!node.headers?.length) return '';

  const alignMap: Record<string, string> = {
    left: ':---',
    center: ':---:',
    right: '---:',
  };

  const headerRow = `| ${node.headers.join(' | ')} |`;
  const separatorCells = node.headers.map((_, i) => {
    const align = node.alignments?.[i] || 'left';
    return alignMap[align] || '---';
  });
  const separatorRow = `| ${separatorCells.join(' | ')} |`;
  const dataRows = (node.rows || []).map(
    (row) => `| ${row.join(' | ')} |`
  );

  return [headerRow, separatorRow, ...dataRows].join('\n');
}

function renderCallout(
  node: CalloutNode,
  options: LexicalToMarkdownOptions | undefined
): string {
  const variant = (node.variant || 'NOTE').toUpperCase();
  const content = node.children
    ? node.children
        .map((child) => {
          const text = child.children
            ? renderInlineChildren(child.children, options)
            : '';
          return `> ${text}`;
        })
        .join('\n')
    : '';
  return `> [!${variant}]\n${content}`;
}

function renderToggle(
  node: LexicalNode,
  options: LexicalToMarkdownOptions | undefined
): string {
  const titleNode = node.children?.find((c) => c.type === 'toggle-title');
  const contentNode = node.children?.find((c) => c.type === 'toggle-content');

  const title = titleNode?.children
    ? renderInlineChildren(titleNode.children, options)
    : '';
  const content = contentNode?.children
    ? contentNode.children
        .map((child) => nodeToMarkdown(child, options, 0))
        .filter(Boolean)
        .join('\n\n')
    : '';

  return `<details><summary>${title}</summary>\n\n${content}\n\n</details>`;
}

function renderBilingual(node: BilingualNode): string {
  const langs = node.languages || [];
  if (langs.length === 0) return '';

  const hasBlockMarkdown = /^(>|#{1,6}\s|[-*]\s|\d+\.\s|```)/m;

  // Check if content is short and has no block-level markdown
  const allShort = langs.every(
    (lang) => (node.content[lang] || '').length < 200
  );
  const anyBlockLevel = langs.some(
    (lang) => hasBlockMarkdown.test(node.content[lang] || '')
  );

  if (allShort && !anyBlockLevel) {
    // Render as markdown table (only for simple inline content)
    const headerRow = `| ${langs.map((l) => l.toUpperCase()).join(' | ')} |`;
    const separator = `| ${langs.map(() => '---').join(' | ')} |`;
    const contentRow = `| ${langs.map((l) => node.content[l] || '').join(' | ')} |`;
    return [headerRow, separator, contentRow].join('\n');
  }

  // Render as sections — preserves all markdown including blockquotes, lists, etc.
  return langs
    .map((lang) => `**${lang.toUpperCase()}:**\n\n${node.content[lang] || ''}`)
    .join('\n\n');
}
