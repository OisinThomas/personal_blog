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

export type SerializedInteractiveNode = Spread<
  {
    componentSlug: string;
    props: Record<string, unknown>;
  },
  SerializedLexicalNode
>;

export class InteractiveNode extends DecoratorNode<ReactNode> {
  __componentSlug: string;
  __props: Record<string, unknown>;

  static getType(): string {
    return 'interactive';
  }

  static clone(node: InteractiveNode): InteractiveNode {
    return new InteractiveNode(node.__componentSlug, { ...node.__props }, node.__key);
  }

  constructor(componentSlug: string = '', props: Record<string, unknown> = {}, key?: NodeKey) {
    super(key);
    this.__componentSlug = componentSlug;
    this.__props = props;
  }

  static importDOM(): DOMConversionMap | null {
    return null;
  }

  static importJSON(serializedNode: SerializedInteractiveNode): InteractiveNode {
    return new InteractiveNode(serializedNode.componentSlug, serializedNode.props);
  }

  exportJSON(): SerializedInteractiveNode {
    return {
      type: 'interactive',
      version: 1,
      componentSlug: this.__componentSlug,
      props: this.__props,
    };
  }

  createDOM(): HTMLElement {
    const div = document.createElement('div');
    div.className = 'lexical-interactive-wrapper';
    return div;
  }

  updateDOM(): false {
    return false;
  }

  exportDOM(): DOMExportOutput {
    const div = document.createElement('div');
    div.setAttribute('data-component', this.__componentSlug);
    div.setAttribute('data-props', JSON.stringify(this.__props));
    return { element: div };
  }

  getComponentSlug(): string { return this.__componentSlug; }
  getProps(): Record<string, unknown> { return this.__props; }

  setComponentSlug(slug: string): void {
    const self = this.getWritable();
    self.__componentSlug = slug;
  }
  setProps(props: Record<string, unknown>): void {
    const self = this.getWritable();
    self.__props = props;
  }

  decorate(): ReactNode {
    return (
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 my-2">
        <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
          Interactive: {this.__componentSlug || '(none)'}
        </div>
        <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
          Props: {JSON.stringify(this.__props)}
        </div>
      </div>
    );
  }

  isInline(): false {
    return false;
  }
}

export function $createInteractiveNode(payload: {
  componentSlug?: string;
  props?: Record<string, unknown>;
} = {}): InteractiveNode {
  return new InteractiveNode(payload.componentSlug ?? '', payload.props ?? {});
}

export function $isInteractiveNode(node: LexicalNode | null | undefined): node is InteractiveNode {
  return node instanceof InteractiveNode;
}
