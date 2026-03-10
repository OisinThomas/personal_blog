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

export type SerializedEmbedNode = Spread<
  {
    url: string;
    html: string;
    provider: string;
  },
  SerializedLexicalNode
>;

export class EmbedNode extends DecoratorNode<ReactNode> {
  __url: string;
  __html: string;
  __provider: string;

  static getType(): string {
    return 'embed';
  }

  static clone(node: EmbedNode): EmbedNode {
    return new EmbedNode(node.__url, node.__html, node.__provider, node.__key);
  }

  constructor(url: string = '', html: string = '', provider: string = '', key?: NodeKey) {
    super(key);
    this.__url = url;
    this.__html = html;
    this.__provider = provider;
  }

  static importDOM(): DOMConversionMap | null {
    return null;
  }

  static importJSON(serializedNode: SerializedEmbedNode): EmbedNode {
    return new EmbedNode(serializedNode.url, serializedNode.html, serializedNode.provider);
  }

  exportJSON(): SerializedEmbedNode {
    return {
      type: 'embed',
      version: 1,
      url: this.__url,
      html: this.__html,
      provider: this.__provider,
    };
  }

  createDOM(): HTMLElement {
    const div = document.createElement('div');
    div.className = 'lexical-embed-wrapper';
    return div;
  }

  updateDOM(): false {
    return false;
  }

  exportDOM(): DOMExportOutput {
    const div = document.createElement('div');
    if (this.__html) {
      div.innerHTML = this.__html;
    }
    return { element: div };
  }

  getUrl(): string { return this.__url; }
  getHtml(): string { return this.__html; }
  getProvider(): string { return this.__provider; }

  setUrl(url: string): void {
    const self = this.getWritable();
    self.__url = url;
  }
  setHtml(html: string): void {
    const self = this.getWritable();
    self.__html = html;
  }
  setProvider(provider: string): void {
    const self = this.getWritable();
    self.__provider = provider;
  }

  decorate(): ReactNode {
    const EmbedNodeComponent = require('@/components/admin/lexical/blocks/EmbedNodeComponent').default;
    return <EmbedNodeComponent nodeKey={this.__key} />;
  }

  isInline(): false {
    return false;
  }
}

export function $createEmbedNode(payload: {
  url?: string;
  html?: string;
  provider?: string;
} = {}): EmbedNode {
  return new EmbedNode(payload.url ?? '', payload.html ?? '', payload.provider ?? '');
}

export function $isEmbedNode(node: LexicalNode | null | undefined): node is EmbedNode {
  return node instanceof EmbedNode;
}
