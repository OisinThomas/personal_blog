import { NextRequest } from 'next/server';
import { validateApiKey, jsonResponse } from '@/lib/api/auth';

const OPENAPI_SCHEMA = {
  openapi: '3.0.3',
  info: {
    title: 'Blog CMS API',
    version: '1.0.0',
    description: 'Programmatic API for managing blog posts, blocks, and assets. Designed for AI-assisted content management.',
  },
  servers: [
    {
      url: '/api/cms',
      description: 'CMS API',
    },
  ],
  security: [
    {
      ApiKeyAuth: [],
    },
  ],
  paths: {
    '/posts': {
      get: {
        summary: 'List all posts',
        description: 'Get a list of all posts with optional filtering by status and major_tag',
        parameters: [
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: ['draft', 'published', 'archived'] },
            description: 'Filter by post status',
          },
          {
            name: 'major_tag',
            in: 'query',
            schema: { type: 'string', enum: ['Thoughts', 'Tinkering', 'Translations'] },
            description: 'Filter by major tag category',
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer' },
            description: 'Maximum number of posts to return',
          },
        ],
        responses: {
          200: {
            description: 'List of posts',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/PostWithAsset' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Create a new post',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreatePostInput' },
            },
          },
        },
        responses: {
          201: {
            description: 'Post created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { $ref: '#/components/schemas/Post' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/posts/{slug}': {
      get: {
        summary: 'Get a post by slug',
        parameters: [
          {
            name: 'slug',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
          {
            name: 'include_nodes',
            in: 'query',
            schema: { type: 'boolean' },
            description: 'Include all blocks/nodes for this post',
          },
        ],
        responses: {
          200: {
            description: 'Post details',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { $ref: '#/components/schemas/PostWithNodes' },
                  },
                },
              },
            },
          },
        },
      },
      patch: {
        summary: 'Update a post',
        parameters: [
          {
            name: 'slug',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdatePostInput' },
            },
          },
        },
        responses: {
          200: {
            description: 'Post updated',
          },
        },
      },
      delete: {
        summary: 'Delete a post',
        parameters: [
          {
            name: 'slug',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Post deleted',
          },
        },
      },
    },
    '/posts/{slug}/nodes': {
      get: {
        summary: 'List all nodes for a post',
        parameters: [
          {
            name: 'slug',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'List of nodes',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/NodeWithAsset' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Add a node to a post',
        parameters: [
          {
            name: 'slug',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateNodeInput' },
            },
          },
        },
        responses: {
          201: {
            description: 'Node created',
          },
        },
      },
      put: {
        summary: 'Replace all nodes for a post (bulk update)',
        parameters: [
          {
            name: 'slug',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nodes: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/CreateNodeInput' },
                  },
                },
                required: ['nodes'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Nodes replaced',
          },
        },
      },
    },
    '/posts/{slug}/nodes/{nodeId}': {
      get: {
        summary: 'Get a specific node',
        parameters: [
          { name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'nodeId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: { description: 'Node details' },
        },
      },
      patch: {
        summary: 'Update a node',
        parameters: [
          { name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'nodeId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateNodeInput' },
            },
          },
        },
        responses: {
          200: { description: 'Node updated' },
        },
      },
      delete: {
        summary: 'Delete a node',
        parameters: [
          { name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'nodeId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: { description: 'Node deleted' },
        },
      },
    },
    '/posts/{slug}/transform': {
      post: {
        summary: 'Transform markdown into structured blocks',
        description: 'Parse markdown content and convert it into the block structure. Optionally apply the transformation immediately.',
        parameters: [
          { name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
          {
            name: 'apply',
            in: 'query',
            schema: { type: 'boolean' },
            description: 'If true, apply the transformation and replace existing nodes',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  markdown: {
                    type: 'string',
                    description: 'Markdown content to transform',
                  },
                },
                required: ['markdown'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Transformation result',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        blocks: { type: 'array', items: { $ref: '#/components/schemas/TransformedBlock' } },
                        summary: { $ref: '#/components/schemas/TransformSummary' },
                        nodes: { type: 'array', items: { $ref: '#/components/schemas/NodeWithAsset' } },
                        assetsCreated: { type: 'integer' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/assets/upload': {
      post: {
        summary: 'Upload an asset',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  file: { type: 'string', format: 'binary' },
                  alt_text: { type: 'string' },
                  caption: { type: 'string' },
                },
                required: ['file'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Asset uploaded',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        asset: { $ref: '#/components/schemas/Asset' },
                        url: { type: 'string', format: 'uri' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/assets/{assetId}': {
      get: {
        summary: 'Get asset details',
        parameters: [
          { name: 'assetId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: { description: 'Asset details' },
        },
      },
      delete: {
        summary: 'Delete an asset',
        parameters: [
          { name: 'assetId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: { description: 'Asset deleted' },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
        description: 'API key for authentication',
      },
    },
    schemas: {
      Post: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          slug: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string', nullable: true },
          major_tag: { type: 'string', enum: ['Thoughts', 'Tinkering', 'Translations'] },
          sub_tag: { type: 'string', nullable: true },
          language: { type: 'string', enum: ['en', 'ga'] },
          tags: { type: 'array', items: { type: 'string' } },
          author: { type: 'string' },
          status: { type: 'string', enum: ['draft', 'published', 'archived'] },
          published_at: { type: 'string', format: 'date-time', nullable: true },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
          featured_image_id: { type: 'string', format: 'uuid', nullable: true },
          source: { type: 'string', nullable: true },
          source_url: { type: 'string', nullable: true },
        },
      },
      PostWithAsset: {
        allOf: [
          { $ref: '#/components/schemas/Post' },
          {
            type: 'object',
            properties: {
              featured_image: { $ref: '#/components/schemas/Asset', nullable: true },
            },
          },
        ],
      },
      PostWithNodes: {
        allOf: [
          { $ref: '#/components/schemas/PostWithAsset' },
          {
            type: 'object',
            properties: {
              nodes: { type: 'array', items: { $ref: '#/components/schemas/NodeWithAsset' } },
            },
          },
        ],
      },
      CreatePostInput: {
        type: 'object',
        required: ['slug', 'title', 'major_tag'],
        properties: {
          slug: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          major_tag: { type: 'string', enum: ['Thoughts', 'Tinkering', 'Translations'] },
          sub_tag: { type: 'string' },
          language: { type: 'string', enum: ['en', 'ga'], default: 'en' },
          tags: { type: 'array', items: { type: 'string' } },
          author: { type: 'string' },
          status: { type: 'string', enum: ['draft', 'published', 'archived'], default: 'draft' },
          published_at: { type: 'string', format: 'date-time' },
          featured_image_id: { type: 'string', format: 'uuid' },
          source: { type: 'string' },
          source_url: { type: 'string' },
        },
      },
      UpdatePostInput: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          major_tag: { type: 'string', enum: ['Thoughts', 'Tinkering', 'Translations'] },
          sub_tag: { type: 'string' },
          language: { type: 'string', enum: ['en', 'ga'] },
          tags: { type: 'array', items: { type: 'string' } },
          author: { type: 'string' },
          status: { type: 'string', enum: ['draft', 'published', 'archived'] },
          published_at: { type: 'string', format: 'date-time' },
          featured_image_id: { type: 'string', format: 'uuid' },
          source: { type: 'string' },
          source_url: { type: 'string' },
        },
      },
      Node: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          post_id: { type: 'string', format: 'uuid' },
          type: { type: 'string', enum: ['markdown', 'image', 'video', 'embed', 'interactive', 'code', 'divider'] },
          position: { type: 'integer' },
          content: { type: 'string', nullable: true },
          metadata: { type: 'object' },
          asset_id: { type: 'string', format: 'uuid', nullable: true },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      NodeWithAsset: {
        allOf: [
          { $ref: '#/components/schemas/Node' },
          {
            type: 'object',
            properties: {
              asset: { $ref: '#/components/schemas/Asset', nullable: true },
            },
          },
        ],
      },
      CreateNodeInput: {
        type: 'object',
        required: ['type'],
        properties: {
          type: { type: 'string', enum: ['markdown', 'image', 'video', 'embed', 'interactive', 'code', 'divider'] },
          content: { type: 'string' },
          metadata: { type: 'object' },
          asset_id: { type: 'string', format: 'uuid' },
          position: { type: 'integer' },
        },
      },
      UpdateNodeInput: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['markdown', 'image', 'video', 'embed', 'interactive', 'code', 'divider'] },
          content: { type: 'string' },
          metadata: { type: 'object' },
          asset_id: { type: 'string', format: 'uuid' },
          position: { type: 'integer' },
        },
      },
      Asset: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          storage_path: { type: 'string' },
          bucket: { type: 'string' },
          filename: { type: 'string' },
          mime_type: { type: 'string' },
          file_size: { type: 'integer' },
          width: { type: 'integer', nullable: true },
          height: { type: 'integer', nullable: true },
          alt_text: { type: 'string', nullable: true },
          caption: { type: 'string', nullable: true },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      TransformedBlock: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['markdown', 'image', 'video', 'embed', 'interactive', 'code', 'divider'] },
          content: { type: 'string' },
          metadata: { type: 'object' },
          sourceUrl: { type: 'string', description: 'For remote images that need uploading' },
        },
      },
      TransformSummary: {
        type: 'object',
        properties: {
          totalBlocks: { type: 'integer' },
          markdownBlocks: { type: 'integer' },
          codeBlocks: { type: 'integer' },
          imageBlocks: { type: 'integer' },
          videoBlocks: { type: 'integer' },
          imagesRequiringUpload: { type: 'integer' },
        },
      },
    },
  },
};

/**
 * GET /api/cms/schema
 * Returns the OpenAPI schema for this API
 */
export async function GET(request: NextRequest) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  return jsonResponse(OPENAPI_SCHEMA);
}
