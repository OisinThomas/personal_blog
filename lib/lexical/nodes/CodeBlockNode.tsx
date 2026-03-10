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

export type SerializedCodeBlockNode = Spread<
  {
    code: string;
    language: string;
    filename: string;
  },
  SerializedLexicalNode
>;

export class CodeBlockNode extends DecoratorNode<ReactNode> {
  __code: string;
  __language: string;
  __filename: string;

  static getType(): string {
    return 'codeblock';
  }

  static clone(node: CodeBlockNode): CodeBlockNode {
    return new CodeBlockNode(node.__code, node.__language, node.__filename, node.__key);
  }

  constructor(code: string = '', language: string = '', filename: string = '', key?: NodeKey) {
    super(key);
    this.__code = code;
    this.__language = language;
    this.__filename = filename;
  }

  static importDOM(): DOMConversionMap | null {
    return null;
  }

  static importJSON(serializedNode: SerializedCodeBlockNode): CodeBlockNode {
    return $createCodeBlockNode({
      code: serializedNode.code,
      language: serializedNode.language,
      filename: serializedNode.filename,
    });
  }

  exportJSON(): SerializedCodeBlockNode {
    return {
      type: 'codeblock',
      version: 1,
      code: this.__code,
      language: this.__language,
      filename: this.__filename,
    };
  }

  createDOM(): HTMLElement {
    const div = document.createElement('div');
    div.className = 'lexical-codeblock-wrapper';
    return div;
  }

  updateDOM(): false {
    return false;
  }

  exportDOM(): DOMExportOutput {
    const pre = document.createElement('pre');
    const code = document.createElement('code');
    if (this.__language) {
      code.className = `language-${this.__language}`;
    }
    code.textContent = this.__code;
    pre.appendChild(code);
    return { element: pre };
  }

  getCode(): string { return this.__code; }
  getLanguage(): string { return this.__language; }
  getFilename(): string { return this.__filename; }

  setCode(code: string): void {
    const self = this.getWritable();
    self.__code = code;
  }
  setLanguage(language: string): void {
    const self = this.getWritable();
    self.__language = language;
  }
  setFilename(filename: string): void {
    const self = this.getWritable();
    self.__filename = filename;
  }

  decorate(): ReactNode {
    const CodeBlockNodeComponent = require('@/components/admin/lexical/blocks/CodeBlockNodeComponent').default;
    return <CodeBlockNodeComponent nodeKey={this.__key} />;
  }

  isInline(): false {
    return false;
  }
}

export function $createCodeBlockNode(payload: {
  code?: string;
  language?: string;
  filename?: string;
} = {}): CodeBlockNode {
  return new CodeBlockNode(
    payload.code ?? '',
    payload.language ?? '',
    payload.filename ?? ''
  );
}

export function $isCodeBlockNode(node: LexicalNode | null | undefined): node is CodeBlockNode {
  return node instanceof CodeBlockNode;
}
