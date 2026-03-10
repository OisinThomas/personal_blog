import {
  ElementNode,
  DOMConversionMap,
  LexicalNode,
  NodeKey,
  SerializedElementNode,
  Spread,
  $createParagraphNode,
  RangeSelection,
  DOMExportOutput,
} from 'lexical';

export type CalloutVariant = 'info' | 'warning' | 'success' | 'error' | 'note';

export type SerializedCalloutNode = Spread<
  { variant: CalloutVariant },
  SerializedElementNode
>;

export class CalloutNode extends ElementNode {
  __variant: CalloutVariant;

  static getType(): string {
    return 'callout';
  }

  static clone(node: CalloutNode): CalloutNode {
    return new CalloutNode(node.__variant, node.__key);
  }

  constructor(variant: CalloutVariant = 'note', key?: NodeKey) {
    super(key);
    this.__variant = variant;
  }

  static importDOM(): DOMConversionMap | null {
    return null;
  }

  static importJSON(serializedNode: SerializedCalloutNode): CalloutNode {
    const node = new CalloutNode(serializedNode.variant);
    return node;
  }

  exportJSON(): SerializedCalloutNode {
    return {
      ...super.exportJSON(),
      type: 'callout',
      version: 1,
      variant: this.__variant,
    };
  }

  createDOM(): HTMLElement {
    const div = document.createElement('div');
    div.className = `lexical-callout lexical-callout-${this.__variant}`;
    return div;
  }

  updateDOM(prevNode: CalloutNode, dom: HTMLElement): boolean {
    if (prevNode.__variant !== this.__variant) {
      dom.className = `lexical-callout lexical-callout-${this.__variant}`;
      return false;
    }
    return false;
  }

  exportDOM(): DOMExportOutput {
    const div = document.createElement('div');
    div.className = `callout callout-${this.__variant}`;
    return { element: div };
  }

  getVariant(): CalloutVariant {
    return this.__variant;
  }

  setVariant(variant: CalloutVariant): void {
    const self = this.getWritable();
    self.__variant = variant;
  }

  insertNewAfter(selection: RangeSelection, restoreSelection?: boolean): null | ElementNode {
    const newBlock = $createParagraphNode();
    const direction = this.getDirection();
    newBlock.setDirection(direction);
    this.insertAfter(newBlock, restoreSelection);
    return newBlock;
  }

  canIndent(): false {
    return false;
  }
}

export function $createCalloutNode(variant: CalloutVariant = 'note'): CalloutNode {
  return new CalloutNode(variant);
}

export function $isCalloutNode(node: LexicalNode | null | undefined): node is CalloutNode {
  return node instanceof CalloutNode;
}
