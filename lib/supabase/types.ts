// Database types for Supabase
// These match the schema defined in supabase/migrations/

export type NodeType = 'markdown' | 'image' | 'video' | 'embed' | 'interactive' | 'code' | 'divider';
export type PostStatus = 'draft' | 'published' | 'archived';
export type MajorTag = 'Thoughts' | 'Tinkering' | 'Translations';
export type Language = 'en' | 'ga';

export interface Asset {
  id: string;
  storage_path: string;
  bucket: string;
  filename: string;
  mime_type: string;
  file_size: number;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  caption: string | null;
  created_at: string;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  major_tag: MajorTag;
  sub_tag: string | null;
  language: Language;
  tags: string[];
  author: string;
  status: PostStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  featured_image_id: string | null;
  source: string | null;
  source_url: string | null;
}

export interface PostWithAsset extends Post {
  featured_image: Asset | null;
}

export interface Node {
  id: string;
  post_id: string;
  type: NodeType;
  position: number;
  content: string | null;
  metadata: NodeMetadata;
  asset_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface NodeWithAsset extends Node {
  asset: Asset | null;
}

// Metadata types for different node types
export interface BaseNodeMetadata {
  [key: string]: unknown;
}

export interface ImageNodeMetadata extends BaseNodeMetadata {
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface VideoNodeMetadata extends BaseNodeMetadata {
  provider?: 'youtube' | 'vimeo' | 'self-hosted';
  videoId?: string;
  autoplay?: boolean;
  loop?: boolean;
}

export interface EmbedNodeMetadata extends BaseNodeMetadata {
  provider?: string;
  url?: string;
  html?: string;
}

export interface CodeNodeMetadata extends BaseNodeMetadata {
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
}

export interface InteractiveNodeMetadata extends BaseNodeMetadata {
  componentSlug: string;
  props?: Record<string, unknown>;
}

export type NodeMetadata =
  | ImageNodeMetadata
  | VideoNodeMetadata
  | EmbedNodeMetadata
  | CodeNodeMetadata
  | InteractiveNodeMetadata
  | BaseNodeMetadata;

export interface InteractiveComponent {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  component_path: string;
  default_props: Record<string, unknown>;
  available: boolean;
  created_at: string;
}

// Input types for creating/updating
export interface CreatePostInput {
  slug: string;
  title: string;
  description?: string;
  major_tag: MajorTag;
  sub_tag?: string;
  language?: Language;
  tags?: string[];
  author?: string;
  status?: PostStatus;
  published_at?: string;
  featured_image_id?: string;
  source?: string;
  source_url?: string;
}

export interface UpdatePostInput extends Partial<CreatePostInput> {
  id: string;
}

export interface CreateNodeInput {
  post_id: string;
  type: NodeType;
  position: number;
  content?: string;
  metadata?: NodeMetadata;
  asset_id?: string;
}

export interface UpdateNodeInput extends Partial<Omit<CreateNodeInput, 'post_id'>> {
  id: string;
}

export interface CreateAssetInput {
  storage_path: string;
  bucket?: string;
  filename: string;
  mime_type: string;
  file_size: number;
  width?: number;
  height?: number;
  alt_text?: string;
  caption?: string;
}

// Database type for Supabase client
export interface Database {
  public: {
    Tables: {
      posts: {
        Row: Post;
        Insert: CreatePostInput;
        Update: Partial<CreatePostInput>;
      };
      nodes: {
        Row: Node;
        Insert: CreateNodeInput;
        Update: Partial<Omit<CreateNodeInput, 'post_id'>>;
      };
      assets: {
        Row: Asset;
        Insert: CreateAssetInput;
        Update: Partial<CreateAssetInput>;
      };
      interactive_components: {
        Row: InteractiveComponent;
        Insert: Omit<InteractiveComponent, 'id' | 'created_at'>;
        Update: Partial<Omit<InteractiveComponent, 'id' | 'created_at'>>;
      };
    };
    Enums: {
      node_type: NodeType;
    };
  };
}
