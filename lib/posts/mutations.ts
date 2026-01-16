import { createClient } from '@/lib/supabase/server';
import type {
  Post,
  Node,
  CreatePostInput,
  UpdatePostInput,
  CreateNodeInput,
  UpdateNodeInput,
} from '@/lib/supabase/types';

// Post mutations

export async function createPost(input: CreatePostInput): Promise<Post> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('posts')
    .insert(input)
    .select()
    .single();

  if (error) {
    console.error('Error creating post:', error);
    throw error;
  }

  return data;
}

export async function updatePost(input: UpdatePostInput): Promise<Post> {
  const { id, ...updates } = input;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating post:', error);
    throw error;
  }

  return data;
}

export async function updatePostBySlug(
  slug: string,
  updates: Partial<CreatePostInput>
): Promise<Post> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('slug', slug)
    .select()
    .single();

  if (error) {
    console.error('Error updating post:', error);
    throw error;
  }

  return data;
}

export async function deletePost(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from('posts').delete().eq('id', id);

  if (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
}

export async function publishPost(id: string): Promise<Post> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('posts')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error publishing post:', error);
    throw error;
  }

  return data;
}

export async function unpublishPost(id: string): Promise<Post> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('posts')
    .update({
      status: 'draft',
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error unpublishing post:', error);
    throw error;
  }

  return data;
}

// Node mutations

export async function createNode(input: CreateNodeInput): Promise<Node> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('nodes')
    .insert(input)
    .select()
    .single();

  if (error) {
    console.error('Error creating node:', error);
    throw error;
  }

  return data;
}

export async function createNodes(inputs: CreateNodeInput[]): Promise<Node[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('nodes')
    .insert(inputs)
    .select();

  if (error) {
    console.error('Error creating nodes:', error);
    throw error;
  }

  return data;
}

export async function updateNode(input: UpdateNodeInput): Promise<Node> {
  const { id, ...updates } = input;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('nodes')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating node:', error);
    throw error;
  }

  return data;
}

export async function deleteNode(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from('nodes').delete().eq('id', id);

  if (error) {
    console.error('Error deleting node:', error);
    throw error;
  }
}

export async function reorderNodes(
  postId: string,
  nodeIds: string[]
): Promise<void> {
  const supabase = await createClient();

  // Update positions in a transaction-like manner
  const updates = nodeIds.map((id, index) =>
    supabase.from('nodes').update({ position: index }).eq('id', id)
  );

  const results = await Promise.all(updates);

  const errors = results.filter((r: { error: unknown }) => r.error);
  if (errors.length > 0) {
    console.error('Error reordering nodes:', errors);
    throw new Error('Failed to reorder nodes');
  }
}

export async function replacePostNodes(
  postId: string,
  nodes: Omit<CreateNodeInput, 'post_id'>[]
): Promise<Node[]> {
  const supabase = await createClient();

  // Delete existing nodes
  const { error: deleteError } = await supabase
    .from('nodes')
    .delete()
    .eq('post_id', postId);

  if (deleteError) {
    console.error('Error deleting existing nodes:', deleteError);
    throw deleteError;
  }

  // Insert new nodes
  if (nodes.length === 0) {
    return [];
  }

  const nodesWithPostId = nodes.map((node, index) => ({
    ...node,
    post_id: postId,
    position: index,
  }));

  const { data, error: insertError } = await supabase
    .from('nodes')
    .insert(nodesWithPostId)
    .select();

  if (insertError) {
    console.error('Error inserting nodes:', insertError);
    throw insertError;
  }

  return data;
}
