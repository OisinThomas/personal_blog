-- Row Level Security Policies
-- Run this after 001_initial_schema.sql

-- ============================================
-- ENABLE RLS
-- ============================================
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactive_components ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POSTS POLICIES
-- ============================================

-- Public can read published posts
CREATE POLICY "Public can read published posts"
  ON posts FOR SELECT
  USING (status = 'published');

-- Authenticated users can read all posts (for admin)
CREATE POLICY "Authenticated users can read all posts"
  ON posts FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can insert posts
CREATE POLICY "Authenticated users can insert posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can update posts
CREATE POLICY "Authenticated users can update posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated users can delete posts
CREATE POLICY "Authenticated users can delete posts"
  ON posts FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- NODES POLICIES
-- ============================================

-- Public can read nodes of published posts
CREATE POLICY "Public can read nodes of published posts"
  ON nodes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = nodes.post_id
      AND posts.status = 'published'
    )
  );

-- Authenticated users can read all nodes
CREATE POLICY "Authenticated users can read all nodes"
  ON nodes FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can insert nodes
CREATE POLICY "Authenticated users can insert nodes"
  ON nodes FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can update nodes
CREATE POLICY "Authenticated users can update nodes"
  ON nodes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated users can delete nodes
CREATE POLICY "Authenticated users can delete nodes"
  ON nodes FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- ASSETS POLICIES
-- ============================================

-- Public can read all assets (images are public)
CREATE POLICY "Public can read assets"
  ON assets FOR SELECT
  USING (true);

-- Authenticated users can insert assets
CREATE POLICY "Authenticated users can insert assets"
  ON assets FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can update assets
CREATE POLICY "Authenticated users can update assets"
  ON assets FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated users can delete assets
CREATE POLICY "Authenticated users can delete assets"
  ON assets FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- INTERACTIVE COMPONENTS POLICIES
-- ============================================

-- Public can read available components
CREATE POLICY "Public can read available components"
  ON interactive_components FOR SELECT
  USING (available = true);

-- Authenticated users can read all components
CREATE POLICY "Authenticated users can read all components"
  ON interactive_components FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can manage components
CREATE POLICY "Authenticated users can insert components"
  ON interactive_components FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update components"
  ON interactive_components FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete components"
  ON interactive_components FOR DELETE
  TO authenticated
  USING (true);
