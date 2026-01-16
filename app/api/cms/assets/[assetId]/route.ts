import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateApiKey, jsonResponse, errorResponse } from '@/lib/api/auth';
import type { Asset } from '@/lib/api/types';

interface RouteParams {
  params: Promise<{
    assetId: string;
  }>;
}

/**
 * Get an asset by ID
 */
async function getAssetById(assetId: string): Promise<Asset | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('id', assetId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data as Asset;
}

/**
 * GET /api/cms/assets/[assetId]
 * Get asset details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  try {
    const { assetId } = await params;

    const asset = await getAssetById(assetId);
    if (!asset) {
      return errorResponse('Asset not found', 404);
    }

    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${asset.bucket}/${asset.storage_path}`;

    return jsonResponse({
      data: {
        asset,
        url,
      },
    });
  } catch (error) {
    console.error('Error fetching asset:', error);
    return errorResponse('Failed to fetch asset', 500, error);
  }
}

/**
 * DELETE /api/cms/assets/[assetId]
 * Delete an asset (both storage file and database record)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  try {
    const { assetId } = await params;
    const supabase = await createClient();

    // Get asset first
    const asset = await getAssetById(assetId);
    if (!asset) {
      return errorResponse('Asset not found', 404);
    }

    // Check if asset is in use by any nodes
    const { data: nodes, error: nodesError } = await supabase
      .from('nodes')
      .select('id')
      .eq('asset_id', assetId)
      .limit(1);

    if (nodesError) {
      throw nodesError;
    }

    if (nodes && nodes.length > 0) {
      return errorResponse(
        'Asset is in use by one or more nodes. Remove it from all nodes before deleting.',
        409
      );
    }

    // Check if asset is used as featured image
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id')
      .eq('featured_image_id', assetId)
      .limit(1);

    if (postsError) {
      throw postsError;
    }

    if (posts && posts.length > 0) {
      return errorResponse(
        'Asset is used as a featured image. Remove it from the post before deleting.',
        409
      );
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(asset.bucket)
      .remove([asset.storage_path]);

    if (storageError) {
      console.error('Storage deletion error:', storageError);
      // Continue with database deletion even if storage fails
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('assets')
      .delete()
      .eq('id', assetId);

    if (deleteError) {
      throw deleteError;
    }

    return jsonResponse({
      data: { message: 'Asset deleted successfully' },
    });
  } catch (error) {
    console.error('Error deleting asset:', error);
    return errorResponse('Failed to delete asset', 500, error);
  }
}
