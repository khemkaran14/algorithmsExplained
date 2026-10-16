import { describe, expect, it } from 'vitest';
import { withProvider } from '@/server/simulations/cloud/provider';
import { responsibility } from '@/server/simulations/cloud/responsibility';
import { cacheModel } from '@/server/simulations/cache-resilience';
import { catalog } from '@/content/catalog';
import { visualizerLoaders } from '@/content/visualizer-index';
function result(service: 'iaas' | 'paas' | 'saas') {
  const v = responsibility();
  return [
    ...v.generate(
      v.validateInput({
        service,
        patchOS: false,
        patchRuntime: false,
        patchApp: false,
        dataPolicyDone: true,
        credentialsProtected: true,
      }),
    ),
  ].at(-1)!.state.result as { gaps: string[] };
}
it('service boundaries shift customer maintenance without dropping tenant obligations', () => {
  expect(result('iaas').gaps).toEqual([
    'Guest operating-system patching',
    'Managed language runtime patching',
    'Application source maintenance',
  ]);
  expect(result('paas').gaps).toEqual(['Application source maintenance']);
  expect(result('saas').gaps).toEqual([]);
  const v = responsibility(),
    r = [
      ...v.generate(
        v.validateInput({ service: 'saas', dataPolicyDone: false }),
      ),
    ].at(-1)!.state.result as { gaps: string[] };
  expect(r.gaps).toContain('Tenant data-access policy');
});
it('provider annotations validate independently and preserve pure core outcomes', () => {
  const base = cacheModel(),
    v = withProvider(base, 'cloud-cache', {
      aws: 'AWS cache',
      gcp: 'GCP cache',
      notes: 'Conceptual fixture only.',
    });
  const input = v.validateInput({ ...v.presets.average, provider: 'gcp' }),
    before = structuredClone(input),
    frames = [...v.generate(input)];
  expect(input).toEqual(before);
  const core = [...base.generate(base.validateInput(base.presets.average))].at(
    -1,
  )!.state.result;
  expect((frames.at(-1)!.state.result as { model: unknown }).model).toEqual(
    core,
  );
  expect(() => v.validateInput({ ...input, provider: 'other' })).toThrow();
  expect(() => v.validateInput({ ...input, extra: 'invalid' })).toThrow();
});
describe.each(
  catalog.filter((l) => l.track === 'cloud' && l.status === 'ready'),
)('$slug', (meta) => {
  it('runs deterministic, immutable, JSON-safe scenarios under both provider mappings', async () => {
    const v = (await visualizerLoaders[meta.slug]()).default;
    for (const raw of [
      v.presets.best,
      v.presets.average,
      v.presets.worst,
      v.presets.random(8, 42),
    ])
      for (const provider of ['aws', 'gcp']) {
        const input = v.validateInput({ ...(raw as object), provider }),
          before = structuredClone(input),
          frames = [...v.generate(input)];
        expect(input).toEqual(before);
        expect(frames).toEqual([...v.generate(input)]);
        expect(JSON.parse(JSON.stringify(frames))).toEqual(frames);
        expect(frames.at(-1)!.state.result).toBeDefined();
      }
  });
});
