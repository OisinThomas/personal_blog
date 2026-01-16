# Blog CMS Migration Plan: File-Based to Supabase Node-Based System

## Overview

Migrate from static markdown files to a Supabase-backed CMS with:
- **Node-based content**: Posts contain ordered blocks (markdown, images, videos, embeds, interactive components)
- **Supabase backend**: Database + S3 storage + Auth
- **Integrated admin**: Block editor at `/admin` with single-user OTP authentication
- **Interactive components**: React components at `/interactions/[slug]`, embeddable in posts

**Supabase Config**: `https://xgnfxghqiwsjhdhqmbus.supabase.co`

---

## Database Schema

### Posts Table
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  major_tag TEXT NOT NULL CHECK (major_tag IN ('Thoughts', 'Tinkering', 'Translations')),
  sub_tag TEXT,
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'ga')),
  tags TEXT[] DEFAULT '{}',
  author TEXT NOT NULL DEFAULT 'Oisin Thomas',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  featured_image_id UUID REFERENCES assets(id),
  source TEXT,
  source_url TEXT
);
```

### Nodes Table (Content Blocks)
```sql
CREATE TYPE node_type AS ENUM (
  'markdown', 'image', 'video', 'embed', 'interactive', 'code', 'divider'
);

CREATE TABLE nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  type node_type NOT NULL,
  position INTEGER NOT NULL,
  content TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  asset_id UUID REFERENCES assets(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Assets Table
```sql
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path TEXT NOT NULL,
  bucket TEXT NOT NULL DEFAULT 'blog-assets',
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  caption TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Interactive Components Registry
```sql
CREATE TABLE interactive_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  component_path TEXT NOT NULL,
  default_props JSONB DEFAULT '{}',
  available BOOLEAN NOT NULL DEFAULT true
);
```

---

## New Directory Structure

```
personal_blog/
  app/
    (public)/              # Existing public routes (keep)
      page.tsx             # MODIFY: Fetch from Supabase
      all/page.tsx         # MODIFY: Fetch from Supabase
      blog/[slug]/page.tsx # MODIFY: Use BlockRenderer

    admin/                 # NEW: Admin routes
      layout.tsx           # Auth guard wrapper
      page.tsx             # Dashboard
      login/page.tsx       # Email + OTP login
      posts/
        page.tsx           # Post list
        new/page.tsx       # Create post
        [slug]/page.tsx    # Block editor
      assets/page.tsx      # Media library

    interactions/          # NEW: Standalone interactive pages
      [slug]/page.tsx      # Renders React components

    api/                   # NEW: API routes
      posts/
        route.ts           # GET list, POST create
        [slug]/route.ts    # GET, PUT, DELETE
        [slug]/nodes/route.ts
      assets/
        route.ts
        upload/route.ts
      auth/callback/route.ts

  components/
    admin/                 # NEW: Admin components
      BlockEditor.tsx      # Main drag-and-drop editor
      blocks/              # Block editor components
        MarkdownBlock.tsx
        ImageBlock.tsx
        VideoBlock.tsx
        EmbedBlock.tsx
        InteractiveBlock.tsx
      AssetPicker.tsx

    blocks/                # NEW: Public block renderers
      BlockRenderer.tsx    # Main renderer
      MarkdownBlock.tsx
      ImageBlock.tsx
      VideoBlock.tsx
      etc.

    interactive/           # NEW: Interactive components
      registry.ts          # Component registry
      [ComponentName]/     # Each interactive component

  lib/
    supabase/              # NEW: Supabase utilities
      client.ts            # Browser client
      server.ts            # Server client
      types.ts             # Generated types
    posts/                 # NEW: Post queries/mutations
      queries.ts
      mutations.ts
```

---

## Critical Files to Modify

| File | Change |
|------|--------|
| `lib/utils.ts` | Keep `cn()` and `markdownToHtml()`, deprecate post functions |
| `app/blog/[slug]/page.tsx` | Fetch from Supabase, use BlockRenderer |
| `app/page.tsx` | Fetch from Supabase |
| `app/all/page.tsx` | Fetch from Supabase |
| `next.config.mjs` | Add Supabase image domain |
| `.env.local` | Add Supabase credentials |

---

## Authentication Flow

1. Single admin email configured in environment
2. User enters email at `/admin/login`
3. If email matches, Supabase sends OTP via email
4. User clicks link or enters code
5. Session stored, redirects to `/admin`
6. All `/admin/*` routes protected by AuthGuard

```typescript
// lib/supabase/auth.ts
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

export async function signInWithOTP(email: string) {
  if (email !== ADMIN_EMAIL) {
    throw new Error('Unauthorized');
  }
  return supabase.auth.signInWithOtp({ email });
}
```

---

## Migration Script

Location: `scripts/migrate-to-supabase/index.ts`

1. Read all 49 `.md` files from `_posts/`
2. Parse frontmatter with `gray-matter`
3. For each post:
   - Create post record with all metadata
   - Create single markdown node with full content
   - Upload featured image to Supabase Storage
   - Create asset record for image
4. Verify all posts migrated

Run with: `npx ts-node scripts/migrate-to-supabase/index.ts`

---

## Dependencies to Add

```json
{
  "@supabase/supabase-js": "^2.39.0",
  "@supabase/ssr": "^0.1.0",
  "@dnd-kit/core": "^6.1.0",
  "@dnd-kit/sortable": "^8.0.0",
  "@uiw/react-md-editor": "^4.0.4",
  "react-dropzone": "^14.2.3",
  "react-hook-form": "^7.49.2",
  "zod": "^3.22.4"
}
```

---

## Implementation Phases

### Phase 1: Foundation
- Set up Supabase tables and RLS policies
- Generate TypeScript types
- Create `lib/supabase/` utilities
- Implement auth flow
- Create `/admin/login` page
- Create admin layout with auth guard

### Phase 2: Migration
- Write migration script
- Run migration (49 posts)
- Upload images to Supabase Storage
- Verify migration

### Phase 3: Public Reading
- Create `lib/posts/queries.ts`
- Create BlockRenderer component
- Update homepage to fetch from Supabase
- Update blog post page to use BlockRenderer
- Archive `_posts/` directory

### Phase 4: Admin Post Management
- Post list page with filters
- Create/edit post metadata
- Publish/unpublish functionality
- Delete with confirmation

### Phase 5: Block Editor
- Set up dnd-kit for drag-and-drop
- Implement MarkdownBlock with markdown editor
- Implement ImageBlock with upload
- Implement VideoBlock, EmbedBlock, CodeBlock
- Block reordering and deletion
- Auto-save functionality

### Phase 6: Asset Management
- Media library page
- Drag-and-drop upload
- Asset picker modal for editor

### Phase 7: Interactive Components
- Component registry system
- `/interactions/[slug]` route
- InteractiveBlock in editor
- Example components

### Phase 8: Polish
- Version history
- Keyboard shortcuts
- Mobile responsive admin
- Error handling

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://xgnfxghqiwsjhdhqmbus.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
ADMIN_EMAIL=<your-email>
NEXT_PUBLIC_SITE_URL=https://oisinthomas.com
```

---

## Verification Plan

1. **After migration**: Compare post count (49), verify slugs match
2. **After Phase 3**: All existing blog URLs work, content renders correctly
3. **After Phase 5**: Create a test post with multiple block types
4. **End-to-end**: Create, edit, publish, view a post through full lifecycle
