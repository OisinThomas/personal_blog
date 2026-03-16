import type { LexicalEditor, LexicalNode, ElementNode as ElementNodeType } from 'lexical';
import {
  $getRoot,
  $getNodeByKey,
  $createParagraphNode,
  $createTextNode,
  $createLineBreakNode,
  $isElementNode,
} from 'lexical';
import { $createHeadingNode, type HeadingTagType, $createQuoteNode } from '@lexical/rich-text';
import { $createListNode, $createListItemNode } from '@lexical/list';
import { $createLinkNode } from '@lexical/link';
import { $createHorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';
import { $createCodeBlockNode } from '@/lib/lexical/nodes/CodeBlockNode';
import { $createImageNode } from '@/lib/lexical/nodes/ImageNode';
import { $createTableBlockNode } from '@/lib/lexical/nodes/TableBlockNode';
import { $createBilingualNode } from '@/lib/lexical/nodes/BilingualNode';
import { $createCalloutNode, type CalloutVariant } from '@/lib/lexical/nodes/CalloutNode';
import { $createToggleContainerNode } from '@/lib/lexical/nodes/ToggleContainerNode';
import { $createToggleTitleNode } from '@/lib/lexical/nodes/ToggleTitleNode';
import { $createToggleContentNode } from '@/lib/lexical/nodes/ToggleContentNode';
import { lexicalToMarkdown } from '@/lib/export/lexical-to-markdown';
import { markdownToLexicalJson } from '@/lib/lexical/markdown-to-lexical';
import type { PostWithAsset } from '@/lib/supabase/types';
import type { Attachment } from '@/lib/ai/attachments';

interface ToolExecutorContext {
  editor: LexicalEditor;
  post: PostWithAsset;
  sources?: Attachment[];
}

// ─── Read tools ─────────────────────────────────────────────────────────────

function getArticleContent(ctx: ToolExecutorContext): string {
  const json = ctx.editor.getEditorState().toJSON();
  return lexicalToMarkdown(json as unknown as Record<string, unknown>) || '(empty article)';
}

function getArticleMetadata(ctx: ToolExecutorContext): string {
  const { post } = ctx;
  return JSON.stringify({
    title: post.title,
    slug: post.slug,
    status: post.status,
    language: post.language,
    major_tag: post.major_tag,
    sub_tag: post.sub_tag,
    description: post.description,
    published_at: post.published_at,
    tags: post.tags,
    author: post.author,
  }, null, 2);
}

function getBlockContent(ctx: ToolExecutorContext, args: { nodeKey: string }): string {
  let result = '';
  ctx.editor.getEditorState().read(() => {
    const node = $getNodeByKey(args.nodeKey);
    if (!node) {
      result = `Error: No node found with key "${args.nodeKey}"`;
      return;
    }
    result = node.getTextContent();
  });
  return result;
}

function listBlocks(ctx: ToolExecutorContext): string {
  const blocks: { key: string; type: string; preview: string }[] = [];
  ctx.editor.getEditorState().read(() => {
    const root = $getRoot();
    const children = root.getChildren();
    for (const child of children) {
      const text = child.getTextContent();
      // Skip trailing empty paragraph (added by TrailingParagraphPlugin)
      if (
        child.getType() === 'paragraph' &&
        text === '' &&
        child === children[children.length - 1]
      ) continue;
      blocks.push({
        key: child.getKey(),
        type: child.getType(),
        preview: text.length > 100 ? text.slice(0, 100) + '...' : text,
      });
    }
  });
  return JSON.stringify(blocks, null, 2);
}

// ─── Helpers for building nodes from markdown JSON ──────────────────────────

function importNodeFromJson(json: Record<string, unknown>): LexicalNode | null {
  const type = json.type as string;
  switch (type) {
    case 'paragraph': {
      const p = $createParagraphNode();
      appendChildrenFromJson(p, json.children as Array<Record<string, unknown>>);
      return p;
    }
    case 'heading': {
      const tag = (json.tag as string) || 'h2';
      const h = $createHeadingNode(tag as HeadingTagType);
      appendChildrenFromJson(h, json.children as Array<Record<string, unknown>>);
      return h;
    }
    case 'quote': {
      const q = $createQuoteNode();
      for (const child of (json.children as Array<Record<string, unknown>>) ?? []) {
        const node = importNodeFromJson(child);
        if (node) q.append(node);
      }
      return q;
    }
    case 'list': {
      const listType = (json.listType as string) || 'bullet';
      const list = $createListNode(listType as 'bullet' | 'number');
      for (const child of (json.children as Array<Record<string, unknown>>) ?? []) {
        if ((child.type as string) === 'listitem') {
          const item = $createListItemNode();
          const itemChildren = (child.children as Array<Record<string, unknown>>) ?? [];
          for (const ic of itemChildren) {
            if ((ic.type as string) === 'list') {
              const nested = importNodeFromJson(ic);
              if (nested) item.append(nested);
            } else {
              const inline = importInlineFromJson(ic);
              if (inline) item.append(inline);
            }
          }
          list.append(item);
        }
      }
      return list;
    }
    case 'codeblock':
      return $createCodeBlockNode({
        code: (json.code as string) || '',
        language: (json.language as string) || '',
        filename: (json.filename as string) || '',
      });
    case 'horizontalrule':
      return $createHorizontalRuleNode();
    case 'image':
      return $createImageNode({
        src: (json.src as string) || '',
        alt: (json.alt as string) || '',
        caption: (json.caption as string) || '',
      });
    default:
      if (json.children) {
        const p = $createParagraphNode();
        appendChildrenFromJson(p, json.children as Array<Record<string, unknown>>);
        return p;
      }
      return null;
  }
}

function importInlineFromJson(json: Record<string, unknown>): LexicalNode | null {
  switch (json.type as string) {
    case 'text': {
      const node = $createTextNode((json.text as string) || '');
      if (json.format) node.setFormat(json.format as number);
      return node;
    }
    case 'linebreak':
      return $createLineBreakNode();
    case 'link': {
      const link = $createLinkNode((json.url as string) || '');
      appendChildrenFromJson(link, json.children as Array<Record<string, unknown>>);
      return link;
    }
    default:
      if (json.text) return $createTextNode(json.text as string);
      return null;
  }
}

function appendChildrenFromJson(parent: ElementNodeType, children?: Array<Record<string, unknown>>): void {
  if (!children) return;
  for (const child of children) {
    const node = importInlineFromJson(child);
    if (node) parent.append(node);
  }
}

/** Parse a markdown string for inline formatting and append the resulting nodes to `parent`. */
function appendInlineMarkdown(parent: ElementNodeType, text: string): void {
  const parsed = markdownToLexicalJson(text);
  const root = (parsed as { root: { children: Array<Record<string, unknown>> } }).root;
  if (root.children.length > 0) {
    const first = root.children[0];
    if ((first.type as string) === 'paragraph' && first.children) {
      appendChildrenFromJson(parent, first.children as Array<Record<string, unknown>>);
      return;
    }
  }
  // Fallback to plain text if parsing fails
  parent.append($createTextNode(text));
}

function parseMdToNodes(markdown: string): LexicalNode[] {
  const parsed = markdownToLexicalJson(markdown);
  const root = (parsed as { root: { children: Array<Record<string, unknown>> } }).root;
  const nodes = root.children.map(importNodeFromJson).filter((n): n is LexicalNode => n !== null);

  // Strip trailing empty paragraphs (remark produces these from trailing newlines)
  while (
    nodes.length > 1 &&
    nodes[nodes.length - 1].getType() === 'paragraph' &&
    nodes[nodes.length - 1].getTextContentSize() === 0
  ) {
    nodes.pop();
  }
  return nodes;
}

function insertNodeAt(node: LexicalNode, afterNodeKey?: string): void {
  if (afterNodeKey) {
    const target = $getNodeByKey(afterNodeKey);
    if (target) {
      target.insertAfter(node);
      return;
    }
  }
  // Insert before trailing empty paragraph (from TrailingParagraphPlugin) instead of after it
  const root = $getRoot();
  const lastChild = root.getLastChild();
  if (lastChild && lastChild.getType() === 'paragraph' && lastChild.getTextContentSize() === 0) {
    lastChild.insertBefore(node);
  } else {
    root.append(node);
  }
}

function insertNodesAt(nodes: LexicalNode[], afterNodeKey?: string): void {
  let anchor: LexicalNode | null = afterNodeKey ? $getNodeByKey(afterNodeKey) : null;
  if (!anchor) {
    // Insert before trailing empty paragraph (from TrailingParagraphPlugin) instead of after it
    const root = $getRoot();
    const lastChild = root.getLastChild();
    if (lastChild && lastChild.getType() === 'paragraph' && lastChild.getTextContentSize() === 0) {
      for (const node of nodes) {
        lastChild.insertBefore(node);
      }
      return;
    }
  }
  for (const node of nodes) {
    if (anchor) {
      anchor.insertAfter(node);
      anchor = node;
    } else {
      $getRoot().append(node);
    }
  }
}

// ─── Edit tools ─────────────────────────────────────────────────────────────

function replaceBlockText(ctx: ToolExecutorContext, args: { nodeKey: string; newText: string }): Promise<string> {
  return new Promise((resolve) => {
    ctx.editor.update(() => {
      const node = $getNodeByKey(args.nodeKey);
      if (!node) { resolve(`Error: No node found with key "${args.nodeKey}"`); return; }
      if (!$isElementNode(node)) { resolve(`Error: Node type "${node.getType()}" does not support text replacement`); return; }

      // Parse markdown inline content and replace children
      const parsed = markdownToLexicalJson(args.newText);
      const root = (parsed as { root: { children: Array<Record<string, unknown>> } }).root;

      // If it parsed into a single paragraph, use its children
      if (root.children.length === 1 && (root.children[0].type as string) === 'paragraph') {
        const pJson = root.children[0];
        node.clear();
        appendChildrenFromJson(node, pJson.children as Array<Record<string, unknown>>);
      } else {
        // Multi-paragraph result: use inline children from the first paragraph
        const firstPara = root.children.find((c) => (c.type as string) === 'paragraph');
        node.clear();
        if (firstPara && firstPara.children) {
          appendChildrenFromJson(node, firstPara.children as Array<Record<string, unknown>>);
        } else {
          appendInlineMarkdown(node, args.newText);
        }
      }
      resolve(`Replaced text in block ${args.nodeKey}`);
    });
  });
}

function replaceBlockMarkdown(ctx: ToolExecutorContext, args: { nodeKey: string; markdown: string }): Promise<string> {
  return new Promise((resolve) => {
    ctx.editor.update(() => {
      const node = $getNodeByKey(args.nodeKey);
      if (!node) { resolve(`Error: No node found with key "${args.nodeKey}"`); return; }

      const newNodes = parseMdToNodes(args.markdown);
      if (newNodes.length === 0) { resolve(`Error: Failed to parse markdown`); return; }

      // Insert new nodes after the target, then remove it
      let after: LexicalNode = node;
      for (const n of newNodes) {
        after.insertAfter(n);
        after = n;
      }
      node.remove();
      resolve(`Replaced block ${args.nodeKey} with ${newNodes.length} node(s)`);
    });
  });
}

function insertBlockAfter(ctx: ToolExecutorContext, args: { nodeKey: string; markdown: string }): Promise<string> {
  return new Promise((resolve) => {
    ctx.editor.update(() => {
      const node = $getNodeByKey(args.nodeKey);
      if (!node) { resolve(`Error: No node found with key "${args.nodeKey}"`); return; }

      const newNodes = parseMdToNodes(args.markdown);
      if (newNodes.length === 0) { resolve(`Error: Failed to parse markdown`); return; }

      let after: LexicalNode = node;
      for (const n of newNodes) {
        after.insertAfter(n);
        after = n;
      }
      resolve(`Inserted ${newNodes.length} block(s) after ${args.nodeKey}`);
    });
  });
}

function deleteBlock(ctx: ToolExecutorContext, args: { nodeKey: string }): Promise<string> {
  return new Promise((resolve) => {
    ctx.editor.update(() => {
      const node = $getNodeByKey(args.nodeKey);
      if (!node) { resolve(`Error: No node found with key "${args.nodeKey}"`); return; }
      const type = node.getType();
      node.remove();
      resolve(`Deleted ${type} block ${args.nodeKey}`);
    });
  });
}

// ─── Content creation tools ─────────────────────────────────────────────────

function createHeading(ctx: ToolExecutorContext, args: { level: number; text: string; afterNodeKey?: string }): Promise<string> {
  return new Promise((resolve) => {
    ctx.editor.update(() => {
      const heading = $createHeadingNode(`h${args.level}` as HeadingTagType);
      appendInlineMarkdown(heading, args.text);
      insertNodeAt(heading, args.afterNodeKey);
      resolve(`Created h${args.level}: "${args.text}" (key: ${heading.getKey()})`);
    });
  });
}

function createParagraph(ctx: ToolExecutorContext, args: { text: string; afterNodeKey?: string }): Promise<string> {
  return new Promise((resolve) => {
    ctx.editor.update(() => {
      const nodes = parseMdToNodes(args.text);
      insertNodesAt(nodes.length > 0 ? nodes : [$createParagraphNode()], args.afterNodeKey);
      resolve(`Created ${nodes.length} paragraph(s)`);
    });
  });
}

function createCodeBlock(ctx: ToolExecutorContext, args: { code: string; language?: string; filename?: string; afterNodeKey?: string }): Promise<string> {
  return new Promise((resolve) => {
    ctx.editor.update(() => {
      const cb = $createCodeBlockNode({ code: args.code, language: args.language || '', filename: args.filename || '' });
      insertNodeAt(cb, args.afterNodeKey);
      resolve(`Created code block (${args.language || 'plain'}, key: ${cb.getKey()})`);
    });
  });
}

function createCallout(ctx: ToolExecutorContext, args: { variant: string; content: string; afterNodeKey?: string }): Promise<string> {
  return new Promise((resolve) => {
    ctx.editor.update(() => {
      const callout = $createCalloutNode(args.variant as CalloutVariant);
      const p = $createParagraphNode();
      p.append($createTextNode(args.content));
      callout.append(p);
      insertNodeAt(callout, args.afterNodeKey);
      resolve(`Created ${args.variant} callout (key: ${callout.getKey()})`);
    });
  });
}

function createList(ctx: ToolExecutorContext, args: { listType: string; items: string[]; afterNodeKey?: string }): Promise<string> {
  return new Promise((resolve) => {
    ctx.editor.update(() => {
      const list = $createListNode(args.listType as 'bullet' | 'number');
      for (const item of args.items) {
        const li = $createListItemNode();
        appendInlineMarkdown(li, item);
        list.append(li);
      }
      insertNodeAt(list, args.afterNodeKey);
      resolve(`Created ${args.listType} list with ${args.items.length} items`);
    });
  });
}

function createBilingualBlock(ctx: ToolExecutorContext, args: { en: string; ga: string; afterNodeKey?: string }): Promise<string> {
  return new Promise((resolve) => {
    ctx.editor.update(() => {
      const node = $createBilingualNode({ languages: ['en', 'ga'], content: { en: args.en, ga: args.ga } });
      insertNodeAt(node, args.afterNodeKey);
      resolve(`Created bilingual block (key: ${node.getKey()})`);
    });
  });
}

function createTable(ctx: ToolExecutorContext, args: { headers: string[]; rows: string[][]; afterNodeKey?: string }): Promise<string> {
  return new Promise((resolve) => {
    ctx.editor.update(() => {
      const table = $createTableBlockNode({ headers: args.headers, rows: args.rows, alignments: args.headers.map(() => 'left') });
      insertNodeAt(table, args.afterNodeKey);
      resolve(`Created table ${args.headers.length}x${args.rows.length}`);
    });
  });
}

function createToggle(ctx: ToolExecutorContext, args: { title: string; content: string; afterNodeKey?: string }): Promise<string> {
  return new Promise((resolve) => {
    ctx.editor.update(() => {
      const container = $createToggleContainerNode(true);
      const titleNode = $createToggleTitleNode();
      const contentNode = $createToggleContentNode();
      const tp = $createParagraphNode();
      tp.append($createTextNode(args.title));
      titleNode.append(tp);

      const contentNodes = parseMdToNodes(args.content);
      if (contentNodes.length > 0) {
        for (const n of contentNodes) contentNode.append(n);
      } else {
        const cp = $createParagraphNode();
        cp.append($createTextNode(args.content));
        contentNode.append(cp);
      }

      container.append(titleNode, contentNode);
      insertNodeAt(container, args.afterNodeKey);
      resolve(`Created toggle block (key: ${container.getKey()})`);
    });
  });
}

function generateSection(ctx: ToolExecutorContext, args: { markdown: string; afterNodeKey?: string }): Promise<string> {
  return new Promise((resolve) => {
    ctx.editor.update(() => {
      const nodes = parseMdToNodes(args.markdown);
      if (nodes.length === 0) { resolve('Error: Failed to parse markdown'); return; }
      insertNodesAt(nodes, args.afterNodeKey);
      resolve(`Generated ${nodes.length} blocks from markdown`);
    });
  });
}

// ─── Source tools ────────────────────────────────────────────────────────────

function getSourceContent(ctx: ToolExecutorContext, args: { sourceName: string }): string {
  const sources = ctx.sources ?? [];
  const source = sources.find((s) => s.name === args.sourceName);
  if (!source) {
    const available = sources.map((s) => s.name).join(', ') || '(none)';
    return `Error: No source found with name "${args.sourceName}". Available sources: ${available}`;
  }
  if (source.type === 'image') {
    return `[Image: ${source.name}, ${source.mimeType}, ${(source.size / 1024).toFixed(1)}KB]\nData URL: ${source.content.slice(0, 200)}...`;
  }
  return source.content;
}

function listSources(ctx: ToolExecutorContext): string {
  const sources = ctx.sources ?? [];
  if (sources.length === 0) return 'No sources attached.';
  return JSON.stringify(
    sources.map((s) => ({
      name: s.name,
      type: s.type,
      size: `${(s.size / 1024).toFixed(1)}KB`,
    })),
    null,
    2
  );
}

// ─── Main executor ──────────────────────────────────────────────────────────

export async function executeToolCall(
  toolName: string,
  args: Record<string, unknown>,
  ctx: ToolExecutorContext
): Promise<string> {
  switch (toolName) {
    case 'get_article_content': return getArticleContent(ctx);
    case 'get_article_metadata': return getArticleMetadata(ctx);
    case 'get_block_content': return getBlockContent(ctx, args as { nodeKey: string });
    case 'list_blocks': return listBlocks(ctx);
    case 'replace_block_text': return replaceBlockText(ctx, args as { nodeKey: string; newText: string });
    case 'replace_block_markdown': return replaceBlockMarkdown(ctx, args as { nodeKey: string; markdown: string });
    case 'insert_block_after': return insertBlockAfter(ctx, args as { nodeKey: string; markdown: string });
    case 'delete_block': return deleteBlock(ctx, args as { nodeKey: string });
    case 'create_heading': return createHeading(ctx, args as { level: number; text: string; afterNodeKey?: string });
    case 'create_paragraph': return createParagraph(ctx, args as { text: string; afterNodeKey?: string });
    case 'create_code_block': return createCodeBlock(ctx, args as { code: string; language?: string; filename?: string; afterNodeKey?: string });
    case 'create_callout': return createCallout(ctx, args as { variant: string; content: string; afterNodeKey?: string });
    case 'create_list': return createList(ctx, args as { listType: string; items: string[]; afterNodeKey?: string });
    case 'create_bilingual_block': return createBilingualBlock(ctx, args as { en: string; ga: string; afterNodeKey?: string });
    case 'create_table': return createTable(ctx, args as { headers: string[]; rows: string[][]; afterNodeKey?: string });
    case 'create_toggle': return createToggle(ctx, args as { title: string; content: string; afterNodeKey?: string });
    case 'generate_section': return generateSection(ctx, args as { markdown: string; afterNodeKey?: string });
    case 'get_source_content': return getSourceContent(ctx, args as { sourceName: string });
    case 'list_sources': return listSources(ctx);
    default: return `Error: Unknown tool "${toolName}"`;
  }
}
