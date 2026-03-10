import { createServiceClient } from '@/lib/supabase/server';
import type { Channel, Subscriber, EmailSend } from '@/lib/supabase/types';

export async function getChannels(): Promise<Channel[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('channels')
    .select('*')
    .order('position', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getSubscribers(channelId?: string): Promise<Subscriber[]> {
  const supabase = createServiceClient();

  if (channelId) {
    const { data, error } = await supabase
      .from('subscribers')
      .select('*, subscriber_channels!inner(channel_id)')
      .eq('subscriber_channels.channel_id', channelId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(({ subscriber_channels: _, ...sub }) => sub) as Subscriber[];
  }

  const { data, error } = await supabase
    .from('subscribers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getSubscriberByEmail(email: string): Promise<Subscriber | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('subscribers')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getSubscriberByToken(
  tokenType: 'confirmation_token' | 'unsubscribe_token',
  token: string
): Promise<Subscriber | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('subscribers')
    .select('*')
    .eq(tokenType, token)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getSubscriberChannels(subscriberId: string): Promise<string[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('subscriber_channels')
    .select('channel_id')
    .eq('subscriber_id', subscriberId);

  if (error) throw error;
  return (data ?? []).map((row) => row.channel_id);
}

export async function getPostChannels(postId: string): Promise<string[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('post_channels')
    .select('channel_id')
    .eq('post_id', postId);

  if (error) throw error;
  return (data ?? []).map((row) => row.channel_id);
}

export async function getEmailSendForPost(postId: string): Promise<EmailSend | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('email_sends')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getSubscriberCounts(): Promise<{
  total: number;
  confirmed: number;
  byChannel: { channel_id: string; channel_name: string; count: number }[];
}> {
  const supabase = createServiceClient();

  const [totalResult, confirmedResult, channels] = await Promise.all([
    supabase.from('subscribers').select('id', { count: 'exact', head: true }),
    supabase.from('subscribers').select('id', { count: 'exact', head: true }).eq('status', 'confirmed'),
    getChannels(),
  ]);

  const byChannel: { channel_id: string; channel_name: string; count: number }[] = [];
  for (const channel of channels) {
    const { count } = await supabase
      .from('subscriber_channels')
      .select('subscriber_id, subscribers!inner(status)', { count: 'exact', head: true })
      .eq('channel_id', channel.id)
      .eq('subscribers.status', 'confirmed');

    byChannel.push({
      channel_id: channel.id,
      channel_name: channel.name,
      count: count ?? 0,
    });
  }

  return {
    total: totalResult.count ?? 0,
    confirmed: confirmedResult.count ?? 0,
    byChannel,
  };
}

export async function getConfirmedSubscribersForChannels(
  channelIds: string[]
): Promise<Subscriber[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('subscribers')
    .select('*, subscriber_channels!inner(channel_id)')
    .eq('status', 'confirmed')
    .in('subscriber_channels.channel_id', channelIds);

  if (error) throw error;

  // Deduplicate subscribers (may appear in multiple channels)
  const seen = new Set<string>();
  const unique: Subscriber[] = [];
  for (const row of data ?? []) {
    const { subscriber_channels: _, ...sub } = row;
    if (!seen.has(sub.id)) {
      seen.add(sub.id);
      unique.push(sub as Subscriber);
    }
  }
  return unique;
}

export async function getEmailSends(): Promise<(EmailSend & { post_title: string; open_count: number })[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('email_sends')
    .select('*, posts(title)')
    .order('created_at', { ascending: false });

  if (error) throw error;

  const sends = data ?? [];
  const result: (EmailSend & { post_title: string; open_count: number })[] = [];

  for (const send of sends) {
    const { posts, ...rest } = send;
    const { count } = await supabase
      .from('email_opens')
      .select('id', { count: 'exact', head: true })
      .eq('email_send_id', send.id);

    result.push({
      ...rest,
      post_title: (posts as { title: string } | null)?.title ?? 'Unknown',
      open_count: count ?? 0,
    });
  }

  return result;
}
