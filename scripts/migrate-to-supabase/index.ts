/**
 * Migration Script: File-based Posts to Supabase
 *
 * This script migrates all markdown posts from _posts/ to Supabase,
 * creating post records and content nodes.
 *
 * Run with: npx tsx scripts/migrate-to-supabase/index.ts
 *
 * Requirements:
 * - Set environment variables in .env.local
 * - Run SQL migrations in Supabase first
 * - Create 'blog-assets' storage bucket in Supabase
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../lib/supabase/types';

// Load environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nMake sure these are set in your .env.local file');
  process.exit(1);
}

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface PostFrontMatter {
  title: string;
  description: string;
  updatedAt: string;
  publishedAt: string;
  author: string;
  image: string;
  majorTag: 'Thoughts' | 'Tinkering' | 'Translations';
  subTag: string;
  language: 'en' | 'ga';
  tags: string[];
  available?: boolean;
  source?: string;
  substackUrl?: string;
}

interface MigrationResult {
  slug: string;
  success: boolean;
  error?: string;
}

async function readPostFiles(): Promise<
  Array<{ slug: string; frontMatter: PostFrontMatter; content: string }>
> {
  const postsDirectory = path.join(process.cwd(), '_posts');
  const filenames = fs.readdirSync(postsDirectory);

  return filenames
    .filter((filename) => filename.endsWith('.md'))
    .map((filename) => {
      const filePath = path.join(postsDirectory, filename);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContents);

      return {
        slug: filename.replace('.md', ''),
        frontMatter: data as PostFrontMatter,
        content: content.trim(),
      };
    });
}

async function uploadImage(
  imagePath: string
): Promise<{ assetId: string; storagePath: string } | null> {
  // Skip if no image or if it's an external URL
  if (!imagePath || imagePath.startsWith('http')) {
    return null;
  }

  // Image path is relative to public folder
  const localPath = path.join(process.cwd(), 'public', imagePath);

  if (!fs.existsSync(localPath)) {
    console.warn(`  Image not found: ${localPath}`);
    return null;
  }

  const filename = path.basename(imagePath);
  const fileBuffer = fs.readFileSync(localPath);
  const mimeType = getMimeType(filename);
  const storagePath = `posts/${filename}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('blog-assets')
    .upload(storagePath, fileBuffer, {
      contentType: mimeType,
      upsert: true,
    });

  if (uploadError) {
    console.warn(`  Failed to upload image ${filename}:`, uploadError.message);
    return null;
  }

  // Create asset record
  const { data: asset, error: assetError } = await supabase
    .from('assets')
    .insert({
      storage_path: storagePath,
      bucket: 'blog-assets',
      filename,
      mime_type: mimeType,
      file_size: fileBuffer.length,
    })
    .select()
    .single();

  if (assetError) {
    console.warn(`  Failed to create asset record:`, assetError.message);
    return null;
  }

  return { assetId: asset.id, storagePath };
}

function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

async function migratePost(
  slug: string,
  frontMatter: PostFrontMatter,
  content: string
): Promise<MigrationResult> {
  try {
    // Check if post already exists
    const { data: existing } = await supabase
      .from('posts')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) {
      console.log(`  Skipping ${slug} (already exists)`);
      return { slug, success: true };
    }

    // Upload featured image if exists
    let featuredImageId: string | undefined;
    if (frontMatter.image) {
      const imageResult = await uploadImage(frontMatter.image);
      if (imageResult) {
        featuredImageId = imageResult.assetId;
        console.log(`  Uploaded image: ${frontMatter.image}`);
      }
    }

    // Determine status based on available flag
    const status =
      frontMatter.available === false ? 'archived' : 'published';

    // Create post record
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        slug,
        title: frontMatter.title,
        description: frontMatter.description || null,
        major_tag: frontMatter.majorTag,
        sub_tag: frontMatter.subTag || null,
        language: frontMatter.language || 'en',
        tags: frontMatter.tags || [],
        author: frontMatter.author || 'Oisin Thomas',
        status,
        published_at: frontMatter.publishedAt
          ? new Date(frontMatter.publishedAt).toISOString()
          : null,
        featured_image_id: featuredImageId || null,
        source: frontMatter.source || null,
        source_url: frontMatter.substackUrl || null,
      })
      .select()
      .single();

    if (postError) {
      throw new Error(`Failed to create post: ${postError.message}`);
    }

    // Create markdown node with full content
    const { error: nodeError } = await supabase.from('nodes').insert({
      post_id: post.id,
      type: 'markdown',
      position: 0,
      content,
      metadata: {},
    });

    if (nodeError) {
      throw new Error(`Failed to create node: ${nodeError.message}`);
    }

    console.log(`  Migrated: ${slug}`);
    return { slug, success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`  Failed: ${slug} - ${message}`);
    return { slug, success: false, error: message };
  }
}

async function main() {
  console.log('Starting migration from _posts/ to Supabase...\n');

  // Read all post files
  const posts = await readPostFiles();
  console.log(`Found ${posts.length} posts to migrate\n`);

  // Filter available posts only (optional: include all)
  const availablePosts = posts.filter(
    (p) => p.frontMatter.available !== false
  );
  console.log(`${availablePosts.length} posts are available for migration\n`);

  // Migrate each post
  const results: MigrationResult[] = [];

  for (const { slug, frontMatter, content } of posts) {
    console.log(`Processing: ${slug}`);
    const result = await migratePost(slug, frontMatter, content);
    results.push(result);
  }

  // Summary
  console.log('\n--- Migration Summary ---');
  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log(`Total: ${results.length}`);
  console.log(`Successful: ${successful.length}`);
  console.log(`Failed: ${failed.length}`);

  if (failed.length > 0) {
    console.log('\nFailed posts:');
    failed.forEach((r) => console.log(`  - ${r.slug}: ${r.error}`));
  }

  // Verify counts
  const { count: postCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true });

  const { count: nodeCount } = await supabase
    .from('nodes')
    .select('*', { count: 'exact', head: true });

  console.log(`\nDatabase verification:`);
  console.log(`  Posts in DB: ${postCount}`);
  console.log(`  Nodes in DB: ${nodeCount}`);
}

main().catch(console.error);
