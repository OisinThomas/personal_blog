import { NextRequest, NextResponse } from 'next/server';
import { getSubscriberByEmail } from '@/lib/newsletter/queries';
import { createSubscriber, reactivateSubscriber, setSubscriberChannels } from '@/lib/newsletter/mutations';
import { getResendClient } from '@/lib/email/resend';
import { welcomeEmailHtml } from '@/lib/email/templates';

const SITE_URL = 'https://caideiseach.com';
const FROM_EMAIL = 'caidéiseach <subscriptions@caideiseach.com>';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// In-memory rate limiting: IP → timestamps
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) ?? [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);
  rateLimitMap.set(ip, recent);
  if (recent.length >= RATE_LIMIT_MAX) return true;
  recent.push(now);
  return false;
}

async function sendWelcomeEmail(email: string, unsubscribeToken: string) {
  try {
    const resend = getResendClient();
    const manageUrl = `${SITE_URL}/subscription?token=${unsubscribeToken}`;
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Welcome to the newsletter!',
      html: welcomeEmailHtml(manageUrl),
    });
  } catch (error) {
    // Don't fail the subscription if the welcome email fails
    console.error('Welcome email error:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, channel_ids } = body;

    // Validate email
    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    // Validate channel_ids
    if (!Array.isArray(channel_ids) || channel_ids.length === 0) {
      return NextResponse.json(
        { error: 'Please select at least one channel.' },
        { status: 400 }
      );
    }

    for (const id of channel_ids) {
      if (typeof id !== 'string') {
        return NextResponse.json({ error: 'Invalid channel ID.' }, { status: 400 });
      }
    }

    // Check if subscriber already exists
    const existing = await getSubscriberByEmail(email);

    if (existing) {
      switch (existing.status) {
        case 'confirmed':
          // Update their channel preferences
          await setSubscriberChannels(existing.id, channel_ids);
          return NextResponse.json(
            { message: 'You are already subscribed! Channel preferences updated.' },
            { status: 200 }
          );

        case 'pending':
          // Shouldn't happen with single opt-in, but handle gracefully
          await setSubscriberChannels(existing.id, channel_ids);
          return NextResponse.json(
            { message: 'Subscribed!' },
            { status: 200 }
          );

        case 'unsubscribed': {
          const reactivated = await reactivateSubscriber(existing.id, channel_ids);
          if (reactivated.unsubscribe_token) {
            await sendWelcomeEmail(email, reactivated.unsubscribe_token);
          }
          return NextResponse.json(
            { message: 'Welcome back! You are now subscribed.' },
            { status: 200 }
          );
        }
      }
    }

    // Create new subscriber (immediately confirmed)
    const subscriber = await createSubscriber(email, channel_ids);
    if (subscriber.unsubscribe_token) {
      await sendWelcomeEmail(email, subscriber.unsubscribe_token);
    }

    return NextResponse.json(
      { message: 'You are now subscribed!' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
