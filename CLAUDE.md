# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start development server at localhost:3000

# Build & Production
npm run build        # Build for production
npm run start        # Start production server

# Linting
npm run lint         # Run ESLint
```

## Architecture

This is a Next.js 15 personal blog using the App Router with React 19.

### Content System
- **Database**: Supabase (PostgreSQL) stores all blog posts and content
- **Content structure**: Posts contain ordered nodes (markdown, image, video, embed, code, divider, interactive)
- **Assets**: Images and media stored in Supabase Storage, referenced by `assets` table
- **Post schema**: slug, title, description, major_tag, sub_tag, language, tags, author, status, published_at, featured_image_id
- **Node types**: `markdown`, `image`, `video`, `embed`, `interactive`, `code`, `divider`
- **Post categories**: Posts organized by `major_tag` into "Thoughts", "Tinkering", and "Translations"
- **Multilingual**: Posts can be in English (`language: en`) or Irish (`language: ga`)

### Key Files
- `lib/posts/queries.ts` - Post fetching from Supabase (`getAllPosts`, `getPostBySlug`, `getPostWithNodes`, etc.)
- `lib/posts/mutations.ts` - Post/node creation and updates
- `lib/supabase/types.ts` - TypeScript types for database schema (Post, Node, Asset, etc.)
- `lib/supabase/server.ts` - Server-side Supabase client
- `lib/supabase/client.ts` - Client-side Supabase client
- `lib/utils.ts` - Utility functions (`cn` for classnames, `markdownToHtml` for rendering)
- `lib/siteMetaData.js` - Site configuration (title, author, social links, URLs)
- `lib/ThemeContext.tsx` - Dark/light theme provider

### Admin CMS
- `/admin` - Dashboard
- `/admin/posts` - Post management (list, create, edit)
- `/admin/posts/new` - Create new post
- `/admin/posts/[slug]` - Edit existing post with block-based editor
- `/admin/assets` - Asset management
- `/admin/login` - Supabase authentication
- API routes in `app/api/cms/` handle CRUD operations

### Routing
- `/` - Homepage with posts grouped by majorTag
- `/blog/[slug]` - Individual blog post (statically generated with ISR)
- `/all` - All posts listing
- `/about`, `/blogroll`, `/privacy` - Static pages

### Content Rendering
- `components/blocks/` - Block components for each node type (MarkdownBlock, ImageBlock, etc.)
- `lib/api/markdown-transform.ts` - Transforms markdown content into structured nodes

### Styling
- Tailwind CSS with custom color system via CSS variables (see `globals.css`)
- Dark mode via `class` strategy - theme toggle adds/removes `dark` class
- Custom colors: `primary`, `secondary`, `tertiary`, `card-bg`, `card-border`, `hover-bg`

### Analytics
- PostHog integration with EU endpoints (configured via rewrites in `next.config.mjs`)
- Cookie consent component for GDPR compliance

### Path Aliases
- `@/*` maps to project root (configured in tsconfig.json)

### Environment Variables
Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (for server-side operations)
