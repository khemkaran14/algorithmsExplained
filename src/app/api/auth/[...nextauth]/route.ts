import { NextRequest } from 'next/server';
import { handlers } from '@/auth';
import { api, readBody } from '@/lib/http';
export const GET = handlers.GET;
export async function POST(request: Request) {
  return api(async () => {
    const body = await readBody(request);
    return handlers.POST(
      new NextRequest(request.url, {
        method: 'POST',
        headers: request.headers,
        body,
      }),
    );
  });
}
