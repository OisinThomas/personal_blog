import {
  ElementNode,
  DOMConversionMap,
  LexicalNode,
  NodeKey,
  SerializedElementNode,
  RangeSelection,
  DOMExportOutput,
} from 'lexical';

export type SerializedToggleTitleNode = SerializedElementNode;

export class ToggleTitleNode extends ElementNode {
  static getType(): string {
    return 'toggle-title';
  }

  static clone(node: ToggleTitleNode): ToggleTitleNode {
    return new ToggleTitleNode(node.__key);
  }

  constructor(key?: NodeKey) {
    super(key);
  }

  static importDOM(): DOMConversionMap | null {
    return null;
  }

  static importJSON(_serializedNode: SerializedToggleTitleNode): ToggleTitleNode {
    return new ToggleTitleNode();
  }

  exportJSON(): SerializedToggleTitleNode {
    return {
      ...super.exportJSON(),
      type: 'toggle-title',
      version: 1,
    };
  }

  createDOM(): HTMLElement {
    const summary = document.createElement('summary');
    summary.className = 'lexical-toggle-title';
    return summary;
  }

  updateDOM(): boolean {
    return false;
  }

  exportDOM(): DOMExportOutput {
    const summary = document.createElement('summary');
    return { element: summary };
  }

  insertNewAfter(_selection: RangeSelection, _restoreSelection?: boolean): null {
    // Don't allow creating new paragraphs inside summary
    return null;
  }

  collapseAtStart(): true {
    return true;
  }
}

export function $createToggleTitleNode(): ToggleTitleNode {
  return new ToggleTitleNode();
}

export function $isToggleTitleNode(node: LexicalNode | null | undefined): node is ToggleTitleNode {
  return node instanceof ToggleTitleNode;
}
