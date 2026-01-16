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
- **Blog posts**: Markdown files in `_posts/` with gray-matter frontmatter
- **Frontmatter schema**: title, description, publishedAt, updatedAt, author, image, majorTag, subTag, language, tags, available (optional)
- **Post categories**: Posts are organized by `majorTag` into "Thoughts", "Tinkering", and "Translations"
- **Multilingual**: Posts can be in English (`language: en`) or Irish (`language: ga`)

### Key Files
- `lib/utils.ts` - Post loading (`getAllPosts`, `getPostBySlug`) and markdown processing with remark/rehype
- `lib/PostData.ts` - Alternative post loading (same functionality, different interface)
- `lib/siteMetaData.js` - Site configuration (title, author, social links, URLs)
- `lib/ThemeContext.tsx` - Dark/light theme provider

### Routing
- `/` - Homepage with posts grouped by majorTag
- `/blog/[slug]` - Individual blog post (statically generated)
- `/all` - All posts listing
- `/about`, `/blogroll`, `/privacy` - Static pages

### Styling
- Tailwind CSS with custom color system via CSS variables (see `globals.css`)
- Dark mode via `class` strategy - theme toggle adds/removes `dark` class
- Custom colors: `primary`, `secondary`, `tertiary`, `card-bg`, `card-border`, `hover-bg`

### Analytics
- PostHog integration with EU endpoints (configured via rewrites in `next.config.mjs`)
- Cookie consent component for GDPR compliance

### Path Aliases
- `@/*` maps to project root (configured in tsconfig.json)
