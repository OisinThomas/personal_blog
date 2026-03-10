import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getPostChannels, getConfirmedSubscribersForChannels, getEmailSendForPost } from '@/lib/newsletter/queries';
import { createEmailSend, updateEmailSend } from '@/lib/newsletter/mutations';
import { getResendClient } from '@/lib/email/resend';
import { postNotificationEmailHtml, getEmailHeaders } from '@/lib/email/templates';
import { lexicalToEmailHtml } from '@/lib/email/lexical-to-email-html';

const SITE_URL = 'https://oisinthomas.com';
const FROM_EMAIL = 'Oisín Thomas <subscriptions@caideiseach.com>';
const REPLY_TO = 'oisinthomas99@gmail.com';

export async function POST(request: NextRequest) {
  try {
    // Auth check — require Supabase session
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { post_id } = body;

    if (!post_id || typeof post_id !== 'string') {
      return NextResponse.json({ error: 'post_id is required' }, { status: 400 });
    }

    // Fetch the post
    const serviceClient = createServiceClient();
    const { data: post, error: postError } = await serviceClient
      .from('posts')
      .select('*')
      .eq('id', post_id)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.status !== 'published') {
      return NextResponse.json({ error: 'Post must be published before sending' }, { status: 400 });
    }

    // Check channels
    const channelIds = await getPostChannels(post_id);
    if (channelIds.length === 0) {
      return NextResponse.json({ error: 'No channels attached to this post' }, { status: 400 });
    }

    // Check for existing send
    const existingSend = await getEmailSendForPost(post_id);
    if (existingSend && existingSend.status === 'sent') {
      return NextResponse.json({ error: 'Email already sent for this post' }, { status: 400 });
    }

    // Get subscribers
    const subscribers = await getConfirmedSubscribersForChannels(channelIds);
    if (subscribers.length === 0) {
      return NextResponse.json({ error: 'No confirmed subscribers for these channels' }, { status: 400 });
    }

    // Create email send record
    const emailSend = await createEmailSend(post_id, subscribers.length);

    // Convert post content to email HTML
    const contentHtml = post.editor_state
      ? lexicalToEmailHtml(post.editor_state, post.slug, post.language ?? 'en')
      : '';

    // Send emails in batches of 100
    try {
      await updateEmailSend(emailSend.id, {
        status: 'sending',
        started_at: new Date().toISOString(),
      });

      const resend = getResendClient();
      const BATCH_SIZE = 100;

      for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
        const batch = subscribers.slice(i, i + BATCH_SIZE);
        const emails = batch.map((sub) => {
          const unsubscribeUrl = `${SITE_URL}/api/newsletter/unsubscribe?token=${sub.unsubscribe_token}`;
          const manageUrl = `${SITE_URL}/subscription?token=${sub.unsubscribe_token}`;
          const trackingPixelUrl = `${SITE_URL}/api/newsletter/track/${emailSend.id}/${sub.id}/pixel.png`;

          return {
            from: FROM_EMAIL,
            to: sub.email,
            replyTo: REPLY_TO,
            subject: post.title,
            html: postNotificationEmailHtml({
              post: { title: post.title, slug: post.slug, description: post.description },
              contentHtml,
              unsubscribeUrl,
              manageUrl,
              trackingPixelUrl,
            }),
            headers: getEmailHeaders(unsubscribeUrl),
          };
        });

        await resend.batch.send(emails);
      }

      await updateEmailSend(emailSend.id, {
        status: 'sent',
        completed_at: new Date().toISOString(),
      });

      return NextResponse.json({
        message: `Email sent to ${subscribers.length} subscribers`,
        send_id: emailSend.id,
      });
    } catch (sendError) {
      console.error('Send error:', sendError);
      await updateEmailSend(emailSend.id, {
        status: 'failed',
        error_message: sendError instanceof Error ? sendError.message : 'Unknown error',
        completed_at: new Date().toISOString(),
      });

      return NextResponse.json({ error: 'Failed to send emails' }, { status: 500 });
    }
  } catch (error) {
    console.error('Newsletter send error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
