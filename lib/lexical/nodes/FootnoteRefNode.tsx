import {
  DecoratorNode,
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical';
import { ReactNode } from 'react';

export type SerializedFootnoteRefNode = Spread<
  {
    footnoteId: string;
    label: string;
  },
  SerializedLexicalNode
>;

export class FootnoteRefNode extends DecoratorNode<ReactNode> {
  __footnoteId: string;
  __label: string;

  static getType(): string {
    return 'footnote-ref';
  }

  static clone(node: FootnoteRefNode): FootnoteRefNode {
    return new FootnoteRefNode(node.__footnoteId, node.__label, node.__key);
  }

  constructor(footnoteId: string, label: string, key?: NodeKey) {
    super(key);
    this.__footnoteId = footnoteId;
    this.__label = label;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      sup: (node: HTMLElement) => {
        if (!node.classList.contains('footnote-ref')) return null;
        return {
          conversion: (domNode: HTMLElement): DOMConversionOutput | null => {
            const anchor = domNode.querySelector('a');
            if (!anchor) return null;
            const href = anchor.getAttribute('href') || '';
            const footnoteId = href.replace('#fn-', '');
            const label = (anchor.textContent || '').replace(/[[\]]/g, '');
            if (!footnoteId || !label) return null;
            return { node: new FootnoteRefNode(footnoteId, label) };
          },
          priority: 1,
        };
      },
    };
  }

  static importJSON(serializedNode: SerializedFootnoteRefNode): FootnoteRefNode {
    return new FootnoteRefNode(serializedNode.footnoteId, serializedNode.label);
  }

  exportJSON(): SerializedFootnoteRefNode {
    return {
      type: 'footnote-ref',
      version: 1,
      footnoteId: this.__footnoteId,
      label: this.__label,
    };
  }

  createDOM(): HTMLElement {
    const sup = document.createElement('sup');
    sup.className = 'footnote-ref';
    return sup;
  }

  updateDOM(): false {
    return false;
  }

  exportDOM(): DOMExportOutput {
    const sup = document.createElement('sup');
    const a = document.createElement('a');
    a.href = `#fn-${this.__footnoteId}`;
    a.id = `fnref-${this.__footnoteId}`;
    a.textContent = `[${this.__label}]`;
    sup.appendChild(a);
    return { element: sup };
  }

  getFootnoteId(): string { return this.__footnoteId; }
  getLabel(): string { return this.__label; }

  setLabel(label: string): void {
    const self = this.getWritable();
    self.__label = label;
  }

  decorate(): ReactNode {
    const FootnoteRefComponent = require('@/components/admin/lexical/blocks/FootnoteRefComponent').default;
    return <FootnoteRefComponent nodeKey={this.__key} label={this.__label} />;
  }

  isInline(): true {
    return true;
  }
}

export function $createFootnoteRefNode(footnoteId: string, label: string): FootnoteRefNode {
  return new FootnoteRefNode(footnoteId, label);
}

export function $isFootnoteRefNode(node: LexicalNode | null | undefined): node is FootnoteRefNode {
  return node instanceof FootnoteRefNode;
}
