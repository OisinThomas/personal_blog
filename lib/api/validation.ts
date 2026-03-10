// =============================================================================
// Server-side validation for CMS API inputs
// =============================================================================

export type ValidationResult<T> =
  | { valid: true; data: T }
  | { valid: false; error: string };

// =============================================================================
// Constants (exported for reuse by schema route)
// =============================================================================

export const VALID_NODE_TYPES = [
  'markdown', 'image', 'video', 'embed', 'interactive', 'code', 'divider',
] as const;

export const VALID_POST_STATUSES = ['draft', 'published', 'archived'] as const;

export const VALID_MAJOR_TAGS = ['Thoughts', 'Tinkering', 'Translations'] as const;

export const VALID_LANGUAGES = ['en', 'ga'] as const;

export const VALID_LEXICAL_NODE_TYPES = [
  'paragraph', 'heading', 'list', 'quote', 'horizontalrule',
  'image', 'codeblock', 'video', 'embed', 'tableblock',
  'callout', 'toggle-container', 'bilingual', 'interactive',
  'footnote-ref', 'linebreak',
] as const;

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const MAX_TITLE_LENGTH = 300;
export const MAX_DESCRIPTION_LENGTH = 1000;
export const MAX_SLUG_LENGTH = 200;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})?)?$/;

// =============================================================================
// Error collection helper
// =============================================================================

const MAX_ERRORS = 5;

function formatErrors(errors: string[]): string {
  if (errors.length <= MAX_ERRORS) return errors.join('; ');
  const shown = errors.slice(0, MAX_ERRORS).join('; ');
  return `${shown}; ... and ${errors.length - MAX_ERRORS} more errors`;
}

// =============================================================================
// Primitive validators
// =============================================================================

export function validateString(
  value: unknown,
  fieldName: string,
  opts?: { minLength?: number; maxLength?: number; pattern?: RegExp; patternHint?: string }
): ValidationResult<string> {
  if (typeof value !== 'string') {
    return { valid: false, error: `${fieldName} must be a string, got ${typeof value}` };
  }
  if (opts?.minLength !== undefined && value.length < opts.minLength) {
    return { valid: false, error: `${fieldName} must be at least ${opts.minLength} characters, got ${value.length}` };
  }
  if (opts?.maxLength !== undefined && value.length > opts.maxLength) {
    return { valid: false, error: `${fieldName} must be at most ${opts.maxLength} characters, got ${value.length}` };
  }
  if (opts?.pattern && !opts.pattern.test(value)) {
    const hint = opts.patternHint ? ` (${opts.patternHint})` : '';
    return { valid: false, error: `${fieldName} has invalid format${hint}, got '${value}'` };
  }
  return { valid: true, data: value };
}

export function validateEnum<T extends string>(
  value: unknown,
  fieldName: string,
  allowed: readonly T[]
): ValidationResult<T> {
  if (typeof value !== 'string') {
    return { valid: false, error: `${fieldName} must be a string, got ${typeof value}` };
  }
  if (!allowed.includes(value as T)) {
    return {
      valid: false,
      error: `${fieldName} must be one of: ${allowed.join(', ')}, got '${value}'`,
    };
  }
  return { valid: true, data: value as T };
}

export function validateOptionalEnum<T extends string>(
  value: unknown,
  fieldName: string,
  allowed: readonly T[]
): ValidationResult<T | undefined> {
  if (value === undefined || value === null) {
    return { valid: true, data: undefined };
  }
  return validateEnum(value, fieldName, allowed);
}

export function validateInteger(
  value: unknown,
  fieldName: string,
  opts?: { min?: number; max?: number }
): ValidationResult<number> {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    return { valid: false, error: `${fieldName} must be an integer, got ${typeof value === 'number' ? value : typeof value}` };
  }
  if (opts?.min !== undefined && value < opts.min) {
    return { valid: false, error: `${fieldName} must be at least ${opts.min}, got ${value}` };
  }
  if (opts?.max !== undefined && value > opts.max) {
    return { valid: false, error: `${fieldName} must be at most ${opts.max}, got ${value}` };
  }
  return { valid: true, data: value };
}

export function validateBoolean(
  value: unknown,
  fieldName: string
): ValidationResult<boolean> {
  if (typeof value !== 'boolean') {
    return { valid: false, error: `${fieldName} must be a boolean, got ${typeof value}` };
  }
  return { valid: true, data: value };
}

export function validateArray(
  value: unknown,
  fieldName: string
): ValidationResult<unknown[]> {
  if (!Array.isArray(value)) {
    return { valid: false, error: `${fieldName} must be an array, got ${typeof value}` };
  }
  return { valid: true, data: value };
}

export function validateObject(
  value: unknown,
  fieldName: string
): ValidationResult<Record<string, unknown>> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return { valid: false, error: `${fieldName} must be an object, got ${value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value}` };
  }
  return { valid: true, data: value as Record<string, unknown> };
}

export function validateSlug(value: unknown): ValidationResult<string> {
  const str = validateString(value, 'slug', {
    minLength: 1,
    maxLength: MAX_SLUG_LENGTH,
    pattern: SLUG_PATTERN,
    patternHint: "e.g. 'my-post-title' — lowercase letters, numbers, and hyphens only",
  });
  return str;
}

export function validateIsoDate(
  value: unknown,
  fieldName: string
): ValidationResult<string> {
  if (typeof value !== 'string') {
    return { valid: false, error: `${fieldName} must be an ISO 8601 date string, got ${typeof value}` };
  }
  if (!ISO_DATE_PATTERN.test(value)) {
    return { valid: false, error: `${fieldName} must be a valid ISO 8601 date (e.g. '2025-01-15T10:30:00Z'), got '${value}'` };
  }
  return { valid: true, data: value };
}

export function validateUuid(
  value: unknown,
  fieldName: string
): ValidationResult<string> {
  if (typeof value !== 'string') {
    return { valid: false, error: `${fieldName} must be a UUID string, got ${typeof value}` };
  }
  if (!UUID_PATTERN.test(value)) {
    return { valid: false, error: `${fieldName} must be a valid UUID (e.g. '550e8400-e29b-41d4-a716-446655440000'), got '${value}'` };
  }
  return { valid: true, data: value };
}

// =============================================================================
// Domain validators
// =============================================================================

// -- Posts --

interface ValidCreatePostInput {
  slug: string;
  title: string;
  major_tag: (typeof VALID_MAJOR_TAGS)[number];
  description?: string;
  sub_tag?: string;
  language?: (typeof VALID_LANGUAGES)[number];
  tags?: string[];
  author?: string;
  status?: (typeof VALID_POST_STATUSES)[number];
  published_at?: string;
  featured_image_id?: string;
  source?: string;
  source_url?: string;
}

export function validateCreatePostInput(
  body: unknown
): ValidationResult<ValidCreatePostInput> {
  const obj = validateObject(body, 'body');
  if (!obj.valid) return obj;
  const b = obj.data;
  const errors: string[] = [];

  // Required fields
  const slug = validateSlug(b.slug);
  if (!slug.valid) errors.push(slug.error);

  const title = validateString(b.title, 'title', { minLength: 1, maxLength: MAX_TITLE_LENGTH });
  if (!title.valid) errors.push(title.error);

  const majorTag = validateEnum(b.major_tag, 'major_tag', VALID_MAJOR_TAGS);
  if (!majorTag.valid) errors.push(majorTag.error);

  // Optional fields
  if (b.description !== undefined && b.description !== null) {
    const d = validateString(b.description, 'description', { maxLength: MAX_DESCRIPTION_LENGTH });
    if (!d.valid) errors.push(d.error);
  }

  if (b.sub_tag !== undefined && b.sub_tag !== null) {
    const s = validateString(b.sub_tag, 'sub_tag', { maxLength: 100 });
    if (!s.valid) errors.push(s.error);
  }

  if (b.language !== undefined && b.language !== null) {
    const l = validateEnum(b.language, 'language', VALID_LANGUAGES);
    if (!l.valid) errors.push(l.error);
  }

  if (b.status !== undefined && b.status !== null) {
    const s = validateEnum(b.status, 'status', VALID_POST_STATUSES);
    if (!s.valid) errors.push(s.error);
  }

  if (b.tags !== undefined && b.tags !== null) {
    const t = validateArray(b.tags, 'tags');
    if (!t.valid) errors.push(t.error);
  }

  if (b.published_at !== undefined && b.published_at !== null) {
    const p = validateIsoDate(b.published_at, 'published_at');
    if (!p.valid) errors.push(p.error);
  }

  if (b.featured_image_id !== undefined && b.featured_image_id !== null) {
    const f = validateUuid(b.featured_image_id, 'featured_image_id');
    if (!f.valid) errors.push(f.error);
  }

  if (b.source_url !== undefined && b.source_url !== null) {
    const s = validateString(b.source_url, 'source_url');
    if (!s.valid) errors.push(s.error);
  }

  if (errors.length > 0) {
    return { valid: false, error: formatErrors(errors) };
  }

  return {
    valid: true,
    data: {
      slug: b.slug as string,
      title: b.title as string,
      major_tag: b.major_tag as ValidCreatePostInput['major_tag'],
      ...(b.description !== undefined && { description: b.description as string }),
      ...(b.sub_tag !== undefined && { sub_tag: b.sub_tag as string }),
      ...(b.language !== undefined && { language: b.language as ValidCreatePostInput['language'] }),
      ...(b.tags !== undefined && { tags: b.tags as string[] }),
      ...(b.author !== undefined && { author: b.author as string }),
      ...(b.status !== undefined && { status: b.status as ValidCreatePostInput['status'] }),
      ...(b.published_at !== undefined && { published_at: b.published_at as string }),
      ...(b.featured_image_id !== undefined && { featured_image_id: b.featured_image_id as string }),
      ...(b.source !== undefined && { source: b.source as string }),
      ...(b.source_url !== undefined && { source_url: b.source_url as string }),
    },
  };
}

const VALID_UPDATE_POST_FIELDS = [
  'title', 'description', 'major_tag', 'sub_tag', 'language',
  'tags', 'author', 'status', 'published_at', 'featured_image_id',
  'source', 'source_url',
] as const;

// Common typos / camelCase → snake_case mapping for "did you mean?" hints
const FIELD_HINTS: Record<string, string> = {
  majorTag: 'major_tag',
  majortag: 'major_tag',
  subTag: 'sub_tag',
  subtag: 'sub_tag',
  publishedAt: 'published_at',
  publishedat: 'published_at',
  featuredImageId: 'featured_image_id',
  featuredimageid: 'featured_image_id',
  featured_image: 'featured_image_id',
  sourceUrl: 'source_url',
  sourceurl: 'source_url',
};

interface ValidUpdatePostInput {
  title?: string;
  description?: string;
  major_tag?: (typeof VALID_MAJOR_TAGS)[number];
  sub_tag?: string;
  language?: (typeof VALID_LANGUAGES)[number];
  tags?: string[];
  author?: string;
  status?: (typeof VALID_POST_STATUSES)[number];
  published_at?: string;
  featured_image_id?: string;
  source?: string;
  source_url?: string;
}

export function validateUpdatePostInput(
  body: unknown
): ValidationResult<ValidUpdatePostInput> {
  const obj = validateObject(body, 'body');
  if (!obj.valid) return obj;
  const b = obj.data;
  const errors: string[] = [];

  // Check for unknown fields
  for (const key of Object.keys(b)) {
    if (!(VALID_UPDATE_POST_FIELDS as readonly string[]).includes(key)) {
      const hint = FIELD_HINTS[key];
      if (hint) {
        errors.push(`Unknown field '${key}'. Did you mean '${hint}'?`);
      } else {
        errors.push(`Unknown field '${key}'. Valid fields: ${VALID_UPDATE_POST_FIELDS.join(', ')}`);
      }
    }
  }

  // Validate provided fields
  if (b.title !== undefined) {
    const t = validateString(b.title, 'title', { minLength: 1, maxLength: MAX_TITLE_LENGTH });
    if (!t.valid) errors.push(t.error);
  }

  if (b.description !== undefined && b.description !== null) {
    const d = validateString(b.description, 'description', { maxLength: MAX_DESCRIPTION_LENGTH });
    if (!d.valid) errors.push(d.error);
  }

  if (b.major_tag !== undefined) {
    const m = validateEnum(b.major_tag, 'major_tag', VALID_MAJOR_TAGS);
    if (!m.valid) errors.push(m.error);
  }

  if (b.sub_tag !== undefined && b.sub_tag !== null) {
    const s = validateString(b.sub_tag, 'sub_tag', { maxLength: 100 });
    if (!s.valid) errors.push(s.error);
  }

  if (b.language !== undefined) {
    const l = validateEnum(b.language, 'language', VALID_LANGUAGES);
    if (!l.valid) errors.push(l.error);
  }

  if (b.status !== undefined) {
    const s = validateEnum(b.status, 'status', VALID_POST_STATUSES);
    if (!s.valid) errors.push(s.error);
  }

  if (b.tags !== undefined && b.tags !== null) {
    const t = validateArray(b.tags, 'tags');
    if (!t.valid) errors.push(t.error);
  }

  if (b.published_at !== undefined && b.published_at !== null) {
    const p = validateIsoDate(b.published_at, 'published_at');
    if (!p.valid) errors.push(p.error);
  }

  if (b.featured_image_id !== undefined && b.featured_image_id !== null) {
    const f = validateUuid(b.featured_image_id, 'featured_image_id');
    if (!f.valid) errors.push(f.error);
  }

  if (b.source_url !== undefined && b.source_url !== null) {
    const s = validateString(b.source_url, 'source_url');
    if (!s.valid) errors.push(s.error);
  }

  if (errors.length > 0) {
    return { valid: false, error: formatErrors(errors) };
  }

  // Build the validated object with only known fields
  const result: ValidUpdatePostInput = {};
  if (b.title !== undefined) result.title = b.title as string;
  if (b.description !== undefined) result.description = b.description as string;
  if (b.major_tag !== undefined) result.major_tag = b.major_tag as ValidUpdatePostInput['major_tag'];
  if (b.sub_tag !== undefined) result.sub_tag = b.sub_tag as string;
  if (b.language !== undefined) result.language = b.language as ValidUpdatePostInput['language'];
  if (b.tags !== undefined) result.tags = b.tags as string[];
  if (b.author !== undefined) result.author = b.author as string;
  if (b.status !== undefined) result.status = b.status as ValidUpdatePostInput['status'];
  if (b.published_at !== undefined) result.published_at = b.published_at as string;
  if (b.featured_image_id !== undefined) result.featured_image_id = b.featured_image_id as string;
  if (b.source !== undefined) result.source = b.source as string;
  if (b.source_url !== undefined) result.source_url = b.source_url as string;

  return { valid: true, data: result };
}

// -- List posts query --

interface ValidListPostsQuery {
  status?: (typeof VALID_POST_STATUSES)[number];
  major_tag?: (typeof VALID_MAJOR_TAGS)[number];
  limit?: number;
}

export function validateListPostsQuery(
  params: URLSearchParams
): ValidationResult<ValidListPostsQuery> {
  const errors: string[] = [];
  const result: ValidListPostsQuery = {};

  const status = params.get('status');
  if (status) {
    const s = validateEnum(status, 'status', VALID_POST_STATUSES);
    if (!s.valid) errors.push(s.error);
    else result.status = s.data;
  }

  const majorTag = params.get('major_tag');
  if (majorTag) {
    const m = validateEnum(majorTag, 'major_tag', VALID_MAJOR_TAGS);
    if (!m.valid) errors.push(m.error);
    else result.major_tag = m.data;
  }

  const limit = params.get('limit');
  if (limit) {
    const parsed = parseInt(limit, 10);
    if (isNaN(parsed)) {
      errors.push(`limit must be a positive integer, got '${limit}'`);
    } else {
      const l = validateInteger(parsed, 'limit', { min: 1 });
      if (!l.valid) errors.push(l.error);
      else result.limit = l.data;
    }
  }

  if (errors.length > 0) {
    return { valid: false, error: formatErrors(errors) };
  }

  return { valid: true, data: result };
}

// -- Nodes --

interface ValidCreateNodeInput {
  type: (typeof VALID_NODE_TYPES)[number];
  content?: string;
  position?: number;
  asset_id?: string;
  metadata?: Record<string, unknown>;
}

export function validateCreateNodeInput(
  body: unknown
): ValidationResult<ValidCreateNodeInput> {
  const obj = validateObject(body, 'body');
  if (!obj.valid) return obj;
  const b = obj.data;
  const errors: string[] = [];

  const type = validateEnum(b.type, 'type', VALID_NODE_TYPES);
  if (!type.valid) errors.push(type.error);

  if (b.content !== undefined && b.content !== null) {
    const c = validateString(b.content, 'content');
    if (!c.valid) errors.push(c.error);
  }

  if (b.position !== undefined && b.position !== null) {
    const p = validateInteger(b.position, 'position', { min: 0 });
    if (!p.valid) errors.push(p.error);
  }

  if (b.asset_id !== undefined && b.asset_id !== null) {
    const a = validateUuid(b.asset_id, 'asset_id');
    if (!a.valid) errors.push(a.error);
  }

  if (b.metadata !== undefined && b.metadata !== null) {
    const m = validateObject(b.metadata, 'metadata');
    if (!m.valid) {
      errors.push(m.error);
    } else if (type.valid) {
      const metaErrors = validateNodeMetadata(type.data, m.data);
      errors.push(...metaErrors);
    }
  }

  if (errors.length > 0) {
    return { valid: false, error: formatErrors(errors) };
  }

  return {
    valid: true,
    data: {
      type: b.type as ValidCreateNodeInput['type'],
      ...(b.content !== undefined && { content: b.content as string }),
      ...(b.position !== undefined && { position: b.position as number }),
      ...(b.asset_id !== undefined && { asset_id: b.asset_id as string }),
      ...(b.metadata !== undefined && { metadata: b.metadata as Record<string, unknown> }),
    },
  };
}

interface ValidUpdateNodeInput {
  type?: (typeof VALID_NODE_TYPES)[number];
  content?: string;
  position?: number;
  asset_id?: string;
  metadata?: Record<string, unknown>;
}

export function validateUpdateNodeInput(
  body: unknown
): ValidationResult<ValidUpdateNodeInput> {
  const obj = validateObject(body, 'body');
  if (!obj.valid) return obj;
  const b = obj.data;
  const errors: string[] = [];

  if (b.type !== undefined) {
    const t = validateEnum(b.type, 'type', VALID_NODE_TYPES);
    if (!t.valid) errors.push(t.error);
  }

  if (b.content !== undefined && b.content !== null) {
    const c = validateString(b.content, 'content');
    if (!c.valid) errors.push(c.error);
  }

  if (b.position !== undefined && b.position !== null) {
    const p = validateInteger(b.position, 'position', { min: 0 });
    if (!p.valid) errors.push(p.error);
  }

  if (b.asset_id !== undefined && b.asset_id !== null) {
    const a = validateUuid(b.asset_id, 'asset_id');
    if (!a.valid) errors.push(a.error);
  }

  if (b.metadata !== undefined && b.metadata !== null) {
    const m = validateObject(b.metadata, 'metadata');
    if (!m.valid) {
      errors.push(m.error);
    } else if (b.type !== undefined) {
      const t = validateEnum(b.type, 'type', VALID_NODE_TYPES);
      if (t.valid) {
        const metaErrors = validateNodeMetadata(t.data, m.data);
        errors.push(...metaErrors);
      }
    }
  }

  if (errors.length > 0) {
    return { valid: false, error: formatErrors(errors) };
  }

  const result: ValidUpdateNodeInput = {};
  if (b.type !== undefined) result.type = b.type as ValidUpdateNodeInput['type'];
  if (b.content !== undefined) result.content = b.content as string;
  if (b.position !== undefined) result.position = b.position as number;
  if (b.asset_id !== undefined) result.asset_id = b.asset_id as string;
  if (b.metadata !== undefined) result.metadata = b.metadata as Record<string, unknown>;

  return { valid: true, data: result };
}

// -- Node metadata validation (per type) --

function validateNodeMetadata(
  type: (typeof VALID_NODE_TYPES)[number],
  metadata: Record<string, unknown>
): string[] {
  const errors: string[] = [];

  switch (type) {
    case 'image':
      if (metadata.alt !== undefined && typeof metadata.alt !== 'string') {
        errors.push('metadata.alt must be a string');
      }
      if (metadata.caption !== undefined && typeof metadata.caption !== 'string') {
        errors.push('metadata.caption must be a string');
      }
      if (metadata.width !== undefined) {
        const w = validateInteger(metadata.width, 'metadata.width', { min: 1 });
        if (!w.valid) errors.push(w.error);
      }
      if (metadata.height !== undefined) {
        const h = validateInteger(metadata.height, 'metadata.height', { min: 1 });
        if (!h.valid) errors.push(h.error);
      }
      break;

    case 'video':
      if (metadata.provider !== undefined) {
        const p = validateEnum(metadata.provider, 'metadata.provider', ['youtube', 'vimeo', 'self-hosted'] as const);
        if (!p.valid) errors.push(p.error);
      }
      if (metadata.videoId !== undefined && typeof metadata.videoId !== 'string') {
        errors.push('metadata.videoId must be a string');
      }
      if (metadata.caption !== undefined && typeof metadata.caption !== 'string') {
        errors.push('metadata.caption must be a string');
      }
      if (metadata.autoplay !== undefined && typeof metadata.autoplay !== 'boolean') {
        errors.push('metadata.autoplay must be a boolean');
      }
      if (metadata.loop !== undefined && typeof metadata.loop !== 'boolean') {
        errors.push('metadata.loop must be a boolean');
      }
      break;

    case 'embed':
      if (metadata.provider !== undefined && typeof metadata.provider !== 'string') {
        errors.push('metadata.provider must be a string');
      }
      if (metadata.url !== undefined && typeof metadata.url !== 'string') {
        errors.push('metadata.url must be a string');
      }
      if (metadata.html !== undefined && typeof metadata.html !== 'string') {
        errors.push('metadata.html must be a string');
      }
      break;

    case 'code':
      if (metadata.language !== undefined && typeof metadata.language !== 'string') {
        errors.push('metadata.language must be a string');
      }
      if (metadata.filename !== undefined && typeof metadata.filename !== 'string') {
        errors.push('metadata.filename must be a string');
      }
      if (metadata.showLineNumbers !== undefined && typeof metadata.showLineNumbers !== 'boolean') {
        errors.push('metadata.showLineNumbers must be a boolean');
      }
      break;

    case 'interactive':
      if (!metadata.componentSlug || typeof metadata.componentSlug !== 'string') {
        errors.push("metadata.componentSlug is required for 'interactive' nodes and must be a string");
      }
      if (metadata.props !== undefined) {
        const p = validateObject(metadata.props, 'metadata.props');
        if (!p.valid) errors.push(p.error);
      }
      break;

    case 'markdown':
    case 'divider':
      // Pass-through, no specific metadata constraints
      break;
  }

  return errors;
}

// -- Bulk nodes --

export function validateBulkNodes(
  body: unknown
): ValidationResult<{ nodes: ValidCreateNodeInput[] }> {
  const obj = validateObject(body, 'body');
  if (!obj.valid) return obj;

  const nodesArr = validateArray(obj.data.nodes, 'nodes');
  if (!nodesArr.valid) return { valid: false, error: nodesArr.error };

  const errors: string[] = [];
  const validatedNodes: ValidCreateNodeInput[] = [];

  for (let i = 0; i < nodesArr.data.length; i++) {
    const result = validateCreateNodeInput(nodesArr.data[i]);
    if (!result.valid) {
      errors.push(`nodes[${i}]: ${result.error}`);
    } else {
      validatedNodes.push(result.data);
    }
  }

  if (errors.length > 0) {
    return { valid: false, error: formatErrors(errors) };
  }

  return { valid: true, data: { nodes: validatedNodes } };
}

// =============================================================================
// Editor state (Lexical JSON) validation
// =============================================================================

export function validateEditorState(
  state: unknown
): ValidationResult<Record<string, unknown>> {
  // Level 1: Envelope
  const obj = validateObject(state, 'editor_state');
  if (!obj.valid) return obj;

  const root = obj.data.root;
  const rootObj = validateObject(root, 'editor_state.root');
  if (!rootObj.valid) return rootObj;

  const children = rootObj.data.children;
  const childrenArr = validateArray(children, 'editor_state.root.children');
  if (!childrenArr.valid) return childrenArr;

  // Level 2 + 3: Top-level node types and required fields
  const errors: string[] = [];

  for (let i = 0; i < childrenArr.data.length; i++) {
    const child = childrenArr.data[i];
    const prefix = `editor_state.root.children[${i}]`;

    if (child === null || typeof child !== 'object' || Array.isArray(child)) {
      errors.push(`${prefix} must be an object`);
      continue;
    }

    const node = child as Record<string, unknown>;

    if (typeof node.type !== 'string') {
      errors.push(`${prefix}.type must be a string`);
      continue;
    }

    if (!(VALID_LEXICAL_NODE_TYPES as readonly string[]).includes(node.type)) {
      errors.push(
        `${prefix}.type must be one of: ${VALID_LEXICAL_NODE_TYPES.join(', ')}, got '${node.type}'`
      );
      continue;
    }

    // Level 3: Required fields per block type
    const fieldErrors = validateLexicalNodeFields(node.type, node, prefix);
    errors.push(...fieldErrors);
  }

  if (errors.length > 0) {
    return { valid: false, error: formatErrors(errors) };
  }

  return { valid: true, data: obj.data };
}

function validateLexicalNodeFields(
  type: string,
  node: Record<string, unknown>,
  prefix: string
): string[] {
  const errors: string[] = [];

  switch (type) {
    case 'heading':
      if (typeof node.tag !== 'string' || !['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(node.tag)) {
        errors.push(`${prefix} (heading) requires 'tag' to be one of: h1, h2, h3, h4, h5, h6, got '${node.tag ?? 'undefined'}'`);
      }
      break;

    case 'list':
      if (typeof node.listType !== 'string' || !['bullet', 'number', 'check'].includes(node.listType)) {
        errors.push(`${prefix} (list) requires 'listType' to be one of: bullet, number, check, got '${node.listType ?? 'undefined'}'`);
      }
      break;

    case 'image':
      if (typeof node.src !== 'string') {
        errors.push(`${prefix} (image) is missing required field 'src' (string)`);
      }
      break;

    case 'codeblock':
      if (typeof node.code !== 'string') {
        errors.push(`${prefix} (codeblock) is missing required field 'code' (string)`);
      }
      break;

    case 'video':
      if (typeof node.provider !== 'string') {
        errors.push(`${prefix} (video) is missing required field 'provider' (string)`);
      }
      if (typeof node.videoId !== 'string') {
        errors.push(`${prefix} (video) is missing required field 'videoId' (string)`);
      }
      break;

    case 'embed':
      if (typeof node.url !== 'string' && typeof node.html !== 'string') {
        errors.push(`${prefix} (embed) requires at least one of 'url' (string) or 'html' (string)`);
      }
      break;

    case 'tableblock':
      if (!Array.isArray(node.headers)) {
        errors.push(`${prefix} (tableblock) is missing required field 'headers' (array)`);
      }
      if (!Array.isArray(node.rows)) {
        errors.push(`${prefix} (tableblock) is missing required field 'rows' (array)`);
      }
      break;

    case 'callout':
      if (typeof node.variant !== 'string') {
        errors.push(`${prefix} (callout) is missing required field 'variant' (string)`);
      }
      break;

    case 'bilingual':
      if (!Array.isArray(node.languages)) {
        errors.push(`${prefix} (bilingual) is missing required field 'languages' (array)`);
      }
      if (node.content === null || typeof node.content !== 'object' || Array.isArray(node.content)) {
        errors.push(`${prefix} (bilingual) is missing required field 'content' (object)`);
      }
      break;

    case 'interactive':
      if (typeof node.componentSlug !== 'string') {
        errors.push(`${prefix} (interactive) is missing required field 'componentSlug' (string)`);
      }
      break;

    case 'footnote-ref':
      if (typeof node.footnoteId !== 'string') {
        errors.push(`${prefix} (footnote-ref) is missing required field 'footnoteId' (string)`);
      }
      if (typeof node.label !== 'string') {
        errors.push(`${prefix} (footnote-ref) is missing required field 'label' (string)`);
      }
      break;

    // Types with no required fields
    case 'toggle-container':
    case 'paragraph':
    case 'quote':
    case 'horizontalrule':
    case 'linebreak':
      break;
  }

  return errors;
}
