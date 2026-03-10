import { createServiceClient } from '@/lib/supabase/server';
import type { Subscriber, EmailSend } from '@/lib/supabase/types';

export async function createSubscriber(
  email: string,
  channelIds: string[]
): Promise<Subscriber> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('subscribers')
    .insert({
      email: email.toLowerCase(),
      status: 'confirmed',
      confirmed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  if (channelIds.length > 0) {
    const rows = channelIds.map((channelId) => ({
      subscriber_id: data.id,
      channel_id: channelId,
    }));
    const { error: joinError } = await supabase
      .from('subscriber_channels')
      .insert(rows);

    if (joinError) throw joinError;
  }

  return data;
}

export async function confirmSubscriber(subscriberId: string): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from('subscribers')
    .update({
      status: 'confirmed',
      confirmed_at: new Date().toISOString(),
      confirmation_token: null,
    })
    .eq('id', subscriberId);

  if (error) throw error;
}

export async function unsubscribeSubscriber(subscriberId: string): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from('subscribers')
    .update({
      status: 'unsubscribed',
      unsubscribed_at: new Date().toISOString(),
    })
    .eq('id', subscriberId);

  if (error) throw error;
}

export async function reactivateSubscriber(
  subscriberId: string,
  channelIds: string[]
): Promise<Subscriber> {
  const supabase = createServiceClient();

  // Re-confirm immediately
  const { data, error } = await supabase
    .from('subscribers')
    .update({
      status: 'confirmed',
      confirmed_at: new Date().toISOString(),
      unsubscribe_token: crypto.randomUUID(),
      unsubscribed_at: null,
    })
    .eq('id', subscriberId)
    .select()
    .single();

  if (error) throw error;

  // Replace channel subscriptions
  await supabase
    .from('subscriber_channels')
    .delete()
    .eq('subscriber_id', subscriberId);

  if (channelIds.length > 0) {
    const rows = channelIds.map((channelId) => ({
      subscriber_id: subscriberId,
      channel_id: channelId,
    }));
    const { error: joinError } = await supabase
      .from('subscriber_channels')
      .insert(rows);

    if (joinError) throw joinError;
  }

  return data;
}

export async function setSubscriberChannels(
  subscriberId: string,
  channelIds: string[]
): Promise<void> {
  const supabase = createServiceClient();

  await supabase
    .from('subscriber_channels')
    .delete()
    .eq('subscriber_id', subscriberId);

  if (channelIds.length > 0) {
    const rows = channelIds.map((channelId) => ({
      subscriber_id: subscriberId,
      channel_id: channelId,
    }));
    const { error } = await supabase
      .from('subscriber_channels')
      .insert(rows);

    if (error) throw error;
  }
}

export async function setPostChannels(
  postId: string,
  channelIds: string[]
): Promise<void> {
  const supabase = createServiceClient();

  await supabase
    .from('post_channels')
    .delete()
    .eq('post_id', postId);

  if (channelIds.length > 0) {
    const rows = channelIds.map((channelId) => ({
      post_id: postId,
      channel_id: channelId,
    }));
    const { error } = await supabase
      .from('post_channels')
      .insert(rows);

    if (error) throw error;
  }
}

export async function createEmailSend(postId: string, subscriberCount: number): Promise<EmailSend> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('email_sends')
    .insert({
      post_id: postId,
      subscriber_count: subscriberCount,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateEmailSend(
  sendId: string,
  updates: {
    status?: string;
    started_at?: string;
    completed_at?: string;
    error_message?: string;
  }
): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from('email_sends')
    .update(updates)
    .eq('id', sendId);

  if (error) throw error;
}

export async function recordEmailOpen(
  emailSendId: string,
  subscriberId: string,
  userAgent: string | null,
  ipAddress: string | null
): Promise<void> {
  const supabase = createServiceClient();
  // ON CONFLICT DO NOTHING — only record first open
  await supabase
    .from('email_opens')
    .upsert(
      {
        email_send_id: emailSendId,
        subscriber_id: subscriberId,
        user_agent: userAgent,
        ip_address: ipAddress,
      },
      { onConflict: 'email_send_id,subscriber_id', ignoreDuplicates: true }
    );
}

export async function resendConfirmationToken(subscriberId: string): Promise<string> {
  const supabase = createServiceClient();
  const newToken = crypto.randomUUID();
  const { error } = await supabase
    .from('subscribers')
    .update({ confirmation_token: newToken })
    .eq('id', subscriberId);

  if (error) throw error;
  return newToken;
}
