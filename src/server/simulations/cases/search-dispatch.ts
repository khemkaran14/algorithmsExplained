import 'server-only';
import { z } from 'zod';
import { frame, counters } from '@/engine/helpers';
import type { Visualizer, VisualState } from '@/engine/types';
const httpUrl = z
  .string()
  .url()
  .max(256)
  .refine(
    (value) => ['http:', 'https:'].includes(new URL(value).protocol),
    'Use HTTP(S) example URLs.',
  );
const crawlerSchema = z
  .object({
    seeds: z.array(httpUrl).min(1).max(8),
    pages: z
      .array(z.object({ url: httpUrl, links: z.array(httpUrl).max(12) }))
      .min(1)
      .max(16),
    robots: z
      .record(
        z.string().max(128),
        z.array(z.string().startsWith('/').max(128)).max(8),
      )
      .default({}),
    respectRobots: z.boolean().default(true),
    delay: z.number().int().min(1).max(8).default(2),
    workers: z.number().int().min(1).max(4).default(2),
    ticks: z.number().int().min(1).max(32).default(12),
  })
  .strict();
function canonical(value: string) {
  const url = new URL(value);
  url.hash = '';
  return url.href;
}
export const webCrawler: Visualizer<z.infer<typeof crawlerSchema>> = {
  id: 'web-crawler',
  maxSize: 16,
  measureSize: (p) => p.pages.length,
  inputHint:
    'This crawler visits only the supplied in-memory page graph; it performs no network requests. Canonicalization removes fragments. robots maps hosts to simple disallowed path prefixes, not the full robots.txt grammar. Delay is per-host ticks.',
  controls: [
    {
      key: 'respectRobots',
      label: 'Respect modeled robots prefixes',
      type: 'boolean',
    },
    {
      key: 'delay',
      label: 'Per-host delay ticks',
      type: 'number',
      min: 1,
      max: 8,
    },
    {
      key: 'workers',
      label: 'Fetch slots per tick',
      type: 'number',
      min: 1,
      max: 4,
    },
  ],
  presets: {
    best: crawlerSchema.parse({
      seeds: ['https://a.test/'],
      pages: [{ url: 'https://a.test/', links: [] }],
    }),
    average: crawlerSchema.parse({
      seeds: ['https://a.test/'],
      pages: [
        {
          url: 'https://a.test/',
          links: [
            'https://a.test/about',
            'https://b.test/',
            'https://a.test/private',
          ],
        },
        { url: 'https://a.test/about', links: ['https://a.test/#top'] },
        { url: 'https://b.test/', links: ['https://a.test/about'] },
        { url: 'https://a.test/private', links: [] },
      ],
      robots: { 'a.test': ['/private'] },
    }),
    worst: crawlerSchema.parse({
      seeds: ['https://a.test/'],
      ticks: 2,
      delay: 8,
      pages: [
        {
          url: 'https://a.test/',
          links: ['https://a.test/a', 'https://a.test/b'],
        },
        { url: 'https://a.test/a', links: [] },
        { url: 'https://a.test/b', links: [] },
      ],
    }),
    random: (n) => {
      const count = Math.min(16, Math.max(1, n));
      return crawlerSchema.parse({
        seeds: ['https://a.test/0'],
        pages: Array.from({ length: count }, (_, i) => ({
          url: `https://a.test/${i}`,
          links: i + 1 < count ? [`https://a.test/${i + 1}`] : [],
        })),
      });
    },
  },
  validateInput(raw) {
    const p = crawlerSchema.parse(raw);
    if (
      new Set(p.pages.map((page) => canonical(page.url))).size !==
      p.pages.length
    )
      throw new Error('Supplied pages need distinct canonical URLs.');
    return p;
  },
  complexity: {
    metric: { label: 'Modeled fetch attempts', keys: ['fetches'] },
    best: 'A visited/frontier set prevents repeated canonical fetches',
    average: 'Per-host scheduling trades crawl rate against politeness',
    worst: 'The bounded trace can end with a delayed frontier',
    space: 'O(pages+discovered links+frontier)',
    why: 'A production crawler needs a durable deduplicated frontier, per-host politeness, robots policy and bounded retry/storage behavior. This offline graph model demonstrates those selected scheduling decisions. It does not implement network security, the full robots grammar or a production URL-equivalence policy.',
  },
  *generate(input) {
    const c = counters(),
      pages = new Map(input.pages.map((page) => [canonical(page.url), page])),
      queued = new Set(input.seeds.map(canonical)),
      frontier = [...queued],
      nextHost = new Map<string, number>(),
      visited: string[] = [],
      blocked: string[] = [],
      failed: string[] = [],
      history: { tick: number; url: string; status: string }[] = [];
    c.fetches = 0;
    c.robotsViolations = 0;
    c.discovered = queued.size;
    const scene: VisualState = {
      kind: 'architecture',
      values: [],
      nodes: [
        { id: 'seed', label: 'Seed URLs', x: 0, y: 80 },
        { id: 'frontier', label: 'Durable frontier + dedupe', x: 210, y: 80 },
        { id: 'policy', label: 'Host delay + robots policy', x: 430, y: 80 },
        { id: 'fetch', label: 'Offline page graph', x: 650, y: 80 },
        { id: 'parse', label: 'Link extraction + canonicalize', x: 870, y: 80 },
      ],
      edges: [
        { from: 'seed', to: 'frontier' },
        { from: 'frontier', to: 'policy' },
        { from: 'policy', to: 'fetch' },
        { from: 'fetch', to: 'parse' },
        { from: 'parse', to: 'frontier' },
      ],
    };
    yield frame(
      scene,
      'Model frontier identity and scheduling before increasing fetch parallelism.',
      c,
      1,
      { seeds: frontier.length },
    );
    for (let tick = 0; tick < input.ticks; tick++) {
      let budget = input.workers;
      while (budget > 0) {
        const index = frontier.findIndex(
          (value) => (nextHost.get(new URL(value).hostname) ?? 0) <= tick,
        );
        if (index < 0) break;
        const value = frontier.splice(index, 1)[0],
          url = new URL(value),
          disallowed = (input.robots[url.hostname] ?? []).some((prefix) =>
            url.pathname.startsWith(prefix),
          );
        yield frame(
          scene,
          'Check this host’s policy before consuming a modeled fetch slot.',
          c,
          3,
          { tick, url: value, disallowed, respectRobots: input.respectRobots },
          [{ id: 'policy', kind: 'comparing' }],
          {
            prompt: `What happens next to ${value}?`,
            choices: ['Block without fetching', 'Attempt the offline fetch'],
            answer:
              disallowed && input.respectRobots
                ? 'Block without fetching'
                : 'Attempt the offline fetch',
            hint: 'The example policy blocks matching path prefixes before a fetch is attempted.',
          },
        );
        if (disallowed && input.respectRobots) {
          blocked.push(value);
          history.push({ tick, url: value, status: 'robots-blocked' });
          continue;
        }
        budget--;
        nextHost.set(url.hostname, tick + input.delay);
        c.fetches++;
        if (disallowed) c.robotsViolations++;
        const page = pages.get(value);
        if (!page) {
          failed.push(value);
          history.push({ tick, url: value, status: 'not-in-offline-graph' });
          continue;
        }
        visited.push(value);
        history.push({ tick, url: value, status: 'fetched' });
        for (const target of page.links) {
          const key = canonical(target);
          if (!queued.has(key)) {
            queued.add(key);
            frontier.push(key);
            c.discovered++;
            c.writes++;
          }
        }
        yield frame(
          scene,
          'Add unseen canonical links, preserving per-host delay for later work.',
          c,
          5,
          {
            tick,
            url: value,
            frontier: frontier.length,
            visited: visited.length,
          },
          [{ id: 'fetch->parse', kind: 'moving' }],
        );
      }
    }
    yield frame(
      {
        ...scene,
        result: {
          visited,
          blocked,
          failed,
          pending: frontier,
          history,
          fetches: c.fetches,
          robotsViolations: c.robotsViolations,
          discovered: c.discovered,
          conserved:
            queued.size ===
            visited.length + blocked.length + failed.length + frontier.length,
        },
      },
      'More workers cannot bypass the declared per-host politeness interval.',
      c,
      6,
      { visited: visited.length, pending: frontier.length },
    );
  },
};
const autocompleteSchema = z
  .object({
    dictionary: z
      .array(
        z.object({
          word: z
            .string()
            .min(1)
            .max(16)
            .regex(/^[a-z]+$/),
          frequency: z.number().int().min(0).max(1000),
        }),
      )
      .min(1)
      .max(32),
    prefix: z
      .string()
      .max(16)
      .regex(/^[a-z]*$/),
    k: z.number().int().min(1).max(8).default(3),
    faultAt: z.number().int().min(-1).max(16).default(-1),
    fallback: z.boolean().default(true),
  })
  .strict();
export const autocomplete: Visualizer<z.infer<typeof autocompleteSchema>> = {
  id: 'search-autocomplete',
  maxSize: 32,
  measureSize: (p) => p.dictionary.length,
  inputHint:
    'Type lowercase prefix characters against a frequency-ranked trie. faultAt is a prefix length where index access becomes unavailable. Fallback filters the previous top-k candidates; it is explicitly stale/best-effort and can miss better candidates.',
  controls: [
    {
      key: 'k',
      label: 'Suggestions per prefix',
      type: 'number',
      min: 1,
      max: 8,
    },
    {
      key: 'faultAt',
      label: 'Index failure prefix length (-1 = none)',
      type: 'number',
      min: -1,
      max: 16,
    },
    {
      key: 'fallback',
      label: 'Use best-effort prior candidates',
      type: 'boolean',
    },
  ],
  presets: {
    best: autocompleteSchema.parse({
      dictionary: [{ word: 'cat', frequency: 1 }],
      prefix: 'c',
    }),
    average: autocompleteSchema.parse({
      dictionary: [
        { word: 'car', frequency: 5 },
        { word: 'cat', frequency: 4 },
        { word: 'camera', frequency: 8 },
        { word: 'dog', frequency: 2 },
      ],
      prefix: 'ca',
    }),
    worst: autocompleteSchema.parse({
      dictionary: [
        { word: 'cat', frequency: 4 },
        { word: 'car', frequency: 5 },
        { word: 'camera', frequency: 8 },
      ],
      prefix: 'cam',
      faultAt: 2,
      k: 2,
    }),
    random: (n) =>
      autocompleteSchema.parse({
        dictionary: Array.from(
          { length: Math.min(26, Math.max(1, n)) },
          (_, i) => ({
            word: 'ca' + String.fromCharCode(97 + i),
            frequency: i + 1,
          }),
        ),
        prefix: 'ca',
      }),
  },
  validateInput(raw) {
    const p = autocompleteSchema.parse(raw);
    if (new Set(p.dictionary.map((e) => e.word)).size !== p.dictionary.length)
      throw new Error('Each word needs one frequency entry.');
    return p;
  },
  complexity: {
    metric: { label: 'Trie nodes visited', keys: ['nodeVisits'] },
    best: 'O(prefix length) path lookup',
    average: 'This uncached ranking model enumerates and sorts matching words',
    worst: 'O(P+S log S) per prefix, where S is the matching subtree output',
    space: 'O(total stored characters+candidate output)',
    why: 'A trie narrows to one prefix subtree; frequency ranking still costs work unless top-k summaries are precomputed or maintained. This model deliberately enumerates candidates so that trade-off is visible. A stale prior-candidate fallback is not guaranteed to return the fresh global top-k.',
  },
  *generate(input) {
    type Node = {
      children: Map<string, Node>;
      word: string | null;
      frequency: number;
    };
    const root: Node = { children: new Map(), word: null, frequency: 0 },
      c = counters();
    for (const entry of input.dictionary) {
      let node = root;
      for (const ch of entry.word) {
        if (!node.children.has(ch))
          node.children.set(ch, {
            children: new Map(),
            word: null,
            frequency: 0,
          });
        node = node.children.get(ch)!;
      }
      node.word = entry.word;
      node.frequency = entry.frequency;
    }
    let prior: { word: string; frequency: number }[] = [];
    const history: {
      prefix: string;
      suggestions: { word: string; frequency: number }[] | null;
      stale: boolean;
      available: boolean;
    }[] = [];
    c.nodeVisits = 0;
    c.rankComparisons = 0;
    const scene: VisualState = {
      kind: 'architecture',
      values: [],
      nodes: [
        { id: 'client', label: 'Typed prefix', x: 0, y: 80 },
        { id: 'cache', label: 'Client prior candidates', x: 210, y: 0 },
        { id: 'router', label: 'Prefix query service', x: 210, y: 160 },
        { id: 'trie', label: 'Trie prefix subtree', x: 440, y: 160 },
        { id: 'rank', label: 'Frequency top-k + tie rule', x: 670, y: 160 },
      ],
      edges: [
        { from: 'client', to: 'router' },
        { from: 'router', to: 'trie' },
        { from: 'trie', to: 'rank' },
        { from: 'rank', to: 'cache' },
        { from: 'cache', to: 'client' },
      ],
    };
    yield frame(
      scene,
      'Separate prefix narrowing, ranking and degraded client behavior.',
      c,
      1,
      { dictionaryWords: input.dictionary.length, k: input.k },
    );
    for (let length = 0; length <= input.prefix.length; length++) {
      const prefix = input.prefix.slice(0, length),
        down = input.faultAt >= 0 && length >= input.faultAt;
      let suggestions: { word: string; frequency: number }[] | null;
      if (down) {
        suggestions = input.fallback
          ? prior.filter((e) => e.word.startsWith(prefix))
          : null;
        history.push({
          prefix,
          suggestions,
          stale: input.fallback,
          available: suggestions !== null,
        });
        yield frame(
          scene,
          'An unavailable index permits only an explicitly degraded prior-candidate fallback.',
          c,
          3,
          {
            prefix,
            stale: input.fallback,
            suggestions: JSON.stringify(suggestions),
          },
          [{ id: 'trie', kind: 'error' }],
        );
        continue;
      }
      let node: Node | undefined = root;
      for (const ch of prefix) {
        c.nodeVisits++;
        node = node.children.get(ch);
        if (!node) break;
      }
      const candidates: { word: string; frequency: number }[] = [];
      function collect(current: Node) {
        c.nodeVisits++;
        if (current.word)
          candidates.push({ word: current.word, frequency: current.frequency });
        for (const child of current.children.values()) collect(child);
      }
      if (node) collect(node);
      candidates.sort((a, b) => {
        c.rankComparisons++;
        return (
          b.frequency - a.frequency ||
          (a.word < b.word ? -1 : a.word > b.word ? 1 : 0)
        );
      });
      suggestions = candidates.slice(0, input.k);
      prior = suggestions;
      history.push({ prefix, suggestions, stale: false, available: true });
      yield frame(
        scene,
        'Enumerate the prefix subtree and rank exact candidates by frequency, then lexical tie order.',
        c,
        3,
        {
          prefix,
          candidates: candidates.length,
          suggestions: JSON.stringify(suggestions),
        },
        [{ id: 'rank', kind: 'comparing' }],
        {
          prompt:
            'Does reaching a trie prefix automatically produce frequency-ranked top-k?',
          choices: [
            'No; ranking still needs stored summaries or work',
            'Yes; tree shape alone ranks by popularity',
          ],
          answer: 'No; ranking still needs stored summaries or work',
          hint: 'Prefix structure orders characters, not usage frequencies.',
        },
      );
    }
    yield frame(
      {
        ...scene,
        result: {
          history,
          final: history.at(-1)!,
          nodeVisits: c.nodeVisits,
          rankComparisons: c.rankComparisons,
        },
      },
      'Fresh exact ranking and stale best-effort fallback have different guarantees.',
      c,
      6,
      { prefix: input.prefix },
    );
  },
};
const rideSchema = z
  .object({
    drivers: z
      .array(
        z.object({
          id: z.number().int().min(0).max(99),
          x: z.number().int().min(0).max(19),
          y: z.number().int().min(0).max(19),
        }),
      )
      .min(1)
      .max(16),
    riders: z
      .array(
        z.object({
          x: z.number().int().min(0).max(19),
          y: z.number().int().min(0).max(19),
        }),
      )
      .min(1)
      .max(16),
    batchSize: z.number().int().min(1).max(4).default(2),
    atomicReservation: z.boolean().default(true),
  })
  .strict();
export const rideSharing: Visualizer<z.infer<typeof rideSchema>> = {
  id: 'ride-sharing-design',
  maxSize: 16,
  measureSize: (p) => p.riders.length,
  inputHint:
    'Drivers/riders use a 20×20 example coordinate map. Four-by-four spatial buckets prune candidate cells using a distance lower bound. Batch proposals share a snapshot; atomic reservations retry conflicts instead of double-booking. Distance is Euclidean, not road travel time.',
  controls: [
    {
      key: 'batchSize',
      label: 'Concurrent snapshot proposals',
      type: 'number',
      min: 1,
      max: 4,
    },
    {
      key: 'atomicReservation',
      label: 'Atomic driver reservation',
      type: 'boolean',
    },
  ],
  presets: {
    best: rideSchema.parse({
      drivers: [{ id: 0, x: 1, y: 1 }],
      riders: [{ x: 1, y: 2 }],
      batchSize: 1,
    }),
    average: rideSchema.parse({
      drivers: [
        { id: 0, x: 1, y: 1 },
        { id: 1, x: 8, y: 8 },
        { id: 2, x: 15, y: 15 },
      ],
      riders: [
        { x: 2, y: 2 },
        { x: 2, y: 3 },
        { x: 14, y: 15 },
      ],
    }),
    worst: rideSchema.parse({
      atomicReservation: false,
      drivers: [{ id: 0, x: 1, y: 1 }],
      riders: [
        { x: 1, y: 2 },
        { x: 1, y: 2 },
      ],
      batchSize: 2,
    }),
    random: (n) =>
      rideSchema.parse({
        drivers: Array.from(
          { length: Math.min(16, Math.max(1, n)) },
          (_, i) => ({
            id: i,
            x: (i % 4) * 5 + 1,
            y: Math.floor(i / 4) * 5 + 1,
          }),
        ),
        riders: Array.from(
          { length: Math.min(16, Math.max(1, n)) },
          (_, i) => ({ x: (i % 4) * 5 + 2, y: Math.floor(i / 4) * 5 + 2 }),
        ),
      }),
  },
  validateInput(raw) {
    const p = rideSchema.parse(raw);
    if (new Set(p.drivers.map((d) => d.id)).size !== p.drivers.length)
      throw new Error('Driver IDs must be distinct.');
    return p;
  },
  complexity: {
    metric: {
      label: 'Driver distance comparisons',
      keys: ['driverComparisons'],
    },
    best: 'Spatial lower bounds avoid inspecting unrelated cells',
    average: 'Nearest available driver is chosen under Euclidean distance',
    worst:
      'O(D) candidate comparisons; stale proposals need reservation retries',
    space: 'O(drivers+riders+spatial buckets)',
    why: 'Spatial search chooses a candidate, while an atomic reservation decides whether it is still available. The cell traversal stops only when the next cell’s minimum possible distance exceeds the best candidate, preserving nearest-driver correctness. Greedy nearest dispatch is not a globally optimal fleet assignment and does not model roads, GPS noise or real-time travel estimates.',
  },
  *generate(input) {
    const c = counters(),
      drivers = input.drivers.map((d) => ({ ...d, available: true })),
      assignments: {
        rider: number;
        driver: number | null;
        distance: number | null;
        retried: boolean;
      }[] = [];
    c.driverComparisons = 0;
    c.cellVisits = 0;
    c.reservationRetries = 0;
    c.doubleBookings = 0;
    const architecture: VisualState = {
      kind: 'architecture',
      values: [],
      nodes: [
        { id: 'rider', label: 'Rider pickup', x: 0, y: 80 },
        { id: 'geo', label: 'Spatial availability index', x: 210, y: 80 },
        { id: 'reserve', label: 'Atomic driver reservation', x: 440, y: 80 },
        { id: 'trip', label: 'Trip state', x: 670, y: 80 },
      ],
      edges: [
        { from: 'rider', to: 'geo' },
        { from: 'geo', to: 'reserve' },
        { from: 'reserve', to: 'trip' },
      ],
    };
    function nearest(rider: { x: number; y: number }, available: Set<number>) {
      let best: number | null = null,
        distance = Infinity;
      const cells = Array.from({ length: 16 }, (_, i) => {
        const x = (i % 4) * 5,
          y = Math.floor(i / 4) * 5,
          dx = Math.max(x - rider.x, 0, rider.x - (x + 5)),
          dy = Math.max(y - rider.y, 0, rider.y - (y + 5));
        return { x, y, bound: dx * dx + dy * dy };
      }).sort((a, b) => a.bound - b.bound || a.y - b.y || a.x - b.x);
      for (const cell of cells) {
        if (cell.bound > distance) break;
        c.cellVisits++;
        for (const driver of drivers)
          if (
            available.has(driver.id) &&
            Math.floor(driver.x / 5) * 5 === cell.x &&
            Math.floor(driver.y / 5) * 5 === cell.y
          ) {
            const d = (driver.x - rider.x) ** 2 + (driver.y - rider.y) ** 2;
            c.driverComparisons++;
            if (
              d < distance ||
              (d === distance && (best === null || driver.id < best))
            ) {
              distance = d;
              best = driver.id;
            }
          }
      }
      return {
        driver: best,
        distance: best === null ? null : Math.sqrt(distance),
      };
    }
    yield frame(
      architecture,
      'Use a spatial candidate query, then protect the assignment with a reservation boundary.',
      c,
      1,
      { drivers: drivers.length, riders: input.riders.length },
    );
    for (let start = 0; start < input.riders.length; start += input.batchSize) {
      const snapshot = new Set(
          drivers.filter((d) => d.available).map((d) => d.id),
        ),
        proposals = input.riders
          .slice(start, start + input.batchSize)
          .map((r) => nearest(r, snapshot));
      for (let offset = 0; offset < proposals.length; offset++) {
        const index = start + offset,
          rider = input.riders[index];
        let proposal = proposals[offset],
          retried = false;
        yield frame(
          architecture,
          'A nearest-driver proposal can become stale before its reservation commits.',
          c,
          3,
          {
            rider: index,
            proposedDriver: proposal.driver,
            atomic: input.atomicReservation,
          },
          [{ id: 'reserve', kind: 'comparing' }],
          {
            prompt:
              'What must this dispatcher do before assigning its proposed driver?',
            choices: [
              'Return unassigned',
              'Reserve available driver',
              'Retry a stale reservation',
              'Unsafe assignment without rechecking',
            ],
            answer:
              proposal.driver === null
                ? 'Return unassigned'
                : !input.atomicReservation
                  ? 'Unsafe assignment without rechecking'
                  : !drivers.find((d) => d.id === proposal.driver)!.available
                    ? 'Retry a stale reservation'
                    : 'Reserve available driver',
            hint: 'Another dispatcher can reserve the same candidate after your snapshot; compare-and-set or a transaction must protect the assignment.',
          },
        );
        if (proposal.driver !== null) {
          let driver = drivers.find((d) => d.id === proposal.driver)!;
          if (input.atomicReservation && !driver.available) {
            retried = true;
            c.reservationRetries++;
            proposal = nearest(
              rider,
              new Set(drivers.filter((d) => d.available).map((d) => d.id)),
            );
            if (proposal.driver !== null)
              driver = drivers.find((d) => d.id === proposal.driver)!;
          }
          if (proposal.driver !== null) {
            if (!driver.available) c.doubleBookings++;
            driver.available = false;
            c.writes++;
          }
        }
        assignments.push({ rider: index, ...proposal, retried });
        const rows = Array.from(
          { length: 20 },
          () => Array(20).fill(0) as number[],
        );
        for (const driver of drivers)
          rows[driver.y][driver.x] = driver.available ? 1 : 2;
        rows[rider.y][rider.x] = 3;
        yield frame(
          { kind: 'grid', values: [], rows },
          'Commit or reject the reservation; availability changes after each successful match.',
          c,
          5,
          {
            rider: index,
            driver: proposal.driver,
            distance: proposal.distance,
            retried,
          },
          [{ id: `${rider.y},${rider.x}`, kind: 'visited' }],
        );
      }
    }
    yield frame(
      {
        ...architecture,
        result: {
          assignments,
          remainingDrivers: drivers.filter((d) => d.available).map((d) => d.id),
          doubleBookings: c.doubleBookings,
          reservationRetries: c.reservationRetries,
        },
      },
      'Nearest search and safe reservation are separate correctness problems.',
      c,
      6,
      {
        doubleBookings: c.doubleBookings,
        reservationRetries: c.reservationRetries,
      },
    );
  },
};
