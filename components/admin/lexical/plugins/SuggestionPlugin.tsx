'use client';

import { useEffect, useState, useCallback } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  $createTextNode,
  $createLineBreakNode,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_LOW,
  type LexicalNode,
  type ElementNode,
} from 'lexical';
import { $createHeadingNode, $createQuoteNode, type HeadingTagType } from '@lexical/rich-text';
import { $createListNode, $createListItemNode } from '@lexical/list';
import { $createLinkNode } from '@lexical/link';
import {
  $isSuggestionMarkNode,
  $unwrapSuggestionMarkNode,
  SuggestionMarkNode,
} from '@/lib/lexical/nodes/SuggestionMarkNode';
import {
  $isSuggestionBlockNode,
  SuggestionBlockNode,
} from '@/lib/lexical/nodes/SuggestionBlockNode';
import { markdownToLexicalJson } from '@/lib/lexical/markdown-to-lexical';
import InlineSuggestionPopover from '@/components/admin/suggestions/InlineSuggestionPopover';

// ─── Helpers for building nodes from JSON ────────────────────────────────────
// (Same pattern as tool-executor.ts but using direct imports)

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
          for (const ic of (child.children as Array<Record<string, unknown>>) ?? []) {
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

function appendChildrenFromJson(
  parent: ElementNode,
  children?: Array<Record<string, unknown>>
): void {
  if (!children) return;
  for (const child of children) {
    const node = importInlineFromJson(child);
    if (node) parent.append(node);
  }
}

/** Parse a markdown string for inline formatting and append the resulting nodes to `parent`. */
function appendInlineMarkdown(parent: ElementNode, text: string): void {
  const parsed = markdownToLexicalJson(text);
  const root = (parsed as { root: { children: Array<Record<string, unknown>> } }).root;
  if (root.children.length > 0) {
    const first = root.children[0];
    if (first.children) {
      appendChildrenFromJson(parent, first.children as Array<Record<string, unknown>>);
      return;
    }
  }
  parent.append($createTextNode(text));
}

function parseMdToNodes(markdown: string): LexicalNode[] {
  const parsed = markdownToLexicalJson(markdown);
  const root = (parsed as { root: { children: Array<Record<string, unknown>> } }).root;
  return root.children
    .map((c) => importNodeFromJson(c))
    .filter((n): n is LexicalNode => n !== null);
}

// ─── Plugin ──────────────────────────────────────────────────────────────────

export default function SuggestionPlugin() {
  const [editor] = useLexicalComposerContext();
  const [activeInline, setActiveInline] = useState<{
    nodeKey: string;
    rect: DOMRect;
    originalText: string;
    suggestedText: string;
  } | null>(null);

  // Track selection to show inline suggestion popover
  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        editor.getEditorState().read(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) {
            setActiveInline(null);
            return;
          }

          const anchor = selection.anchor;
          const anchorNode = anchor.getNode();
          const parent = anchorNode.getParent();

          const markNode = $isSuggestionMarkNode(anchorNode)
            ? anchorNode
            : $isSuggestionMarkNode(parent)
              ? parent
              : null;

          if (markNode) {
            const dom = editor.getElementByKey(markNode.getKey());
            if (dom) {
              const rect = dom.getBoundingClientRect();
              setActiveInline({
                nodeKey: markNode.getKey(),
                rect,
                originalText: markNode.getTextContent(),
                suggestedText: markNode.getSuggestedText(),
              });
              return;
            }
          }

          setActiveInline(null);
        });
        return false;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor]);

  // Listen for suggestion-action custom events (from block components and panel)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        action: string;
        nodeKey?: string;
        type?: 'inline' | 'block';
      };

      if (detail.action === 'accept-all') {
        acceptAll();
      } else if (detail.action === 'reject-all') {
        rejectAll();
      } else if (detail.action === 'accept' && detail.nodeKey) {
        if (detail.type === 'inline') {
          acceptInline(detail.nodeKey);
        } else {
          acceptBlock(detail.nodeKey);
        }
      } else if (detail.action === 'reject' && detail.nodeKey) {
        if (detail.type === 'inline') {
          rejectInline(detail.nodeKey);
        } else {
          rejectBlock(detail.nodeKey);
        }
      }
    };

    window.addEventListener('suggestion-action', handler);
    return () => window.removeEventListener('suggestion-action', handler);
  });

  const acceptInline = useCallback(
    (nodeKey: string) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if (!$isSuggestionMarkNode(node)) return;

        const suggestedText = node.getSuggestedText();
        node.clear();
        appendInlineMarkdown(node, suggestedText);
        $unwrapSuggestionMarkNode(node);
      });
      setActiveInline(null);
    },
    [editor]
  );

  const rejectInline = useCallback(
    (nodeKey: string) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if (!$isSuggestionMarkNode(node)) return;
        $unwrapSuggestionMarkNode(node);
      });
      setActiveInline(null);
    },
    [editor]
  );

  const acceptBlock = useCallback(
    (nodeKey: string) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if (!$isSuggestionBlockNode(node)) return;

        if (node.getSuggestionType() === 'block-deletion') {
          node.remove();
        } else {
          const newNodes = parseMdToNodes(node.getSuggestedMarkdown());
          if (newNodes.length > 0) {
            let after: LexicalNode = node;
            for (const n of newNodes) {
              after.insertAfter(n);
              after = n;
            }
          }
          node.remove();
        }
      });
    },
    [editor]
  );

  const rejectBlock = useCallback(
    (nodeKey: string) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if (!$isSuggestionBlockNode(node)) return;

        const originalJSON = JSON.parse(node.getOriginalBlockJSON()) as Record<string, unknown>;
        const restored = importNodeFromJson(originalJSON);
        if (restored) {
          node.insertAfter(restored);
        }
        node.remove();
      });
    },
    [editor]
  );

  const acceptAll = useCallback(() => {
    editor.update(() => {
      const nodeMap = editor.getEditorState()._nodeMap;
      const inlineNodes: SuggestionMarkNode[] = [];
      const blockNodes: SuggestionBlockNode[] = [];

      for (const [, node] of nodeMap) {
        if ($isSuggestionMarkNode(node)) inlineNodes.push(node);
        else if ($isSuggestionBlockNode(node)) blockNodes.push(node);
      }

      for (const mark of inlineNodes) {
        const suggestedText = mark.getSuggestedText();
        mark.clear();
        appendInlineMarkdown(mark, suggestedText);
        $unwrapSuggestionMarkNode(mark);
      }

      for (const block of blockNodes) {
        if (block.getSuggestionType() === 'block-deletion') {
          block.remove();
        } else {
          const newNodes = parseMdToNodes(block.getSuggestedMarkdown());
          if (newNodes.length > 0) {
            let after: LexicalNode = block;
            for (const n of newNodes) {
              after.insertAfter(n);
              after = n;
            }
          }
          block.remove();
        }
      }
    });
    setActiveInline(null);
  }, [editor]);

  const rejectAll = useCallback(() => {
    editor.update(() => {
      const nodeMap = editor.getEditorState()._nodeMap;
      const inlineNodes: SuggestionMarkNode[] = [];
      const blockNodes: SuggestionBlockNode[] = [];

      for (const [, node] of nodeMap) {
        if ($isSuggestionMarkNode(node)) inlineNodes.push(node);
        else if ($isSuggestionBlockNode(node)) blockNodes.push(node);
      }

      for (const mark of inlineNodes) {
        $unwrapSuggestionMarkNode(mark);
      }

      for (const block of blockNodes) {
        const originalJSON = JSON.parse(block.getOriginalBlockJSON()) as Record<string, unknown>;
        const restored = importNodeFromJson(originalJSON);
        if (restored) {
          block.insertAfter(restored);
        }
        block.remove();
      }
    });
    setActiveInline(null);
  }, [editor]);

  return (
    <>
      {activeInline && (
        <InlineSuggestionPopover
          anchorRect={activeInline.rect}
          originalText={activeInline.originalText}
          suggestedText={activeInline.suggestedText}
          onAccept={() => acceptInline(activeInline.nodeKey)}
          onReject={() => rejectInline(activeInline.nodeKey)}
        />
      )}
    </>
  );
}
