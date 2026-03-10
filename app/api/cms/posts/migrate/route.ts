import { NextRequest } from 'next/server';
import { validateApiKey, jsonResponse, errorResponse } from '@/lib/api/auth';
import { createServiceClient } from '@/lib/supabase/server';
import { validateEditorState } from '@/lib/api/validation';
import { convertNodesToLexicalState } from '@/lib/api/nodes-to-lexical';
import type { NodeWithAsset } from '@/lib/supabase/types';

interface MigrationResult {
  slug: string;
  title: string;
  status: 'success' | 'dry_run_ok' | 'failed' | 'skipped';
  reason?: string;
  nodeCount: number;
  nodeTypes?: Record<string, number>;
  lexicalChildCount?: number;
}

export async function POST(request: NextRequest) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const dryRun = searchParams.get('dry_run') === 'true';
  const singleSlug = searchParams.get('slug');

  try {
    const supabase = createServiceClient();

    // Fetch all legacy posts (editor_state IS NULL)
    let postsQuery = supabase
      .from('posts')
      .select('id, slug, title, status')
      .is('editor_state', null);

    if (singleSlug) {
      postsQuery = postsQuery.eq('slug', singleSlug);
    }

    const { data: posts, error: postsError } = await postsQuery;

    if (postsError) {
      return errorResponse('Failed to fetch legacy posts', 500, postsError.message);
    }

    if (!posts || posts.length === 0) {
      return jsonResponse({
        message: singleSlug
          ? `Post '${singleSlug}' not found or already migrated`
          : 'No legacy posts found to migrate',
        results: [],
        summary: { total: 0, succeeded: 0, failed: 0, skipped: 0 },
      });
    }

    // Fetch all nodes for these posts in one query
    const postIds = posts.map(p => p.id);
    const { data: allNodes, error: nodesError } = await supabase
      .from('nodes')
      .select('*, asset:assets(*)')
      .in('post_id', postIds)
      .order('position', { ascending: true });

    if (nodesError) {
      return errorResponse('Failed to fetch nodes', 500, nodesError.message);
    }

    // Group nodes by post_id
    const nodesByPost = new Map<string, NodeWithAsset[]>();
    for (const node of (allNodes as NodeWithAsset[])) {
      const existing = nodesByPost.get(node.post_id) ?? [];
      existing.push(node);
      nodesByPost.set(node.post_id, existing);
    }

    // Convert each post
    const results: MigrationResult[] = [];
    let succeeded = 0;
    let failed = 0;
    let skipped = 0;

    for (const post of posts) {
      const nodes = nodesByPost.get(post.id) ?? [];

      if (nodes.length === 0) {
        results.push({
          slug: post.slug,
          title: post.title,
          status: 'skipped',
          reason: 'No nodes found',
          nodeCount: 0,
        });
        skipped++;
        continue;
      }

      try {
        const editorState = convertNodesToLexicalState(nodes);

        const validation = validateEditorState(editorState);
        if (!validation.valid) {
          results.push({
            slug: post.slug,
            title: post.title,
            status: 'failed',
            reason: `Validation failed: ${validation.error}`,
            nodeCount: nodes.length,
          });
          failed++;
          continue;
        }

        if (!dryRun) {
          const { error: updateError } = await supabase
            .from('posts')
            .update({ editor_state: editorState })
            .eq('id', post.id);

          if (updateError) {
            results.push({
              slug: post.slug,
              title: post.title,
              status: 'failed',
              reason: `Database update failed: ${updateError.message}`,
              nodeCount: nodes.length,
            });
            failed++;
            continue;
          }
        }

        const nodeTypes: Record<string, number> = {};
        for (const node of nodes) {
          nodeTypes[node.type] = (nodeTypes[node.type] || 0) + 1;
        }

        results.push({
          slug: post.slug,
          title: post.title,
          status: dryRun ? 'dry_run_ok' : 'success',
          nodeCount: nodes.length,
          nodeTypes,
          lexicalChildCount: (
            (editorState.root as { children: unknown[] }).children
          ).length,
        });
        succeeded++;
      } catch (err) {
        results.push({
          slug: post.slug,
          title: post.title,
          status: 'failed',
          reason: `Unexpected error: ${err instanceof Error ? err.message : String(err)}`,
          nodeCount: nodes.length,
        });
        failed++;
      }
    }

    return jsonResponse({
      message: dryRun
        ? `Dry run complete. ${succeeded} posts would be migrated.`
        : `Migration complete. ${succeeded} posts migrated.`,
      dry_run: dryRun,
      results,
      summary: {
        total: posts.length,
        succeeded,
        failed,
        skipped,
      },
    });
  } catch (error) {
    console.error('Migration error:', error);
    return errorResponse('Migration failed', 500);
  }
}
