// @vitest-environment node
import { it, expect } from 'vitest';
import { catalog } from '@/content/catalog';
import { serverLessonData } from '@/content/server-registry';
import { loadCode } from '@/content/load';
import { visualizerLoaders } from '@/content/visualizer-index';
it('serves every authored player with valid default/variant frames, code and bounded sample sizes', async () => {
  for (const meta of catalog.filter((l) => l.status !== 'planned')) {
    const code = await loadCode(meta),
      v = (await visualizerLoaders[meta.slug]()).default;
    for (const variant of ['default', ...Object.keys(v.variants ?? {})]) {
      const data = await serverLessonData(meta, undefined, undefined, variant);
      expect(data.frames.length, meta.slug).toBeGreaterThan(1);
      expect(data.frames.length, meta.slug).toBeLessThanOrEqual(10000);
      expect(
        data.measurements.every(
          (p) => Number.isFinite(p.n) && Number.isFinite(p.count),
        ),
        meta.slug,
      ).toBe(true);
      expect(new Set(data.measurements.map((p) => p.n)).size, meta.slug).toBe(
        data.measurements.length,
      );
      for (const frame of data.frames)
        for (const language of ['javascript', 'python', 'java', 'cpp'] as const)
          expect(
            frame.codeLine[language],
            `${meta.slug}/${variant}/${language}`,
          ).toBeLessThanOrEqual((data.code ?? code)[language].length);
    }
  }
}, 60000);
