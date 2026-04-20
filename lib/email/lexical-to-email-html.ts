/**
 * Converts a Lexical JSON editor state into inline-styled HTML suitable for email clients.
 * Mirrors the node types handled by LexicalContentRenderer.tsx.
 */

const BRAND_COLOR = '#3b82f6';
const TEXT_COLOR = '#1e293b';
const MUTED_COLOR = '#64748b';
const CODE_BG = '#f1f5f9';
const BORDER_COLOR = '#cbd5e1';

interface LexicalNode {
  type: string;
  version?: number;
  children?: LexicalNode[];
  [key: string]: unknown;
}

export function lexicalToEmailHtml(
  editorState: Record<string, unknown>,
  postSlug: string,
  postLanguage: string = 'en'
): string {
  const root = (editorState as { root?: LexicalNode }).root;
  if (!root?.children) return '';

  return root.children.map((node) => renderNode(node, postSlug, postLanguage)).join('');
}

function renderNode(node: LexicalNode, postSlug: string, lang: string): string {
  switch (node.type) {
    case 'paragraph':
      return renderParagraph(node, postSlug, lang);
    case 'heading':
      return renderHeading(node, postSlug, lang);
    case 'list':
      return renderList(node, postSlug, lang);
    case 'listitem':
      return renderListItem(node, postSlug, lang);
    case 'quote':
      return renderQuote(node, postSlug, lang);
    case 'horizontalrule':
      return `<hr style="border:none;border-top:1px solid ${BORDER_COLOR};margin:24px 0;" />`;
    case 'image':
      return renderImage(node, postSlug);
    case 'codeblock':
      return renderCodeBlock(node);
    case 'text':
      return renderText(node);
    case 'link':
      return renderLink(node, postSlug, lang);
    case 'linebreak':
      return '<br />';
    case 'bilingual':
      return renderBilingual(node, lang);
    case 'tableblock':
      return renderTable(node);
    case 'callout':
      return renderCallout(node, postSlug, lang);
    // Skip unsupported nodes — replace with "View on website" link
    case 'video':
    case 'embed':
    case 'interactive':
      return renderViewOnWebsite(postSlug);
    case 'toggle-container':
      return renderChildren(node, postSlug, lang);
    case 'toggle-title':
    case 'toggle-content':
      return renderChildren(node, postSlug, lang);
    case 'footnote-ref':
      return renderFootnoteRef(node);
    default:
      return '';
  }
}

function renderChildren(node: LexicalNode, postSlug: string, lang: string): string {
  if (!node.children) return '';
  return node.children.map((child) => renderNode(child, postSlug, lang)).join('');
}

function renderParagraph(node: LexicalNode, postSlug: string, lang: string): string {
  if (!node.children || node.children.length === 0) {
    return '<p style="margin:0 0 16px;">&nbsp;</p>';
  }
  const align = getAlignment(node.format);
  return `<p style="margin:0 0 16px;font-size:16px;line-height:1.7;${align}">${renderChildren(node, postSlug, lang)}</p>`;
}

function renderHeading(node: LexicalNode, postSlug: string, lang: string): string {
  const tag = (node.tag as string) || 'h2';
  const sizes: Record<string, string> = {
    h1: '28px', h2: '24px', h3: '20px', h4: '18px', h5: '16px', h6: '14px',
  };
  const size = sizes[tag] || '24px';
  const align = getAlignment(node.format);
  return `<${tag} style="margin:32px 0 12px;font-size:${size};font-weight:700;color:${TEXT_COLOR};${align}">${renderChildren(node, postSlug, lang)}</${tag}>`;
}

function renderText(node: LexicalNode): string {
  let content = escapeHtml(String(node.text ?? ''));
  const format = (node.format as number) || 0;

  if (format & 16) {
    content = `<code style="background-color:${CODE_BG};padding:2px 6px;border-radius:4px;font-size:14px;font-family:monospace;">${content}</code>`;
  }
  if (format & 1) content = `<strong>${content}</strong>`;
  if (format & 2) content = `<em>${content}</em>`;
  if (format & 4) content = `<s>${content}</s>`;
  if (format & 8) content = `<u>${content}</u>`;

  return content;
}

function renderLink(node: LexicalNode, postSlug: string, lang: string): string {
  const url = String(node.url ?? '#');
  return `<a href="${escapeHtml(url)}" style="color:${BRAND_COLOR};text-decoration:underline;">${renderChildren(node, postSlug, lang)}</a>`;
}

function renderList(node: LexicalNode, postSlug: string, lang: string): string {
  const tag = node.listType === 'number' ? 'ol' : 'ul';
  const listStyle = node.listType === 'number' ? 'decimal' : 'disc';
  return `<${tag} style="margin:0 0 16px;padding-left:24px;list-style-type:${listStyle};">${renderChildren(node, postSlug, lang)}</${tag}>`;
}

function renderListItem(node: LexicalNode, postSlug: string, lang: string): string {
  return `<li style="margin-bottom:4px;font-size:16px;line-height:1.7;">${renderChildren(node, postSlug, lang)}</li>`;
}

function renderQuote(node: LexicalNode, postSlug: string, lang: string): string {
  return `<blockquote style="margin:16px 0;padding:12px 16px;border-left:4px solid ${BORDER_COLOR};color:${MUTED_COLOR};font-style:italic;">${renderChildren(node, postSlug, lang)}</blockquote>`;
}

function renderImage(node: LexicalNode, postSlug: string): string {
  const src = String(node.src ?? '');
  const alt = escapeHtml(String(node.alt ?? ''));
  const caption = node.caption ? String(node.caption) : '';

  if (!src) return renderViewOnWebsite(postSlug);

  return `<div style="margin:16px 0;text-align:center;">
    <img src="${escapeHtml(src)}" alt="${alt}" style="max-width:100%;height:auto;border-radius:4px;" />
    ${caption ? `<p style="margin:8px 0 0;font-size:13px;color:${MUTED_COLOR};text-align:center;">${escapeHtml(caption)}</p>` : ''}
  </div>`;
}

function renderCodeBlock(node: LexicalNode): string {
  const code = escapeHtml(String(node.code ?? ''));
  const language = node.language ? String(node.language) : '';
  const filename = node.filename ? String(node.filename) : '';

  return `<div style="margin:16px 0;">
    ${filename ? `<div style="background-color:#334155;color:#e2e8f0;padding:8px 16px;font-size:12px;font-family:monospace;border-radius:6px 6px 0 0;">${escapeHtml(filename)}${language ? ` (${escapeHtml(language)})` : ''}</div>` : ''}
    <pre style="margin:0;background-color:#1e293b;color:#e2e8f0;padding:16px;${filename ? 'border-radius:0 0 6px 6px' : 'border-radius:6px'};overflow-x:auto;font-size:14px;line-height:1.5;font-family:monospace;"><code>${code}</code></pre>
  </div>`;
}

function renderBilingual(node: LexicalNode, lang: string): string {
  const content = node.content as Record<string, string> | undefined;
  if (!content) return '';

  // Render only the post's primary language
  const text = content[lang] || content.en || Object.values(content)[0] || '';
  // Bilingual content is stored as markdown — convert to email-safe HTML
  return `<div style="margin:0 0 16px;font-size:16px;line-height:1.7;">${markdownToEmailHtml(text)}</div>`;
}

function renderTable(node: LexicalNode): string {
  const headers = (node.headers as string[]) ?? [];
  const rows = (node.rows as string[][]) ?? [];

  let html = `<table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">`;
  if (headers.length > 0) {
    html += '<thead><tr>';
    for (const header of headers) {
      html += `<th style="border:1px solid ${BORDER_COLOR};padding:8px 12px;text-align:left;background-color:${CODE_BG};font-weight:600;">${escapeHtml(header)}</th>`;
    }
    html += '</tr></thead>';
  }
  html += '<tbody>';
  for (const row of rows) {
    html += '<tr>';
    for (const cell of row) {
      html += `<td style="border:1px solid ${BORDER_COLOR};padding:8px 12px;">${escapeHtml(cell)}</td>`;
    }
    html += '</tr>';
  }
  html += '</tbody></table>';
  return html;
}

function renderCallout(node: LexicalNode, postSlug: string, lang: string): string {
  const variant = String(node.variant ?? 'note');
  const colors: Record<string, { bg: string; border: string }> = {
    info: { bg: '#eff6ff', border: '#3b82f6' },
    warning: { bg: '#fefce8', border: '#eab308' },
    success: { bg: '#f0fdf4', border: '#22c55e' },
    error: { bg: '#fef2f2', border: '#ef4444' },
    note: { bg: '#f8fafc', border: '#94a3b8' },
  };
  const style = colors[variant] ?? colors.note;
  return `<div style="margin:16px 0;padding:12px 16px;background-color:${style.bg};border-left:4px solid ${style.border};border-radius:4px;">${renderChildren(node, postSlug, lang)}</div>`;
}

function renderFootnoteRef(node: LexicalNode): string {
  const label = String(node.label ?? '');
  return `<sup style="font-size:0.75em;">[${escapeHtml(label)}]</sup>`;
}

function renderViewOnWebsite(postSlug: string): string {
  const url = `https://caideiseach.com/blog/${postSlug}`;
  return `<p style="margin:16px 0;padding:12px 16px;background-color:${CODE_BG};border-radius:4px;text-align:center;font-size:14px;color:${MUTED_COLOR};">
    This content is best viewed on the web. <a href="${escapeHtml(url)}" style="color:${BRAND_COLOR};text-decoration:underline;">View on website</a>
  </p>`;
}

function getAlignment(format: unknown): string {
  const map: Record<number, string> = { 1: 'left', 2: 'center', 3: 'right', 4: 'justify' };
  if (typeof format === 'number' && format in map) {
    return `text-align:${map[format]};`;
  }
  return '';
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Converts markdown to inline-styled HTML for email (blockquotes, headings, bold, italic, links, paragraphs) */
function markdownToEmailHtml(md: string): string {
  const blocks = md.split('\n\n');
  return blocks
    .map((block) => {
      let html = block.trim();
      if (!html) return '';

      // Blockquote (lines starting with >)
      if (html.startsWith('>')) {
        const quoteContent = html
          .split('\n')
          .map((line) => line.replace(/^>\s?/, ''))
          .join('<br />');
        const styledContent = applyInlineFormatting(quoteContent);
        return `<blockquote style="margin:16px 0;padding:12px 16px;border-left:4px solid ${BORDER_COLOR};color:${MUTED_COLOR};font-style:italic;">${styledContent}</blockquote>`;
      }

      // Headings
      const headingMatch = html.match(/^(#{1,6})\s+(.+)/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const sizes: Record<number, string> = { 1: '28px', 2: '24px', 3: '20px', 4: '18px', 5: '16px', 6: '14px' };
        const size = sizes[level] || '16px';
        const content = applyInlineFormatting(headingMatch[2]);
        return `<h${level} style="margin:24px 0 12px;font-size:${size};font-weight:700;color:${TEXT_COLOR};">${content}</h${level}>`;
      }

      // Unordered list
      if (html.match(/^[-*]\s/m)) {
        const items = html.split('\n')
          .filter((line) => line.match(/^[-*]\s/))
          .map((line) => `<li style="margin-bottom:4px;">${applyInlineFormatting(line.replace(/^[-*]\s+/, ''))}</li>`)
          .join('');
        return `<ul style="margin:0 0 16px;padding-left:24px;list-style-type:disc;">${items}</ul>`;
      }

      // Ordered list
      if (html.match(/^\d+\.\s/m)) {
        const items = html.split('\n')
          .filter((line) => line.match(/^\d+\.\s/))
          .map((line) => `<li style="margin-bottom:4px;">${applyInlineFormatting(line.replace(/^\d+\.\s+/, ''))}</li>`)
          .join('');
        return `<ol style="margin:0 0 16px;padding-left:24px;list-style-type:decimal;">${items}</ol>`;
      }

      // Regular paragraph
      html = applyInlineFormatting(html);
      html = html.replace(/\n/g, '<br />');
      return `<p style="margin:0 0 16px;font-size:16px;line-height:1.7;">${html}</p>`;
    })
    .join('');
}

function applyInlineFormatting(text: string): string {
  let html = text;
  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  // Inline code
  html = html.replace(/`([^`]+)`/g, `<code style="background-color:${CODE_BG};padding:2px 6px;border-radius:4px;font-size:14px;font-family:monospace;">$1</code>`);
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, `<a href="$2" style="color:${BRAND_COLOR};text-decoration:underline;">$1</a>`);
  return html;
}
