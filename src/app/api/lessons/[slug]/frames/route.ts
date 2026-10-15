import { z } from 'zod';
import { api, json, readJson, requireSameOrigin, ApiError } from '@/lib/http';
import { catalog } from '@/content/catalog';
import { canReadLesson } from '@/payments/access';
import { serverLessonData } from '@/content/server-registry';
const schema = z.object({
  input: z.array(z.number().int().min(-999).max(999)).min(1).max(64),
});
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
    return json(await serverLessonData(meta, input.input));
  });
}
