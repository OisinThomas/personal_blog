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

export type SerializedImageNode = Spread<
  {
    assetId: string;
    src: string;
    alt: string;
    caption: string;
    width: number;
    height: number;
  },
  SerializedLexicalNode
>;

export class ImageNode extends DecoratorNode<ReactNode> {
  __assetId: string;
  __src: string;
  __alt: string;
  __caption: string;
  __width: number;
  __height: number;

  static getType(): string {
    return 'image';
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      node.__assetId,
      node.__src,
      node.__alt,
      node.__caption,
      node.__width,
      node.__height,
      node.__key
    );
  }

  constructor(
    assetId: string = '',
    src: string = '',
    alt: string = '',
    caption: string = '',
    width: number = 0,
    height: number = 0,
    key?: NodeKey
  ) {
    super(key);
    this.__assetId = assetId;
    this.__src = src;
    this.__alt = alt;
    this.__caption = caption;
    this.__width = width;
    this.__height = height;
  }

  static importDOM(): DOMConversionMap | null {
    return null;
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    return $createImageNode({
      assetId: serializedNode.assetId,
      src: serializedNode.src,
      alt: serializedNode.alt,
      caption: serializedNode.caption,
      width: serializedNode.width,
      height: serializedNode.height,
    });
  }

  exportJSON(): SerializedImageNode {
    return {
      type: 'image',
      version: 1,
      assetId: this.__assetId,
      src: this.__src,
      alt: this.__alt,
      caption: this.__caption,
      width: this.__width,
      height: this.__height,
    };
  }

  createDOM(): HTMLElement {
    const div = document.createElement('div');
    div.className = 'lexical-image-wrapper';
    return div;
  }

  updateDOM(): false {
    return false;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('figure');
    if (this.__src) {
      const img = document.createElement('img');
      img.setAttribute('src', this.__src);
      img.setAttribute('alt', this.__alt);
      element.appendChild(img);
    }
    if (this.__caption) {
      const caption = document.createElement('figcaption');
      caption.textContent = this.__caption;
      element.appendChild(caption);
    }
    return { element };
  }

  getAssetId(): string { return this.__assetId; }
  getSrc(): string { return this.__src; }
  getAlt(): string { return this.__alt; }
  getCaption(): string { return this.__caption; }
  getWidth(): number { return this.__width; }
  getHeight(): number { return this.__height; }

  setAssetId(assetId: string): void {
    const self = this.getWritable();
    self.__assetId = assetId;
  }
  setSrc(src: string): void {
    const self = this.getWritable();
    self.__src = src;
  }
  setAlt(alt: string): void {
    const self = this.getWritable();
    self.__alt = alt;
  }
  setCaption(caption: string): void {
    const self = this.getWritable();
    self.__caption = caption;
  }
  setWidth(width: number): void {
    const self = this.getWritable();
    self.__width = width;
  }
  setHeight(height: number): void {
    const self = this.getWritable();
    self.__height = height;
  }

  decorate(): ReactNode {
    // Lazy import to avoid circular deps - component is resolved at render time
    const ImageNodeComponent = require('@/components/admin/lexical/blocks/ImageNodeComponent').default;
    return <ImageNodeComponent nodeKey={this.__key} />;
  }

  isInline(): false {
    return false;
  }
}

export function $createImageNode(payload: {
  assetId?: string;
  src?: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
}): ImageNode {
  return new ImageNode(
    payload.assetId ?? '',
    payload.src ?? '',
    payload.alt ?? '',
    payload.caption ?? '',
    payload.width ?? 0,
    payload.height ?? 0
  );
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode;
}
