/**
 * Converts a markdown string into a valid Lexical EditorState JSON.
 * No live Lexical editor instance or DOM required.
 * Uses remark to parse markdown AST, then maps to Lexical JSON nodes.
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';

// Remark AST node types
interface MdastNode {
  type: string;
  children?: MdastNode[];
  value?: string;
  depth?: number;
  ordered?: boolean;
  url?: string;
  title?: string;
  alt?: string;
  lang?: string;
  meta?: string;
  [key: string]: unknown;
}

interface LexicalJsonNode {
  type: string;
  version: number;
  [key: string]: unknown;
}

function createTextNode(text: string, format: number = 0): LexicalJsonNode {
  return {
    type: 'text',
    version: 1,
    text,
    format,
    mode: 'normal',
    style: '',
    detail: 0,
  };
}

function createParagraphNode(children: LexicalJsonNode[]): LexicalJsonNode {
  return {
    type: 'paragraph',
    version: 1,
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    textFormat: 0,
    textStyle: '',
  };
}

function createHeadingNode(tag: string, children: LexicalJsonNode[]): LexicalJsonNode {
  return {
    type: 'heading',
    version: 1,
    tag,
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    textFormat: 0,
    textStyle: '',
  };
}

function createQuoteNode(children: LexicalJsonNode[]): LexicalJsonNode {
  return {
    type: 'quote',
    version: 1,
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    textFormat: 0,
    textStyle: '',
  };
}

function createListNode(ordered: boolean, children: LexicalJsonNode[]): LexicalJsonNode {
  return {
    type: 'list',
    version: 1,
    listType: ordered ? 'number' : 'bullet',
    start: 1,
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    tag: ordered ? 'ol' : 'ul',
  };
}

function createListItemNode(children: LexicalJsonNode[]): LexicalJsonNode {
  return {
    type: 'listitem',
    version: 1,
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    value: 1,
  };
}

function createLinkNode(url: string, children: LexicalJsonNode[]): LexicalJsonNode {
  return {
    type: 'link',
    version: 3,
    url,
    target: null,
    rel: 'noopener noreferrer',
    title: null,
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
  };
}

function createHorizontalRuleNode(): LexicalJsonNode {
  return {
    type: 'horizontalrule',
    version: 1,
  };
}

function createCodeBlockNode(code: string, language: string): LexicalJsonNode {
  return {
    type: 'codeblock',
    version: 1,
    code,
    language,
    filename: '',
  };
}

function createImageNode(src: string, alt: string): LexicalJsonNode {
  return {
    type: 'image',
    version: 1,
    assetId: '',
    src,
    alt: alt || '',
    caption: '',
    width: 0,
    height: 0,
  };
}

// Convert inline mdast nodes to Lexical text/link nodes
function convertInlineNodes(nodes: MdastNode[], format: number = 0): LexicalJsonNode[] {
  const result: LexicalJsonNode[] = [];

  for (const node of nodes) {
    switch (node.type) {
      case 'text':
        result.push(createTextNode(node.value || '', format));
        break;

      case 'strong':
        result.push(...convertInlineNodes(node.children || [], format | 1));
        break;

      case 'emphasis':
        result.push(...convertInlineNodes(node.children || [], format | 2));
        break;

      case 'delete':
        result.push(...convertInlineNodes(node.children || [], format | 4));
        break;

      case 'inlineCode':
        result.push(createTextNode(node.value || '', format | 16));
        break;

      case 'link':
        result.push(
          createLinkNode(
            node.url || '',
            convertInlineNodes(node.children || [], format)
          )
        );
        break;

      case 'image':
        // Inline images become their own paragraph-level image nodes
        // For now, just use alt text
        result.push(createTextNode(node.alt || '[image]', format));
        break;

      case 'break':
        result.push({ type: 'linebreak', version: 1 });
        break;

      default:
        if (node.value) {
          result.push(createTextNode(node.value, format));
        }
        if (node.children) {
          result.push(...convertInlineNodes(node.children, format));
        }
        break;
    }
  }

  return result;
}

// Convert block-level mdast nodes to Lexical nodes
function convertBlockNode(node: MdastNode): LexicalJsonNode[] {
  switch (node.type) {
    case 'paragraph': {
      // Check if paragraph contains only an image
      if (
        node.children?.length === 1 &&
        node.children[0].type === 'image'
      ) {
        const img = node.children[0];
        return [createImageNode(img.url || '', img.alt || '')];
      }
      const inlineChildren = convertInlineNodes(node.children || []);
      if (inlineChildren.length === 0) {
        return [createParagraphNode([createTextNode('')])];
      }
      return [createParagraphNode(inlineChildren)];
    }

    case 'heading': {
      const depth = node.depth || 1;
      const tag = `h${Math.min(depth, 6)}`;
      const children = convertInlineNodes(node.children || []);
      return [createHeadingNode(tag, children.length > 0 ? children : [createTextNode('')])];
    }

    case 'blockquote': {
      const quoteChildren: LexicalJsonNode[] = [];
      for (const child of node.children || []) {
        if (child.type === 'paragraph') {
          const inlines = convertInlineNodes(child.children || []);
          quoteChildren.push(createParagraphNode(inlines.length > 0 ? inlines : [createTextNode('')]));
        } else {
          quoteChildren.push(...convertBlockNode(child));
        }
      }
      return [createQuoteNode(quoteChildren)];
    }

    case 'list': {
      const ordered = node.ordered ?? false;
      const listItems: LexicalJsonNode[] = [];
      for (const item of node.children || []) {
        listItems.push(...convertBlockNode(item));
      }
      return [createListNode(ordered, listItems)];
    }

    case 'listItem': {
      const itemChildren: LexicalJsonNode[] = [];
      for (const child of node.children || []) {
        if (child.type === 'paragraph') {
          // Flatten paragraph content into the list item
          const inlines = convertInlineNodes(child.children || []);
          itemChildren.push(...(inlines.length > 0 ? inlines : [createTextNode('')]));
        } else if (child.type === 'list') {
          // Nested list
          itemChildren.push(...convertBlockNode(child));
        } else {
          itemChildren.push(...convertBlockNode(child));
        }
      }
      return [createListItemNode(itemChildren.length > 0 ? itemChildren : [createTextNode('')])];
    }

    case 'code': {
      return [createCodeBlockNode(node.value || '', node.lang || '')];
    }

    case 'thematicBreak': {
      return [createHorizontalRuleNode()];
    }

    case 'image': {
      return [createImageNode(node.url || '', node.alt || '')];
    }

    case 'html': {
      // Treat raw HTML as a paragraph with the text content
      return [createParagraphNode([createTextNode(node.value || '')])];
    }

    default: {
      // Unknown node type - try to convert children
      if (node.children) {
        const results: LexicalJsonNode[] = [];
        for (const child of node.children) {
          results.push(...convertBlockNode(child));
        }
        return results;
      }
      if (node.value) {
        return [createParagraphNode([createTextNode(node.value)])];
      }
      return [];
    }
  }
}

export function markdownToLexicalJson(markdown: string): Record<string, unknown> {
  const processor = unified().use(remarkParse);
  const tree = processor.parse(markdown) as MdastNode;

  const children: LexicalJsonNode[] = [];
  for (const child of tree.children || []) {
    children.push(...convertBlockNode(child));
  }

  // Ensure at least one paragraph
  if (children.length === 0) {
    children.push(createParagraphNode([createTextNode('')]));
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
