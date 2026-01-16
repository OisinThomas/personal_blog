import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual, randomUUID } from 'crypto';

const API_KEY_HEADER = 'X-API-Key';

// Generate new ephemeral token on server start
const EPHEMERAL_TOKEN = randomUUID();
let tokenPrinted = false;

/**
 * Prints the ephemeral token to the console once.
 */
function printTokenOnce(): void {
  if (!tokenPrinted) {
    console.log('\n🔑 CMS API Token (valid this session only):');
    console.log(`   ${EPHEMERAL_TOKEN}\n`);
    tokenPrinted = true;
  }
}

/**
 * Checks if the request originates from localhost.
 */
function isLocalhost(request: NextRequest): boolean {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() ||
             request.headers.get('x-real-ip') ||
             'unknown';

  const localhostIPs = ['127.0.0.1', '::1', 'localhost', '::ffff:127.0.0.1'];
  return localhostIPs.includes(ip);
}

/**
 * Performs timing-safe string comparison to prevent timing attacks.
 */
function timingSafeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * Validates the API key from the request headers.
 * Returns null if valid, or an error response if invalid.
 *
 * Security model:
 * - API only accessible from localhost
 * - Ephemeral token generated on each server start (printed to console)
 */
export function validateApiKey(request: NextRequest): NextResponse | null {
  // Print token on first request
  printTokenOnce();

  // Block non-localhost requests
  if (!isLocalhost(request)) {
    return NextResponse.json(
      { error: 'API only accessible from localhost' },
      { status: 403 }
    );
  }

  const apiKey = request.headers.get(API_KEY_HEADER);

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing API key. Include X-API-Key header.' },
      { status: 401 }
    );
  }

  if (!timingSafeCompare(apiKey, EPHEMERAL_TOKEN)) {
    return NextResponse.json(
      { error: 'Invalid API key' },
      { status: 403 }
    );
  }

  return null; // Valid
}

/**
 * Wrapper for API route handlers that require authentication.
 * Validates API key before executing the handler.
 */
export function withApiAuth<T extends unknown[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
): (request: NextRequest, ...args: T) => Promise<NextResponse> {
  return async (request: NextRequest, ...args: T) => {
    const authError = validateApiKey(request);
    if (authError) {
      return authError;
    }
    return handler(request, ...args);
  };
}

/**
 * Creates a JSON response with consistent formatting.
 */
export function jsonResponse<T>(
  data: T,
  status: number = 200
): NextResponse<T> {
  return NextResponse.json(data, { status });
}

/**
 * Creates an error response with consistent formatting.
 */
export function errorResponse(
  message: string,
  status: number = 400,
  details?: unknown
): NextResponse {
  const body: { error: string; details?: unknown } = { error: message };
  if (details) {
    body.details = details;
  }
  return NextResponse.json(body, { status });
}
