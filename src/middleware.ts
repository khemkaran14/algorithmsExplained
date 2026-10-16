import { NextResponse, type NextRequest } from 'next/server';
import {
  actorKey,
  admitRequest,
  budgetFor,
  clientAddress,
} from '@/security/rate-limit';
import { contentSecurityPolicy, applySecurityHeaders } from '@/security/csp';
export async function middleware(request: NextRequest) {
  const nonce = btoa(
    String.fromCharCode(...crypto.getRandomValues(new Uint8Array(18))),
  );
  const csp = contentSecurityPolicy(
    nonce,
    process.env.NODE_ENV === 'development',
  );
  const headers = new Headers(request.headers);
  headers.set('x-nonce', nonce);
  headers.set('Content-Security-Policy', csp);
  let response: NextResponse;
  const path = request.nextUrl.pathname;
  if (
    (path.startsWith('/api/') && !path.startsWith('/api/jobs/')) ||
    (path === '/sign-in' && request.method === 'POST')
  ) {
    try {
      const admission = await admitRequest(
        await actorKey(clientAddress(request.headers)),
        budgetFor(path),
      );
      if (!admission.allowed)
        response = NextResponse.json(
          { error: 'Too many requests. Please try again shortly.' },
          {
            status: 429,
            headers: {
              'Retry-After': String(admission.retryAfter),
              'Cache-Control': 'private, no-store',
            },
          },
        );
      else {
        response = NextResponse.next({ request: { headers } });
        response.headers.set(
          'X-RateLimit-Remaining',
          String(admission.remaining),
        );
      }
    } catch {
      response = NextResponse.json(
        {
          error:
            'Request protection is temporarily unavailable. Please try again shortly.',
        },
        {
          status: 503,
          headers: { 'Retry-After': '5', 'Cache-Control': 'private, no-store' },
        },
      );
    }
  } else response = NextResponse.next({ request: { headers } });
  applySecurityHeaders(
    response.headers,
    csp,
    process.env.NODE_ENV === 'production' &&
      request.nextUrl.protocol === 'https:',
  );
  if (
    path.startsWith('/api/') ||
    path.startsWith('/account') ||
    path.startsWith('/admin')
  )
    response.headers.set('Cache-Control', 'private, no-store');
  return response;
}
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons/|sw.js|manifest.webmanifest).*)',
  ],
};
