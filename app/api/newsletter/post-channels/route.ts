import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPostChannels, getConfirmedSubscribersForChannels } from '@/lib/newsletter/queries';
import { setPostChannels } from '@/lib/newsletter/mutations';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const postId = request.nextUrl.searchParams.get('post_id');
  if (!postId) return NextResponse.json({ error: 'post_id required' }, { status: 400 });

  const channelIds = await getPostChannels(postId);
  return NextResponse.json({ channel_ids: channelIds });
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { post_id, channel_ids } = body;

  if (!post_id || !Array.isArray(channel_ids)) {
    return NextResponse.json({ error: 'post_id and channel_ids required' }, { status: 400 });
  }

  await setPostChannels(post_id, channel_ids);

  // Return subscriber count for the selected channels
  const subscribers = await getConfirmedSubscribersForChannels(channel_ids);

  return NextResponse.json({ success: true, subscriber_count: subscribers.length });
}
