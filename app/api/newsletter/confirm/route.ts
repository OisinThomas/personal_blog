import { NextRequest, NextResponse } from 'next/server';
import { getSubscriberByToken } from '@/lib/newsletter/queries';
import { confirmSubscriber } from '@/lib/newsletter/mutations';

const SITE_URL = 'https://caideiseach.com';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(`${SITE_URL}/?subscribe_error=invalid`);
  }

  try {
    const subscriber = await getSubscriberByToken('confirmation_token', token);

    if (!subscriber) {
      return NextResponse.redirect(`${SITE_URL}/?subscribe_error=invalid`);
    }

    if (subscriber.status === 'confirmed') {
      return NextResponse.redirect(`${SITE_URL}/?subscribed=already`);
    }

    await confirmSubscriber(subscriber.id);
    return NextResponse.redirect(`${SITE_URL}/?subscribed=true`);
  } catch (error) {
    console.error('Confirm error:', error);
    return NextResponse.redirect(`${SITE_URL}/?subscribe_error=failed`);
  }
}
