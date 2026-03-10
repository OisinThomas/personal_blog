import {
  ElementNode,
  DOMConversionMap,
  LexicalNode,
  NodeKey,
  SerializedElementNode,
  DOMExportOutput,
} from 'lexical';

export type SerializedToggleContentNode = SerializedElementNode;

export class ToggleContentNode extends ElementNode {
  static getType(): string {
    return 'toggle-content';
  }

  static clone(node: ToggleContentNode): ToggleContentNode {
    return new ToggleContentNode(node.__key);
  }

  constructor(key?: NodeKey) {
    super(key);
  }

  static importDOM(): DOMConversionMap | null {
    return null;
  }

  static importJSON(_serializedNode: SerializedToggleContentNode): ToggleContentNode {
    return new ToggleContentNode();
  }

  exportJSON(): SerializedToggleContentNode {
    return {
      ...super.exportJSON(),
      type: 'toggle-content',
      version: 1,
    };
  }

  createDOM(): HTMLElement {
    const div = document.createElement('div');
    div.className = 'lexical-toggle-content';
    return div;
  }

  updateDOM(): boolean {
    return false;
  }

  exportDOM(): DOMExportOutput {
    const div = document.createElement('div');
    return { element: div };
  }
}

export function $createToggleContentNode(): ToggleContentNode {
  return new ToggleContentNode();
}

export function $isToggleContentNode(node: LexicalNode | null | undefined): node is ToggleContentNode {
  return node instanceof ToggleContentNode;
}
