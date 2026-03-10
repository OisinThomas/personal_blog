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

export type SerializedBilingualNode = Spread<
  {
    languages: string[];
    content: Record<string, string>;
  },
  SerializedLexicalNode
>;

export class BilingualNode extends DecoratorNode<ReactNode> {
  __languages: string[];
  __content: Record<string, string>;

  static getType(): string {
    return 'bilingual';
  }

  static clone(node: BilingualNode): BilingualNode {
    return new BilingualNode(
      [...node.__languages],
      { ...node.__content },
      node.__key
    );
  }

  constructor(
    languages: string[] = ['en', 'ga'],
    content: Record<string, string> = { en: '', ga: '' },
    key?: NodeKey
  ) {
    super(key);
    this.__languages = languages;
    this.__content = content;
  }

  static importDOM(): DOMConversionMap | null {
    return null;
  }

  static importJSON(serializedNode: SerializedBilingualNode): BilingualNode {
    return new BilingualNode(serializedNode.languages, serializedNode.content);
  }

  exportJSON(): SerializedBilingualNode {
    return {
      type: 'bilingual',
      version: 1,
      languages: this.__languages,
      content: this.__content,
    };
  }

  createDOM(): HTMLElement {
    const div = document.createElement('div');
    div.className = 'lexical-bilingual-wrapper';
    return div;
  }

  updateDOM(): false {
    return false;
  }

  exportDOM(): DOMExportOutput {
    const div = document.createElement('div');
    div.setAttribute('data-bilingual', 'true');
    this.__languages.forEach(lang => {
      const section = document.createElement('div');
      section.setAttribute('data-lang', lang);
      section.textContent = this.__content[lang] ?? '';
      div.appendChild(section);
    });
    return { element: div };
  }

  getLanguages(): string[] { return this.__languages; }
  getContent(): Record<string, string> { return this.__content; }

  setLanguages(languages: string[]): void {
    const self = this.getWritable();
    self.__languages = languages;
  }
  setContent(content: Record<string, string>): void {
    const self = this.getWritable();
    self.__content = content;
  }

  decorate(): ReactNode {
    const BilingualNodeComponent = require('@/components/admin/lexical/blocks/BilingualNodeComponent').default;
    return <BilingualNodeComponent nodeKey={this.__key} />;
  }

  isInline(): false {
    return false;
  }
}

export function $createBilingualNode(payload: {
  languages?: string[];
  content?: Record<string, string>;
} = {}): BilingualNode {
  const langs = payload.languages ?? ['en', 'ga'];
  const content: Record<string, string> = payload.content ?? {};
  langs.forEach(l => {
    if (!(l in content)) content[l] = '';
  });
  return new BilingualNode(langs, content);
}

export function $isBilingualNode(node: LexicalNode | null | undefined): node is BilingualNode {
  return node instanceof BilingualNode;
}
