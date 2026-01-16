# Markdown Transformation API

The transformation endpoint converts raw markdown content into the blog's structured block format. This enables AI systems to programmatically create and update posts using familiar markdown syntax.

## Endpoint

```
POST /api/cms/posts/{slug}/transform
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `apply` | boolean | If `true`, saves the transformed blocks to the database. If `false` (default), returns a preview only. |

### Request Body

```json
{
  "markdown": "# Your markdown content here\n\nParagraphs, code blocks, images, etc."
}
```

### Response (Preview Mode)

```json
{
  "data": {
    "blocks": [...],
    "summary": {
      "totalBlocks": 5,
      "markdownBlocks": 2,
      "codeBlocks": 1,
      "imageBlocks": 1,
      "videoBlocks": 1,
      "imagesRequiringUpload": 1
    }
  }
}
```

### Response (Apply Mode)

```json
{
  "data": {
    "post": { ... },
    "nodes": [...],
    "assetsCreated": 1,
    "summary": { ... }
  }
}
```

---

## Supported Block Types

### 1. Markdown Blocks

Regular text content becomes `markdown` blocks. The transformer preserves:
- Headings (`#`, `##`, etc.)
- Bold, italic, strikethrough
- Lists (ordered and unordered)
- Blockquotes
- Links
- Inline code

**Input:**
```markdown
# Welcome

This is a paragraph with **bold** and *italic* text.

- List item 1
- List item 2
```

**Output:**
```json
{
  "type": "markdown",
  "content": "# Welcome\n\nThis is a paragraph with **bold** and *italic* text.\n\n- List item 1\n- List item 2"
}
```

### 2. Code Blocks

Fenced code blocks with language hints are extracted as `code` blocks.

**Input:**
````markdown
```typescript
function hello(name: string): string {
  return `Hello, ${name}!`;
}
```
````

**Output:**
```json
{
  "type": "code",
  "content": "function hello(name: string): string {\n  return `Hello, ${name}!`;\n}",
  "metadata": {
    "language": "typescript",
    "showLineNumbers": true
  }
}
```

Supported language hints include: `javascript`, `typescript`, `python`, `rust`, `go`, `java`, `html`, `css`, `bash`, `sql`, `json`, `yaml`, and many more.

### 3. Image Blocks

Markdown images are converted to `image` blocks. Remote images are automatically downloaded and uploaded to Supabase storage.

**Input:**
```markdown
![A beautiful sunset](https://example.com/sunset.jpg)
```

**Output:**
```json
{
  "type": "image",
  "metadata": {
    "alt": "A beautiful sunset",
    "caption": ""
  },
  "asset_id": "uuid-of-uploaded-asset"
}
```

#### Image Handling

| Source | Behavior |
|--------|----------|
| Remote URL (`https://...`) | Downloaded and uploaded to Supabase storage |
| Substack CDN | Downloaded and re-hosted |
| Local path | Stored as content reference (no upload) |

If an image download fails, the transformer creates a markdown block with the original image syntax as a fallback.

### 4. Video Blocks

Standalone YouTube and Vimeo URLs on their own line are converted to `video` blocks.

**Input:**
```markdown
Check out this video:

https://www.youtube.com/watch?v=dQw4w9WgXcQ

Pretty cool, right?
```

**Output:**
```json
[
  {
    "type": "markdown",
    "content": "Check out this video:"
  },
  {
    "type": "video",
    "content": "dQw4w9WgXcQ",
    "metadata": {
      "provider": "youtube",
      "videoId": "dQw4w9WgXcQ"
    }
  },
  {
    "type": "markdown",
    "content": "Pretty cool, right?"
  }
]
```

**Supported URL formats:**
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`
- `https://vimeo.com/VIDEO_ID`

### 5. Divider Blocks

Horizontal rules (`---`) create `divider` blocks.

**Input:**
```markdown
First section content.

---

Second section content.
```

**Output:**
```json
[
  { "type": "markdown", "content": "First section content." },
  { "type": "divider" },
  { "type": "markdown", "content": "Second section content." }
]
```

---

## Complete Example

### Input Markdown

````markdown
# Getting Started with TypeScript

TypeScript adds static typing to JavaScript, making your code more robust.

## Installation

```bash
npm install typescript --save-dev
```

## Basic Example

```typescript
interface User {
  name: string;
  age: number;
}

function greet(user: User): string {
  return `Hello, ${user.name}!`;
}
```

Here's a diagram of the type system:

![TypeScript Type Hierarchy](https://example.com/ts-types.png)

---

## Video Tutorial

https://www.youtube.com/watch?v=abc123xyz

## Conclusion

TypeScript is great for large codebases!
````

### Output Blocks

```json
{
  "blocks": [
    {
      "type": "markdown",
      "content": "# Getting Started with TypeScript\n\nTypeScript adds static typing to JavaScript, making your code more robust.\n\n## Installation"
    },
    {
      "type": "code",
      "content": "npm install typescript --save-dev",
      "metadata": { "language": "bash", "showLineNumbers": true }
    },
    {
      "type": "markdown",
      "content": "## Basic Example"
    },
    {
      "type": "code",
      "content": "interface User {\n  name: string;\n  age: number;\n}\n\nfunction greet(user: User): string {\n  return `Hello, ${user.name}!`;\n}",
      "metadata": { "language": "typescript", "showLineNumbers": true }
    },
    {
      "type": "markdown",
      "content": "Here's a diagram of the type system:"
    },
    {
      "type": "image",
      "sourceUrl": "https://example.com/ts-types.png",
      "altText": "TypeScript Type Hierarchy",
      "metadata": { "alt": "TypeScript Type Hierarchy" }
    },
    {
      "type": "divider"
    },
    {
      "type": "markdown",
      "content": "## Video Tutorial"
    },
    {
      "type": "video",
      "content": "abc123xyz",
      "metadata": { "provider": "youtube", "videoId": "abc123xyz" }
    },
    {
      "type": "markdown",
      "content": "## Conclusion\n\nTypeScript is great for large codebases!"
    }
  ],
  "summary": {
    "totalBlocks": 10,
    "markdownBlocks": 5,
    "codeBlocks": 2,
    "imageBlocks": 1,
    "videoBlocks": 1,
    "imagesRequiringUpload": 1
  }
}
```

---

## Workflow for AI Content Updates

### 1. Get Existing Content

```bash
curl -H "X-API-Key: $API_KEY" \
  "https://site.com/api/cms/posts/my-post?include_nodes=true"
```

### 2. Preview Transformation

```bash
curl -X POST \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"markdown": "# Updated content..."}' \
  "https://site.com/api/cms/posts/my-post/transform"
```

### 3. Apply Transformation

```bash
curl -X POST \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"markdown": "# Updated content..."}' \
  "https://site.com/api/cms/posts/my-post/transform?apply=true"
```

### 4. Add Captions to Media

After transformation, update individual blocks with captions:

```bash
# Update video block with caption
curl -X PATCH \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"metadata": {"provider": "youtube", "videoId": "abc123", "caption": "Introduction to TypeScript"}}' \
  "https://site.com/api/cms/posts/my-post/nodes/NODE_UUID"

# Update image block with caption
curl -X PATCH \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"metadata": {"alt": "Type hierarchy diagram", "caption": "Figure 1: TypeScript type system"}}' \
  "https://site.com/api/cms/posts/my-post/nodes/NODE_UUID"
```

---

## Edge Cases & Limitations

### What Gets Merged

Consecutive text content between special blocks is merged into single markdown blocks. This keeps the block count manageable.

### What Stays Separate

- Code blocks are always separate
- Images are always separate
- Videos are always separate
- Dividers create block boundaries

### Not Supported (Yet)

| Feature | Current Behavior |
|---------|------------------|
| Tables | Kept as markdown (renders fine) |
| Footnotes | Kept as markdown |
| Embedded tweets | Kept as text |
| Custom components | Manual creation via API |
| Image captions in markdown | Use alt text, add caption via PATCH |

### Video URL Detection

Video URLs must be on their own line to be detected. Inline video links stay as markdown links:

```markdown
<!-- This becomes a video block -->
https://www.youtube.com/watch?v=abc123

<!-- This stays as a markdown link -->
Check out [this video](https://www.youtube.com/watch?v=abc123)
```

### Image Download Failures

If a remote image cannot be downloaded (403, 404, network error), the transformer:
1. Logs the error
2. Creates a markdown block with the original `![alt](url)` syntax
3. Continues processing remaining content

This ensures partial failures don't break the entire transformation.

---

## API Authentication

All endpoints require the `X-API-Key` header:

```bash
curl -H "X-API-Key: your-api-key-here" ...
```

The API key is configured via the `CMS_API_KEY` environment variable.
