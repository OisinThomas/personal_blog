import {
  DecoratorNode,
  DOMConversionMap,
  DOMExportOutput,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical';
import { ReactNode } from 'react';

export type SuggestionBlockType = 'block-replacement' | 'block-deletion';

export type SerializedSuggestionBlockNode = Spread<
  {
    suggestionId: string;
    suggestionType: SuggestionBlockType;
    originalBlockJSON: string;
    suggestedMarkdown: string;
    reason?: string;
    author: string;
    createdAt: number;
    threadId?: string;
  },
  SerializedLexicalNode
>;

export class SuggestionBlockNode extends DecoratorNode<ReactNode> {
  __suggestionId: string;
  __suggestionType: SuggestionBlockType;
  __originalBlockJSON: string;
  __suggestedMarkdown: string;
  __reason?: string;
  __author: string;
  __createdAt: number;
  __threadId?: string;

  static getType(): string {
    return 'suggestion-block';
  }

  static clone(node: SuggestionBlockNode): SuggestionBlockNode {
    return new SuggestionBlockNode(
      node.__suggestionId,
      node.__suggestionType,
      node.__originalBlockJSON,
      node.__suggestedMarkdown,
      node.__reason,
      node.__author,
      node.__createdAt,
      node.__threadId,
      node.__key
    );
  }

  constructor(
    suggestionId: string,
    suggestionType: SuggestionBlockType,
    originalBlockJSON: string,
    suggestedMarkdown: string,
    reason?: string,
    author: string = 'ai',
    createdAt?: number,
    threadId?: string,
    key?: NodeKey
  ) {
    super(key);
    this.__suggestionId = suggestionId;
    this.__suggestionType = suggestionType;
    this.__originalBlockJSON = originalBlockJSON;
    this.__suggestedMarkdown = suggestedMarkdown;
    this.__reason = reason;
    this.__author = author;
    this.__createdAt = createdAt ?? Date.now();
    this.__threadId = threadId;
  }

  static importDOM(): DOMConversionMap | null {
    return null;
  }

  static importJSON(serializedNode: SerializedSuggestionBlockNode): SuggestionBlockNode {
    return new SuggestionBlockNode(
      serializedNode.suggestionId,
      serializedNode.suggestionType,
      serializedNode.originalBlockJSON,
      serializedNode.suggestedMarkdown,
      serializedNode.reason,
      serializedNode.author,
      serializedNode.createdAt,
      serializedNode.threadId
    );
  }

  exportJSON(): SerializedSuggestionBlockNode {
    return {
      type: 'suggestion-block',
      version: 1,
      suggestionId: this.__suggestionId,
      suggestionType: this.__suggestionType,
      originalBlockJSON: this.__originalBlockJSON,
      suggestedMarkdown: this.__suggestedMarkdown,
      reason: this.__reason,
      author: this.__author,
      createdAt: this.__createdAt,
      threadId: this.__threadId,
    };
  }

  createDOM(): HTMLElement {
    const div = document.createElement('div');
    div.className = 'lexical-suggestion-block-wrapper';
    return div;
  }

  updateDOM(): false {
    return false;
  }

  exportDOM(): DOMExportOutput {
    const div = document.createElement('div');
    div.className = 'suggestion-block';
    return { element: div };
  }

  isInline(): false {
    return false;
  }

  decorate(): ReactNode {
    const SuggestionBlockComponent = require('@/components/admin/lexical/blocks/SuggestionBlockComponent').default;
    return (
      <SuggestionBlockComponent
        nodeKey={this.__key}
        suggestionType={this.getSuggestionType()}
        originalBlockJSON={this.getOriginalBlockJSON()}
        suggestedMarkdown={this.getSuggestedMarkdown()}
        reason={this.getReason()}
        author={this.getAuthor()}
      />
    );
  }

  getSuggestionId(): string {
    return this.getLatest().__suggestionId;
  }

  getSuggestionType(): SuggestionBlockType {
    return this.getLatest().__suggestionType;
  }

  getOriginalBlockJSON(): string {
    return this.getLatest().__originalBlockJSON;
  }

  getSuggestedMarkdown(): string {
    return this.getLatest().__suggestedMarkdown;
  }

  getReason(): string | undefined {
    return this.getLatest().__reason;
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

export function $createSuggestionBlockNode(payload: {
  suggestionId: string;
  suggestionType: SuggestionBlockType;
  originalBlockJSON: string;
  suggestedMarkdown: string;
  reason?: string;
  author?: string;
  createdAt?: number;
  threadId?: string;
}): SuggestionBlockNode {
  return new SuggestionBlockNode(
    payload.suggestionId,
    payload.suggestionType,
    payload.originalBlockJSON,
    payload.suggestedMarkdown,
    payload.reason,
    payload.author ?? 'ai',
    payload.createdAt
  );
}

export function $isSuggestionBlockNode(node: LexicalNode | null | undefined): node is SuggestionBlockNode {
  return node instanceof SuggestionBlockNode;
}
