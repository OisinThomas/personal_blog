import { NextRequest, NextResponse } from 'next/server';
import { getSubscriberByToken } from '@/lib/newsletter/queries';
import { unsubscribeSubscriber } from '@/lib/newsletter/mutations';

const SITE_URL = 'https://caideiseach.com';

// GET: clicked from email link
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(`${SITE_URL}/?unsubscribe_error=invalid`);
  }

  try {
    const subscriber = await getSubscriberByToken('unsubscribe_token', token);

    if (!subscriber) {
      return NextResponse.redirect(`${SITE_URL}/?unsubscribe_error=invalid`);
    }

    if (subscriber.status === 'unsubscribed') {
      return NextResponse.redirect(`${SITE_URL}/subscription?token=${token}&unsubscribed=true`);
    }

    await unsubscribeSubscriber(subscriber.id);
    return NextResponse.redirect(`${SITE_URL}/subscription?token=${token}&unsubscribed=true`);
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.redirect(`${SITE_URL}/?unsubscribe_error=failed`);
  }
}

// POST: RFC 8058 one-click unsubscribe from email clients
export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }

  try {
    const subscriber = await getSubscriberByToken('unsubscribe_token', token);

    if (!subscriber) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404 });
    }

    if (subscriber.status !== 'unsubscribed') {
      await unsubscribeSubscriber(subscriber.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('One-click unsubscribe error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
