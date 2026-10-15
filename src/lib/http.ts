import { ZodError } from 'zod';
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function requireSameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  const expected = new URL(process.env.AUTH_URL ?? request.url).origin;
  if (!origin || origin !== expected)
    throw new ApiError(403, 'Request origin is not allowed.');
}
export async function readJson(request: Request) {
  const text = await request.text();
  if (text.length > 65536) throw new ApiError(413, 'Request is too large.');
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new ApiError(400, 'Invalid JSON.');
  }
}
export function json(value: unknown, status = 200) {
  return Response.json(value, {
    status,
    headers: {
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
export async function api(action: () => Promise<Response>) {
  try {
    return await action();
  } catch (error) {
    if (error instanceof ApiError)
      return json({ error: error.message }, error.status);
    if (error instanceof ZodError)
      return json({ error: 'Please check the submitted fields.' }, 400);
    console.error(
      JSON.stringify({
        level: 'error',
        event: 'api_failure',
        kind: error instanceof Error ? error.name : 'unknown',
      }),
    );
    return json(
      { error: 'The request could not be completed. Please try again.' },
      500,
    );
  }
}
