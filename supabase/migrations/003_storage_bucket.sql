-- Storage Bucket Setup
-- Run this in Supabase SQL editor or set up via Dashboard

-- Note: Storage buckets are typically created via the Supabase Dashboard
-- or the Management API. This file documents the expected configuration.

-- Bucket: blog-assets
-- Public: Yes (for serving images directly)
-- File size limit: 10MB
-- Allowed MIME types: image/*, video/*

-- If using SQL (requires service role):
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('blog-assets', 'blog-assets', true)
-- ON CONFLICT (id) DO NOTHING;

-- Storage policies (run in SQL editor):

-- Allow public read access to blog-assets bucket
CREATE POLICY "Public can read blog assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-assets');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'blog-assets');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update assets"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'blog-assets');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete assets"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'blog-assets');
