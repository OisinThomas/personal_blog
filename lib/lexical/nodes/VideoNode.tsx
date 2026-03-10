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

export type SerializedVideoNode = Spread<
  {
    provider: string;
    videoId: string;
    caption: string;
  },
  SerializedLexicalNode
>;

export class VideoNode extends DecoratorNode<ReactNode> {
  __provider: string;
  __videoId: string;
  __caption: string;

  static getType(): string {
    return 'video';
  }

  static clone(node: VideoNode): VideoNode {
    return new VideoNode(node.__provider, node.__videoId, node.__caption, node.__key);
  }

  constructor(provider: string = '', videoId: string = '', caption: string = '', key?: NodeKey) {
    super(key);
    this.__provider = provider;
    this.__videoId = videoId;
    this.__caption = caption;
  }

  static importDOM(): DOMConversionMap | null {
    return null;
  }

  static importJSON(serializedNode: SerializedVideoNode): VideoNode {
    return new VideoNode(
      serializedNode.provider,
      serializedNode.videoId,
      serializedNode.caption
    );
  }

  exportJSON(): SerializedVideoNode {
    return {
      type: 'video',
      version: 1,
      provider: this.__provider,
      videoId: this.__videoId,
      caption: this.__caption,
    };
  }

  createDOM(): HTMLElement {
    const div = document.createElement('div');
    div.className = 'lexical-video-wrapper';
    return div;
  }

  updateDOM(): false {
    return false;
  }

  exportDOM(): DOMExportOutput {
    const div = document.createElement('div');
    const iframe = document.createElement('iframe');
    if (this.__provider === 'youtube') {
      iframe.src = `https://www.youtube.com/embed/${this.__videoId}`;
    } else if (this.__provider === 'vimeo') {
      iframe.src = `https://player.vimeo.com/video/${this.__videoId}`;
    }
    div.appendChild(iframe);
    return { element: div };
  }

  getProvider(): string { return this.__provider; }
  getVideoId(): string { return this.__videoId; }
  getCaption(): string { return this.__caption; }

  setProvider(provider: string): void {
    const self = this.getWritable();
    self.__provider = provider;
  }
  setVideoId(videoId: string): void {
    const self = this.getWritable();
    self.__videoId = videoId;
  }
  setCaption(caption: string): void {
    const self = this.getWritable();
    self.__caption = caption;
  }

  decorate(): ReactNode {
    const VideoNodeComponent = require('@/components/admin/lexical/blocks/VideoNodeComponent').default;
    return <VideoNodeComponent nodeKey={this.__key} />;
  }

  isInline(): false {
    return false;
  }
}

export function $createVideoNode(payload: {
  provider?: string;
  videoId?: string;
  caption?: string;
} = {}): VideoNode {
  return new VideoNode(
    payload.provider ?? '',
    payload.videoId ?? '',
    payload.caption ?? ''
  );
}

export function $isVideoNode(node: LexicalNode | null | undefined): node is VideoNode {
  return node instanceof VideoNode;
}
