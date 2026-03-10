import { NextRequest, NextResponse } from 'next/server';
import { getSubscriberByToken, getSubscriberChannels, getChannels } from '@/lib/newsletter/queries';
import { setSubscriberChannels, unsubscribeSubscriber, reactivateSubscriber } from '@/lib/newsletter/mutations';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }

  try {
    const subscriber = await getSubscriberByToken('unsubscribe_token', token);

    if (!subscriber) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404 });
    }

    const [channels, selectedChannelIds] = await Promise.all([
      getChannels(),
      getSubscriberChannels(subscriber.id),
    ]);

    return NextResponse.json({
      subscriber: {
        email: subscriber.email,
        status: subscriber.status,
      },
      channels,
      selectedChannelIds,
    });
  } catch (error) {
    console.error('Manage subscription GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }

  try {
    const subscriber = await getSubscriberByToken('unsubscribe_token', token);

    if (!subscriber) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404 });
    }

    const body = await request.json();
    const { channel_ids } = body;

    if (!Array.isArray(channel_ids)) {
      return NextResponse.json({ error: 'channel_ids must be an array' }, { status: 400 });
    }

    if (channel_ids.length === 0) {
      // Unsubscribe
      await unsubscribeSubscriber(subscriber.id);
      return NextResponse.json({ message: 'Unsubscribed successfully' });
    }

    // If currently unsubscribed, reactivate
    if (subscriber.status === 'unsubscribed') {
      await reactivateSubscriber(subscriber.id, channel_ids);
    } else {
      await setSubscriberChannels(subscriber.id, channel_ids);
    }

    return NextResponse.json({ message: 'Preferences updated' });
  } catch (error) {
    console.error('Manage subscription PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
