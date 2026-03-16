import {
  ElementNode,
  LexicalNode,
  NodeKey,
  SerializedElementNode,
  Spread,
  DOMConversionMap,
  DOMExportOutput,
  RangeSelection,
  $createParagraphNode,
} from 'lexical';

export type SerializedSuggestionMarkNode = Spread<
  {
    suggestionId: string;
    suggestedText: string;
    author: string;
    createdAt: number;
    threadId?: string;
  },
  SerializedElementNode
>;

export class SuggestionMarkNode extends ElementNode {
  __suggestionId: string;
  __suggestedText: string;
  __author: string;
  __createdAt: number;
  __threadId?: string;

  static getType(): string {
    return 'suggestion-mark';
  }

  static clone(node: SuggestionMarkNode): SuggestionMarkNode {
    return new SuggestionMarkNode(
      node.__suggestionId,
      node.__suggestedText,
      node.__author,
      node.__createdAt,
      node.__threadId,
      node.__key
    );
  }

  constructor(
    suggestionId: string,
    suggestedText: string,
    author: string = 'ai',
    createdAt?: number,
    threadId?: string,
    key?: NodeKey
  ) {
    super(key);
    this.__suggestionId = suggestionId;
    this.__suggestedText = suggestedText;
    this.__author = author;
    this.__createdAt = createdAt ?? Date.now();
    this.__threadId = threadId;
  }

  static importDOM(): DOMConversionMap | null {
    return null;
  }

  static importJSON(serializedNode: SerializedSuggestionMarkNode): SuggestionMarkNode {
    const node = new SuggestionMarkNode(
      serializedNode.suggestionId,
      serializedNode.suggestedText,
      serializedNode.author,
      serializedNode.createdAt,
      serializedNode.threadId
    );
    node.setFormat(serializedNode.format);
    return node;
  }

  exportJSON(): SerializedSuggestionMarkNode {
    return {
      ...super.exportJSON(),
      type: 'suggestion-mark',
      version: 1,
      suggestionId: this.__suggestionId,
      suggestedText: this.__suggestedText,
      author: this.__author,
      createdAt: this.__createdAt,
      threadId: this.__threadId,
    };
  }

  createDOM(): HTMLElement {
    const mark = document.createElement('mark');
    mark.className = 'lexical-suggestion-mark';
    mark.dataset.suggestionId = this.__suggestionId;
    mark.dataset.suggestedText = this.__suggestedText;
    return mark;
  }

  updateDOM(prevNode: SuggestionMarkNode, dom: HTMLElement): boolean {
    if (prevNode.__suggestionId !== this.__suggestionId) {
      dom.dataset.suggestionId = this.__suggestionId;
    }
    if (prevNode.__suggestedText !== this.__suggestedText) {
      dom.dataset.suggestedText = this.__suggestedText;
    }
    return false;
  }

  exportDOM(): DOMExportOutput {
    const mark = document.createElement('mark');
    mark.className = 'suggestion-mark';
    return { element: mark };
  }

  isInline(): true {
    return true;
  }

  canInsertTextBefore(): boolean {
    return false;
  }

  canInsertTextAfter(): boolean {
    return false;
  }

  canBeEmpty(): boolean {
    return true;
  }

  insertNewAfter(selection: RangeSelection, restoreSelection?: boolean): null | ElementNode {
    const newBlock = $createParagraphNode();
    this.getParentOrThrow().insertAfter(newBlock, restoreSelection);
    return newBlock;
  }

  getSuggestionId(): string {
    return this.getLatest().__suggestionId;
  }

  getSuggestedText(): string {
    return this.getLatest().__suggestedText;
  }

  getAuthor(): string {
    return this.getLatest().__author;
  }

  getCreatedAt(): number {
    return this.getLatest().__createdAt;
  }

  getThreadId(): string | undefined {
    return this.getLatest().__threadId;
  }
}

export function $createSuggestionMarkNode(payload: {
  suggestionId: string;
  suggestedText: string;
  author?: string;
  createdAt?: number;
  threadId?: string;
}): SuggestionMarkNode {
  return new SuggestionMarkNode(
    payload.suggestionId,
    payload.suggestedText,
    payload.author ?? 'ai',
    payload.createdAt,
    payload.threadId
  );
}

export function $isSuggestionMarkNode(node: LexicalNode | null | undefined): node is SuggestionMarkNode {
  return node instanceof SuggestionMarkNode;
}

/**
 * Unwrap a SuggestionMarkNode — its children flow back into the parent.
 */
export function $unwrapSuggestionMarkNode(node: SuggestionMarkNode): void {
  const children = node.getChildren();
  for (const child of children) {
    node.insertBefore(child);
  }
  node.remove();
}
