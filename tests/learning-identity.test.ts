import { beforeEach, expect, it, vi } from 'vitest';

beforeEach(() => {
  vi.resetModules();
  vi.unstubAllGlobals();
  localStorage.clear();
});

function stored(owner: string | null) {
  return {
    version: 1,
    owner,
    progress: {},
    library: {
      'bubble-sort': {
        slug: 'bubble-sort',
        bookmarked: true,
        note: 'private note',
        updatedAt: new Date().toISOString(),
      },
    },
  };
}

it('quarantines account data and mutations until its owner is verified', async () => {
  const state = stored('account-a');
  localStorage.setItem('algoverse.learning.v1', JSON.stringify(state));
  const local = await import('@/learning/local');
  expect(local.readLearning().library).toEqual({});
  local.updateLibrary('bubble-sort', { note: 'should not write' });
  expect(JSON.parse(localStorage.getItem('algoverse.learning.v1')!)).toEqual(
    state,
  );
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(Response.json({ owner: 'account-a' })),
  );
  const identity = await import('@/learning/identity');
  expect(await identity.verifyLearningIdentity()).toBe(true);
  expect(local.readLearning().library['bubble-sort'].note).toBe('private note');
});

it.each([null, 'account-b'])(
  'clears prior-account learning and reviews for owner %s',
  async (owner) => {
    localStorage.setItem(
      'algoverse.learning.v1',
      JSON.stringify(stored('account-a')),
    );
    localStorage.setItem('algoverse.reviews.v1', '{}');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ owner })));
    const identity = await import('@/learning/identity');
    await identity.verifyLearningIdentity();
    expect(localStorage.getItem('algoverse.learning.v1')).toBeNull();
    expect(localStorage.getItem('algoverse.reviews.v1')).toBeNull();
  },
);

it('preserves but hides account data when session verification fails', async () => {
  const raw = JSON.stringify(stored('account-a'));
  localStorage.setItem('algoverse.learning.v1', raw);
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
  const identity = await import('@/learning/identity');
  expect(await identity.verifyLearningIdentity()).toBe(false);
  const local = await import('@/learning/local');
  expect(local.readLearning().library).toEqual({});
  expect(localStorage.getItem('algoverse.learning.v1')).toBe(raw);
});

it('does not restore identity from an in-flight request after sign-out', async () => {
  let resolve!: (value: Response) => void;
  vi.stubGlobal(
    'fetch',
    vi.fn(
      () =>
        new Promise<Response>((done) => {
          resolve = done;
        }),
    ),
  );
  const identity = await import('@/learning/identity');
  const pending = identity.verifyLearningIdentity();
  identity.clearLearningIdentity();
  resolve(Response.json({ owner: 'account-a' }));
  expect(await pending).toBe(false);
  expect(identity.learningOwner()).toBeNull();
});

it('binds guest data and new changes to the verified account before a later switch', async () => {
  localStorage.setItem('algoverse.learning.v1', JSON.stringify(stored(null)));
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValueOnce(Response.json({ owner: 'account-a' }))
      .mockResolvedValueOnce(Response.json({ owner: 'account-b' })),
  );
  const identity = await import('@/learning/identity');
  const local = await import('@/learning/local');
  await identity.verifyLearningIdentity();
  expect(local.readLearning().owner).toBe('account-a');
  local.updateLibrary('bubble-sort', { note: 'account-a note' });
  await identity.verifyLearningIdentity();
  expect(local.readLearning().library).toEqual({});
  local.updateLibrary('bubble-sort', { note: 'account-b note' });
  expect(local.readLearning().owner).toBe('account-b');
});
