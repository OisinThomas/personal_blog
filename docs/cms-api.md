# CMS API Documentation

A REST API for programmatic management of blog posts, blocks, and assets. Designed for AI-assisted content workflows.

## Authentication

The CMS API uses an ephemeral token system with localhost restriction for security.

### Security Model

- **Localhost only**: The API only accepts requests from localhost (127.0.0.1, ::1)
- **Ephemeral token**: A new random token is generated on each server start
- **No configuration needed**: No environment variables required

### Getting Your Token

1. Start the development server: `npm run dev`
2. Find the token in the console output:
   ```
   🔑 CMS API Token (valid this session only):
      a1b2c3d4-e5f6-7890-abcd-ef1234567890
   ```

### Making Requests

```bash
# Use the token from console output
curl -H "X-API-Key: <token-from-console>" http://localhost:3000/api/cms/posts
```

### Important Notes

- The token changes every time you restart the server
- Remote requests are blocked (returns 403)
- For remote/production admin access, use the web admin at `/admin` with Supabase auth

---

## Endpoints Overview

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/cms/posts` | GET, POST | List and create posts |
| `/api/cms/posts/{slug}` | GET, PATCH, DELETE | Manage single post |
| `/api/cms/posts/{slug}/nodes` | GET, POST, PUT | Manage post blocks |
| `/api/cms/posts/{slug}/nodes/{id}` | GET, PATCH, DELETE | Manage single block |
| `/api/cms/posts/{slug}/transform` | POST | Transform markdown to blocks |
| `/api/cms/assets/upload` | POST | Upload file |
| `/api/cms/assets/{id}` | GET, DELETE | Manage asset |
| `/api/cms/schema` | GET | OpenAPI schema |

---

## Posts API

### List Posts

```bash
GET /api/cms/posts?status=published&major_tag=Thoughts&limit=10
```

**Query Parameters:**
- `status`: `draft` | `published` | `archived`
- `major_tag`: `Thoughts` | `Tinkering` | `Translations`
- `limit`: Maximum posts to return

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "slug": "my-post",
      "title": "My Post",
      "description": "A great post",
      "major_tag": "Thoughts",
      "status": "published",
      "published_at": "2024-01-15T10:00:00Z",
      "featured_image": { ... }
    }
  ]
}
```

### Create Post

```bash
POST /api/cms/posts
Content-Type: application/json

{
  "slug": "new-post",
  "title": "New Post Title",
  "description": "Post description",
  "major_tag": "Tinkering",
  "language": "en",
  "tags": ["typescript", "tutorial"],
  "status": "draft"
}
```

**Required fields:** `slug`, `title`, `major_tag`

### Get Post

```bash
GET /api/cms/posts/{slug}
GET /api/cms/posts/{slug}?include_nodes=true
```

With `include_nodes=true`, returns the post with all its blocks:

```json
{
  "data": {
    "id": "uuid",
    "slug": "my-post",
    "title": "My Post",
    "nodes": [
      {
        "id": "node-uuid",
        "type": "markdown",
        "position": 0,
        "content": "# Hello World",
        "metadata": {}
      }
    ]
  }
}
```

### Update Post

```bash
PATCH /api/cms/posts/{slug}
Content-Type: application/json

{
  "title": "Updated Title",
  "status": "published",
  "published_at": "2024-01-15T10:00:00Z"
}
```

### Delete Post

```bash
DELETE /api/cms/posts/{slug}
```

---

## Nodes (Blocks) API

### Block Types

| Type | Description |
|------|-------------|
| `markdown` | Rich text content (rendered as HTML) |
| `code` | Code block with syntax highlighting |
| `image` | Image with optional caption |
| `video` | YouTube/Vimeo embed |
| `embed` | Generic embed (oEmbed) |
| `divider` | Horizontal rule |
| `interactive` | Custom React component |

### List Nodes

```bash
GET /api/cms/posts/{slug}/nodes
```

### Add Node

```bash
POST /api/cms/posts/{slug}/nodes
Content-Type: application/json

{
  "type": "markdown",
  "content": "## New Section\n\nSome content here.",
  "position": 5
}
```

Position is optional (defaults to end of list).

### Replace All Nodes (Bulk)

```bash
PUT /api/cms/posts/{slug}/nodes
Content-Type: application/json

{
  "nodes": [
    { "type": "markdown", "content": "# Title" },
    { "type": "code", "content": "console.log('hi')", "metadata": { "language": "javascript" } },
    { "type": "divider" },
    { "type": "markdown", "content": "The end." }
  ]
}
```

This deletes all existing nodes and creates new ones.

### Update Node

```bash
PATCH /api/cms/posts/{slug}/nodes/{nodeId}
Content-Type: application/json

{
  "content": "Updated content",
  "metadata": { "language": "typescript" }
}
```

### Delete Node

```bash
DELETE /api/cms/posts/{slug}/nodes/{nodeId}
```

---

## Block Metadata Reference

### Markdown Block
```json
{ "type": "markdown", "content": "# Heading\n\nParagraph text." }
```

### Code Block
```json
{
  "type": "code",
  "content": "function hello() { }",
  "metadata": {
    "language": "javascript",
    "filename": "example.js",
    "showLineNumbers": true
  }
}
```

### Image Block
```json
{
  "type": "image",
  "asset_id": "asset-uuid",
  "metadata": {
    "alt": "Description of image",
    "caption": "Figure 1: Diagram"
  }
}
```

### Video Block
```json
{
  "type": "video",
  "content": "dQw4w9WgXcQ",
  "metadata": {
    "provider": "youtube",
    "videoId": "dQw4w9WgXcQ",
    "caption": "Video explanation",
    "autoplay": false,
    "loop": false
  }
}
```

### Divider Block
```json
{ "type": "divider" }
```

---

## Assets API

### Upload Asset

```bash
POST /api/cms/assets/upload
Content-Type: multipart/form-data

file: (binary)
alt_text: "Description"
caption: "Optional caption"
```

**Supported types:** PNG, JPEG, GIF, WebP, SVG
**Max size:** 10MB

**Response:**
```json
{
  "data": {
    "asset": {
      "id": "uuid",
      "storage_path": "posts/1234-abc.jpg",
      "bucket": "blog-assets",
      "filename": "original-name.jpg",
      "mime_type": "image/jpeg",
      "file_size": 102400
    },
    "url": "https://supabase.../storage/v1/object/public/blog-assets/posts/1234-abc.jpg"
  }
}
```

### Get Asset

```bash
GET /api/cms/assets/{assetId}
```

### Delete Asset

```bash
DELETE /api/cms/assets/{assetId}
```

Returns error if asset is in use by any node or as a featured image.

---

## Markdown Transformation

See [markdown-transformation.md](./markdown-transformation.md) for detailed documentation.

### Quick Example

```bash
# Preview transformation
curl -X POST \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"markdown": "# Hello\n\n```js\nconsole.log(1)\n```"}' \
  "http://localhost:3000/api/cms/posts/my-post/transform"

# Apply transformation (saves to database)
curl -X POST \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"markdown": "# Hello\n\n```js\nconsole.log(1)\n```"}' \
  "http://localhost:3000/api/cms/posts/my-post/transform?apply=true"
```

---

## OpenAPI Schema

```bash
GET /api/cms/schema
```

Returns the full OpenAPI 3.0.3 specification for this API.

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message here",
  "details": { ... }
}
```

**Status Codes:**
- `400` - Bad request (missing/invalid parameters)
- `401` - Missing API key
- `403` - Invalid API key
- `404` - Resource not found
- `409` - Conflict (duplicate slug, asset in use)
- `500` - Server error

---

## Common Workflows

### Create a New Post from Markdown

```bash
# 1. Create the post
curl -X POST -H "X-API-Key: $KEY" -H "Content-Type: application/json" \
  -d '{"slug": "my-new-post", "title": "My New Post", "major_tag": "Thoughts"}' \
  http://localhost:3000/api/cms/posts

# 2. Transform and apply markdown content
curl -X POST -H "X-API-Key: $KEY" -H "Content-Type: application/json" \
  -d '{"markdown": "# Introduction\n\nContent here..."}' \
  "http://localhost:3000/api/cms/posts/my-new-post/transform?apply=true"

# 3. Publish
curl -X PATCH -H "X-API-Key: $KEY" -H "Content-Type: application/json" \
  -d '{"status": "published", "published_at": "2024-01-15T10:00:00Z"}' \
  http://localhost:3000/api/cms/posts/my-new-post
```

### Add Captions to All Media in a Post

```bash
# 1. Get post with nodes
curl -H "X-API-Key: $KEY" \
  "http://localhost:3000/api/cms/posts/my-post?include_nodes=true"

# 2. For each image/video node, update with caption
curl -X PATCH -H "X-API-Key: $KEY" -H "Content-Type: application/json" \
  -d '{"metadata": {"alt": "Diagram", "caption": "Figure 1"}}' \
  http://localhost:3000/api/cms/posts/my-post/nodes/NODE_ID
```

### Migrate Content from External Source

```bash
# For each article:
# 1. Create post with metadata
# 2. Transform markdown content with ?apply=true
# 3. Remote images are auto-downloaded and uploaded
```
