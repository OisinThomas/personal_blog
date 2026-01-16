import type {
  Post,
  PostWithAsset,
  Node,
  NodeWithAsset,
  Asset,
  CreatePostInput,
  CreateNodeInput,
  NodeType,
  NodeMetadata,
  MajorTag,
  PostStatus,
} from '@/lib/supabase/types';

// Re-export for convenience
export type {
  Post,
  PostWithAsset,
  Node,
  NodeWithAsset,
  Asset,
  CreatePostInput,
  CreateNodeInput,
  NodeType,
  NodeMetadata,
  MajorTag,
  PostStatus,
};

// =============================================================================
// API Response Types
// =============================================================================

export interface ApiError {
  error: string;
  details?: unknown;
}

export interface ApiSuccess<T> {
  data: T;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// =============================================================================
// Posts API Types
// =============================================================================

export interface ListPostsQuery {
  status?: PostStatus;
  major_tag?: MajorTag;
  limit?: number;
}

export interface GetPostQuery {
  include_nodes?: boolean;
}

export interface CreatePostRequest extends CreatePostInput {}

export interface UpdatePostRequest extends Partial<Omit<CreatePostInput, 'slug'>> {}

export interface PostWithNodes extends PostWithAsset {
  nodes: NodeWithAsset[];
}

// =============================================================================
// Nodes API Types
// =============================================================================

export interface CreateNodeRequest {
  type: NodeType;
  content?: string;
  metadata?: NodeMetadata;
  asset_id?: string;
  position?: number;
}

export interface UpdateNodeRequest {
  type?: NodeType;
  content?: string;
  metadata?: NodeMetadata;
  asset_id?: string;
  position?: number;
}

export interface BulkReplaceNodesRequest {
  nodes: CreateNodeRequest[];
}

// =============================================================================
// Assets API Types
// =============================================================================

export interface UploadAssetResponse {
  asset: Asset;
  url: string;
}

export interface AssetWithUrl extends Asset {
  url: string;
}

// =============================================================================
// Transform API Types
// =============================================================================

export interface TransformQuery {
  apply?: boolean;
}

export interface TransformRequest {
  markdown: string;
}

export interface TransformedBlock {
  type: NodeType;
  content?: string;
  metadata?: NodeMetadata;
  sourceUrl?: string; // For images that will be uploaded
}

export interface TransformPreviewResponse {
  blocks: TransformedBlock[];
  summary: {
    totalBlocks: number;
    markdownBlocks: number;
    codeBlocks: number;
    imageBlocks: number;
    videoBlocks: number;
    imagesRequiringUpload: number;
  };
}

export interface TransformApplyResponse {
  nodes: NodeWithAsset[];
  assetsCreated: number;
}

// =============================================================================
// OpenAPI Schema Types
// =============================================================================

export interface OpenApiSchema {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
  };
  servers: Array<{
    url: string;
    description: string;
  }>;
  security: Array<Record<string, unknown[]>>;
  paths: Record<string, unknown>;
  components: {
    securitySchemes: Record<string, unknown>;
    schemas: Record<string, unknown>;
  };
}
