-- Blog CMS Initial Schema
-- Run this in your Supabase SQL editor

-- ============================================
-- ASSETS TABLE (must be created first for FK references)
-- ============================================
CREATE TABLE IF NOT EXISTS assets (
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

-- ============================================
-- POSTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS posts (
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
  featured_image_id UUID REFERENCES assets(id) ON DELETE SET NULL,
  source TEXT,
  source_url TEXT
);

-- ============================================
-- NODE TYPE ENUM
-- ============================================
DO $$ BEGIN
  CREATE TYPE node_type AS ENUM (
    'markdown', 'image', 'video', 'embed', 'interactive', 'code', 'divider'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- NODES TABLE (Content Blocks)
-- ============================================
CREATE TABLE IF NOT EXISTS nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  type node_type NOT NULL,
  position INTEGER NOT NULL,
  content TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- INTERACTIVE COMPONENTS REGISTRY
-- ============================================
CREATE TABLE IF NOT EXISTS interactive_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  component_path TEXT NOT NULL,
  default_props JSONB DEFAULT '{}',
  available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_major_tag ON posts(major_tag);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_nodes_post_id ON nodes(post_id);
CREATE INDEX IF NOT EXISTS idx_nodes_position ON nodes(post_id, position);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_nodes_updated_at ON nodes;
CREATE TRIGGER update_nodes_updated_at
    BEFORE UPDATE ON nodes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
