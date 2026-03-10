# CMS Developer Guide

This guide covers two topics: using the CMS API (for AI agents and scripts), and extending the block type system (for developers).

For endpoint-by-endpoint API reference, see [cms-api.md](./cms-api.md).

---

## 1. API Workflow for AI Agents

### Step 1: Create a post

```bash
POST /api/cms/posts
{
  "slug": "my-post-title",
  "title": "My Post Title",
  "major_tag": "Thoughts"
}
```

**Required fields:**

| Field | Type | Constraints |
|-------|------|-------------|
| `slug` | string | 1–200 chars, lowercase letters, numbers, hyphens only (`^[a-z0-9]+(?:-[a-z0-9]+)*$`) |
| `title` | string | 1–300 chars |
| `major_tag` | enum | `Thoughts`, `Tinkering`, `Translations` |

**Optional fields:**

| Field | Type | Constraints |
|-------|------|-------------|
| `description` | string | max 1000 chars |
| `sub_tag` | string | max 100 chars |
| `language` | enum | `en`, `ga` (default: `en`) |
| `tags` | string[] | array of tag strings |
| `author` | string | |
| `status` | enum | `draft`, `published`, `archived` (default: `draft`) |
| `published_at` | string | ISO 8601 datetime (e.g. `2025-01-15T10:30:00Z`) |
| `featured_image_id` | string | UUID of an uploaded asset |
| `source` | string | source attribution |
| `source_url` | string | URL of original source |

### Step 2: Upload images (optional)

```bash
POST /api/cms/assets/upload
Content-Type: multipart/form-data

file: (binary)
alt_text: "Description of image"
caption: "Optional caption"
```

Accepted MIME types: `image/png`, `image/jpeg`, `image/gif`, `image/webp`, `image/svg+xml`. Max size: 10MB.

### Step 3: Set content

Use `PATCH /api/cms/posts/{slug}/content` with **one** of:

#### Option A: Markdown (recommended for AI agents)

```json
{
  "content_markdown": "# Introduction\n\nHello world.\n\n![Photo](https://example.com/photo.jpg)\n\n```python\nprint('hello')\n```"
}
```

- Auto-converts to Lexical JSON
- Remote images are downloaded and uploaded to Supabase Storage by default (disable with `"auto_upload_images": false`)

#### Option B: Lexical JSON (for structured content)

```json
{
  "editor_state": {
    "root": {
      "children": [
        { "type": "paragraph", "children": [{ "type": "text", "text": "Hello" }] },
        { "type": "heading", "tag": "h2", "children": [{ "type": "text", "text": "Section" }] }
      ],
      "type": "root",
      "direction": null
    }
  }
}
```

The `editor_state` is validated server-side:
- Must have `root.children` array
- Each top-level child must have a valid `type` (see Lexical Node Types below)
- Block-specific required fields are checked (e.g. `heading` needs `tag`, `image` needs `src`)

### Step 4: Publish

```json
PATCH /api/cms/posts/{slug}
{
  "status": "published",
  "published_at": "2025-01-15T10:30:00Z"
}
```

### Validation errors

All validation errors return HTTP 400 with a descriptive message:

```json
{
  "error": "slug must contain only lowercase letters, numbers, and hyphens (e.g. 'my-post-title'), got 'My Bad Slug!'; major_tag must be one of: Thoughts, Tinkering, Translations, got 'Blog'"
}
```

Multiple errors are joined by `"; "` (max 5 shown). The error text includes allowed values and the actual value sent, so an AI agent can self-correct.

Update endpoints (`PATCH /posts/{slug}`) also reject unknown fields with hints:

```json
{ "error": "Unknown field 'majorTag'. Did you mean 'major_tag'?" }
```

---

## 2. Block Type Architecture

Every custom block type requires three things kept in sync:

| Layer | File pattern | Purpose |
|-------|-------------|---------|
| **Editor node** | `components/admin/lexical/nodes/{Type}Node.tsx` | Lexical editor plugin — handles creation, editing, serialization in the CMS editor |
| **Content renderer** | `components/blocks/LexicalContentRenderer.tsx` | Renders the block on the public blog (in the `RenderNode` switch statement) |
| **Validation** | `lib/api/validation.ts` | Validates the block's required fields — `VALID_LEXICAL_NODE_TYPES` + `validateLexicalNodeFields` |

Supporting layers (not always needed):

| Layer | File | Purpose |
|-------|------|---------|
| **Editor config** | `lib/lexical/config.ts` | Registers the node class in `EDITOR_NODES` |
| **Markdown export** | `lib/export/lexical-to-markdown.ts` | Converts the block back to markdown (in `nodeToMarkdown` switch) |
| **OpenAPI schema** | `app/api/cms/schema/route.ts` | Documents block-specific API behavior |

---

## 3. Adding a New Block Type

Checklist — using a hypothetical `chart` block as an example:

### 1. Create the Lexical node

`components/admin/lexical/nodes/ChartNode.tsx`

Export the node class with `getType()`, `clone()`, `createDOM()`, `exportJSON()`, and `importJSON()` methods. The `exportJSON()` output determines what gets stored in `editor_state`.

### 2. Register in editor config

`lib/lexical/config.ts` — add to the `EDITOR_NODES` array:

```ts
import { ChartNode } from './nodes/ChartNode';

export const EDITOR_NODES = [
  // ... existing nodes
  ChartNode,
];
```

### 3. Add renderer

`components/blocks/LexicalContentRenderer.tsx` — add a case to the `RenderNode` switch:

```ts
case 'chart':
  return <RenderChart node={node as ChartNodeData} />;
```

### 4. Add validation

`lib/api/validation.ts` — two changes:

1. Add the type string to `VALID_LEXICAL_NODE_TYPES`:
   ```ts
   export const VALID_LEXICAL_NODE_TYPES = [
     // ... existing types
     'chart',
   ] as const;
   ```

2. Add required fields to `validateLexicalNodeFields`:
   ```ts
   case 'chart':
     if (typeof node.chartType !== 'string') {
       errors.push(`${prefix} (chart) is missing required field 'chartType' (string)`);
     }
     if (!Array.isArray(node.data)) {
       errors.push(`${prefix} (chart) is missing required field 'data' (array)`);
     }
     break;
   ```

### 5. Add export support

`lib/export/lexical-to-markdown.ts` — add a case to `nodeToMarkdown`:

```ts
case 'chart':
  return `<!-- chart: ${(node as ChartNode).chartType} -->`;
```

### 6. Update OpenAPI schema (if needed)

`app/api/cms/schema/route.ts` — document the block if it has unique API-facing behavior.

---

## 4. Reference Tables

### Post enums

| Field | Valid values |
|-------|-------------|
| `major_tag` | `Thoughts`, `Tinkering`, `Translations` |
| `status` | `draft`, `published`, `archived` |
| `language` | `en`, `ga` |

### Legacy node types (block-based system)

Used by `POST /posts/{slug}/nodes` and `PUT /posts/{slug}/nodes`:

| Type | Required metadata |
|------|------------------|
| `markdown` | — |
| `image` | — (optional: `alt`, `caption`, `width`, `height`) |
| `video` | — (optional: `provider` ∈ youtube/vimeo/self-hosted, `videoId`, `caption`, `autoplay`, `loop`) |
| `embed` | — (optional: `provider`, `url`, `html`) |
| `code` | — (optional: `language`, `filename`, `showLineNumbers`) |
| `interactive` | `componentSlug` (required) |
| `divider` | — |

### Lexical node types (editor_state system)

Used by `PATCH /posts/{slug}/content` with `editor_state`:

| Type | Required fields | Notes |
|------|----------------|-------|
| `paragraph` | — | |
| `heading` | `tag` ∈ h1–h6 | |
| `list` | `listType` ∈ bullet, number, check | |
| `quote` | — | |
| `horizontalrule` | — | |
| `image` | `src` | Plus optional `alt`, `caption`, `width`, `height`, `assetId` |
| `codeblock` | `code` | Plus optional `language`, `filename` |
| `video` | `provider`, `videoId` | Plus optional `caption` |
| `embed` | `url` OR `html` | Plus optional `provider` |
| `tableblock` | `headers`, `rows` | Both arrays; optional `alignments` |
| `callout` | `variant` | e.g. info, warning, success, error, note |
| `toggle-container` | — | Children: `toggle-title` + `toggle-content` |
| `bilingual` | `languages`, `content` | `languages`: string[], `content`: Record<string, string> |
| `interactive` | `componentSlug` | Plus optional `props` |
| `footnote-ref` | `footnoteId`, `label` | |
| `linebreak` | — | |

### Authentication

- **Localhost only** — API rejects non-localhost requests (403)
- **Ephemeral token** — generated on server start, printed to console
- **Stable token** — set `CMS_API_TOKEN` env var for programmatic access
- **Headers** — `X-API-Key: <token>` or `Authorization: Bearer <token>`

### Error format

```json
{
  "error": "field_path problem. allowed values, got 'actual'",
  "details": "..."
}
```

Multiple errors joined by `"; "`, capped at 5 with `"... and N more errors"`.
