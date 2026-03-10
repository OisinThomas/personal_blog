import {
  ElementNode,
  DOMConversionMap,
  LexicalNode,
  NodeKey,
  SerializedElementNode,
  Spread,
  DOMExportOutput,
} from 'lexical';

export type SerializedToggleContainerNode = Spread<
  { open: boolean },
  SerializedElementNode
>;

export class ToggleContainerNode extends ElementNode {
  __open: boolean;

  static getType(): string {
    return 'toggle-container';
  }

  static clone(node: ToggleContainerNode): ToggleContainerNode {
    return new ToggleContainerNode(node.__open, node.__key);
  }

  constructor(open: boolean = false, key?: NodeKey) {
    super(key);
    this.__open = open;
  }

  static importDOM(): DOMConversionMap | null {
    return null;
  }

  static importJSON(serializedNode: SerializedToggleContainerNode): ToggleContainerNode {
    return new ToggleContainerNode(serializedNode.open);
  }

  exportJSON(): SerializedToggleContainerNode {
    return {
      ...super.exportJSON(),
      type: 'toggle-container',
      version: 1,
      open: this.__open,
    };
  }

  createDOM(): HTMLElement {
    const details = document.createElement('details');
    details.className = 'lexical-toggle-container';
    if (this.__open) {
      details.setAttribute('open', '');
    }
    details.addEventListener('toggle', () => {
      // Sync the open state
      const isOpen = details.open;
      if (isOpen !== this.__open) {
        // We don't update Lexical state from DOM events in createDOM
        // This is handled by the editor
      }
    });
    return details;
  }

  updateDOM(prevNode: ToggleContainerNode, dom: HTMLDetailsElement): boolean {
    if (prevNode.__open !== this.__open) {
      if (this.__open) {
        dom.setAttribute('open', '');
      } else {
        dom.removeAttribute('open');
      }
    }
    return false;
  }

  exportDOM(): DOMExportOutput {
    const details = document.createElement('details');
    if (this.__open) {
      details.setAttribute('open', '');
    }
    return { element: details };
  }

  getOpen(): boolean {
    return this.__open;
  }

  setOpen(open: boolean): void {
    const self = this.getWritable();
    self.__open = open;
  }

  toggleOpen(): void {
    this.setOpen(!this.__open);
  }

  canIndent(): false {
    return false;
  }
}

export function $createToggleContainerNode(open: boolean = false): ToggleContainerNode {
  return new ToggleContainerNode(open);
}

export function $isToggleContainerNode(node: LexicalNode | null | undefined): node is ToggleContainerNode {
  return node instanceof ToggleContainerNode;
}
