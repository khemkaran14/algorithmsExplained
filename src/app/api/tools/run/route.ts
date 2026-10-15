import { z } from 'zod';
import { validateNumbers } from '@/engine/helpers';
import { api, json, readJson, requireSameOrigin, ApiError } from '@/lib/http';
import { catalog } from '@/content/catalog';
import { canReadLesson } from '@/payments/access';
import { serverLessonData } from '@/content/server-registry';
import { loadCode } from '@/content/load';
const schema = z
  .object({
    mode: z.enum(['playground', 'compare']),
    slugs: z.array(z.string().max(120)).min(1).max(3),
    input: z.unknown(),
  })
  .strict();
export async function POST(request: Request) {
  return api(async () => {
    requireSameOrigin(request);
    const input = schema.parse(await readJson(request));
    if (
      new Set(input.slugs).size !== input.slugs.length ||
      (input.mode === 'compare'
        ? input.slugs.length < 2
        : input.slugs.length !== 1)
    )
      throw new ApiError(
        400,
        'Choose distinct algorithms: one for the playground or two to three for comparison.',
      );
    const lessons = input.slugs.map((slug) =>
      catalog.find(
        (l) => l.slug === slug && l.status !== 'planned' && l.track === 'dsa',
      ),
    );
    for (const meta of lessons) {
      if (!meta) throw new ApiError(404, 'Algorithm is unavailable.');
      if (input.mode === 'playground' && !meta.isFree)
        throw new ApiError(403, 'The playground uses free algorithms.');
      if (input.mode === 'compare' && meta.module !== 'sorting')
        throw new ApiError(
          400,
          'Comparison currently uses sorting algorithms with the same integer array.',
        );
      if (!(await canReadLesson(meta)))
        throw new ApiError(
          403,
          'Unlock all selected algorithms before comparing them.',
        );
    }
    let sharedInput = input.input;
    if (sharedInput === undefined)
      throw new ApiError(400, 'Provide a JSON input.');
    if (input.mode === 'compare') {
      try {
        sharedInput = validateNumbers(sharedInput);
      } catch {
        throw new ApiError(
          400,
          'Comparison needs an array of 1–64 bounded integers.',
        );
      }
    }
    const result = [];
    for (const meta of lessons) {
      const data = await serverLessonData(meta!, sharedInput);
      result.push({
        slug: meta!.slug,
        title: meta!.title,
        data,
        code: await loadCode(meta!),
      });
    }
    return json(result);
  });
}
