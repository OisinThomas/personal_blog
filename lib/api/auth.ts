import { NextRequest, NextResponse } from 'next/server';

const API_KEY_HEADER = 'X-API-Key';

/**
 * Validates the API key from the request headers.
 * Returns null if valid, or an error response if invalid.
 */
export function validateApiKey(request: NextRequest): NextResponse | null {
  const apiKey = request.headers.get(API_KEY_HEADER);
  const expectedKey = process.env.CMS_API_KEY;

  if (!expectedKey) {
    console.error('CMS_API_KEY environment variable is not set');
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing API key. Include X-API-Key header.' },
      { status: 401 }
    );
  }

  if (apiKey !== expectedKey) {
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
