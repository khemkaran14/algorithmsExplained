import { z } from 'zod';
import { api, json, readJson, requireSameOrigin, ApiError } from '@/lib/http';
import { catalog } from '@/content/catalog';
import { canReadLesson } from '@/payments/access';
import { serverLessonData } from '@/content/server-registry';
const schema = z.union([
  z
    .object({ input: z.unknown(), variant: z.string().max(80).optional() })
    .strict()
    .refine((v) => v.input !== undefined || v.variant !== undefined),
  z.object({
    preset: z.object({
      kind: z.literal('random'),
      size: z.number().int().min(1).max(64),
      seed: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
    }),
    variant: z.string().max(80).optional(),
  }),
]);
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  return api(async () => {
    requireSameOrigin(request);
    const { slug } = await params,
      meta = catalog.find((l) => l.slug === slug);
    if (!meta || meta.status === 'planned')
      throw new ApiError(404, 'Lesson not found.');
    if (!(await canReadLesson(meta)))
      throw new ApiError(403, 'Unlock this lesson to use its visualizer.');
    const input = schema.parse(await readJson(request));
    return json(
      await serverLessonData(
        meta,
        'input' in input ? input.input : undefined,
        'preset' in input ? input.preset : undefined,
        input.variant,
      ),
    );
  });
}
