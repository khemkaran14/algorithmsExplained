import { logFailure } from './logger';
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
/** Limit raw bytes while reading, before decoding or JSON allocation. */
export async function readBody(
  request: Request,
  limit = 65536,
): Promise<string> {
  const length = request.headers.get('content-length');
  if (length !== null && (!/^\d+$/.test(length) || Number(length) > limit)) {
    await request.body?.cancel().catch(() => undefined);
    throw new ApiError(413, 'Request is too large.');
  }
  if (!request.body) return '';
  const reader = request.body.getReader(),
    chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) {
        await reader.cancel().catch(() => undefined);
        throw new ApiError(413, 'Request is too large.');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(
      bytes,
    );
  } catch {
    throw new ApiError(400, 'Request body must be valid UTF-8.');
  }
}

export async function readJson(request: Request, limit = 65536) {
  const text = await readBody(request, limit);
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
    logFailure('api_failure', error);
    return json(
      { error: 'The request could not be completed. Please try again.' },
      500,
    );
  }
}
