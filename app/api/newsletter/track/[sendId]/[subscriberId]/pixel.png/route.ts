import { NextRequest, NextResponse } from 'next/server';
import { recordEmailOpen } from '@/lib/newsletter/mutations';

// 1x1 transparent PNG (43 bytes)
const TRANSPARENT_PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sendId: string; subscriberId: string }> }
) {
  const { sendId, subscriberId } = await params;

  // Record the open asynchronously — don't block the pixel response
  const userAgent = request.headers.get('user-agent');
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') || null;

  // Fire and forget
  recordEmailOpen(sendId, subscriberId, userAgent, ip).catch((err) => {
    console.error('Failed to record email open:', err);
  });

  return new NextResponse(TRANSPARENT_PIXEL, {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Content-Length': TRANSPARENT_PIXEL.length.toString(),
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
