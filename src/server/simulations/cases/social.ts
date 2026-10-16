import 'server-only';
import { Fifo } from '../collections';
import { z } from 'zod';
import { frame, counters } from '@/engine/helpers';
import type { Visualizer, VisualState } from '@/engine/types';
const user = z.enum(['alice', 'bob', 'carol']),
  room = z.enum(['general', 'support']);
const chatSchema = z
  .object({
    loseFirstAck: z.boolean().default(false),
    crashAt: z.number().int().min(-1).max(31).default(-1),
    events: z
      .array(
        z.discriminatedUnion('kind', [
          z.object({
            kind: z.literal('send'),
            user,
            room,
            id: z.string().min(1).max(20),
            text: z.string().max(64),
          }),
          z.object({ kind: z.literal('disconnect'), user }),
          z.object({ kind: z.literal('reconnect'), user }),
        ]),
      )
      .min(1)
      .max(32),
  })
  .strict();
export const chatApp: Visualizer<z.infer<typeof chatSchema>> = {
  id: 'chat-app-design',
  maxSize: 32,
  measureSize: (p) => p.events.length,
  inputHint:
    'general contains alice/bob/carol; support contains bob/carol. Message IDs bind sender, room and text. Reconnect replays the durable room log after each user’s cursor. crashAt fails one event before commit; lost acknowledgment does not undo a committed message.',
  controls: [
    {
      key: 'loseFirstAck',
      label: 'Lose first committed send response',
      type: 'boolean',
    },
    {
      key: 'crashAt',
      label: 'Fail before commit at event (-1 = none)',
      type: 'number',
      min: -1,
      max: 31,
    },
  ],
  presets: {
    best: chatSchema.parse({
      events: [
        {
          kind: 'send',
          user: 'alice',
          room: 'general',
          id: 'm1',
          text: 'hello',
        },
      ],
    }),
    average: chatSchema.parse({
      loseFirstAck: true,
      events: [
        { kind: 'disconnect', user: 'bob' },
        {
          kind: 'send',
          user: 'alice',
          room: 'general',
          id: 'm1',
          text: 'hello',
        },
        {
          kind: 'send',
          user: 'alice',
          room: 'general',
          id: 'm1',
          text: 'hello',
        },
        { kind: 'reconnect', user: 'bob' },
      ],
    }),
    worst: chatSchema.parse({
      events: [
        {
          kind: 'send',
          user: 'alice',
          room: 'support',
          id: 'bad',
          text: 'not a member',
        },
        { kind: 'send', user: 'bob', room: 'support', id: 'm1', text: 'first' },
        {
          kind: 'send',
          user: 'bob',
          room: 'support',
          id: 'm1',
          text: 'conflicting retry',
        },
      ],
    }),
    random: (n) =>
      chatSchema.parse({
        events: Array.from(
          { length: Math.min(32, Math.max(1, n)) },
          (_, i) => ({
            kind: 'send',
            user: i % 2 ? 'bob' : 'alice',
            room: 'general',
            id: `m${i}`,
            text: `message ${i}`,
          }),
        ),
      }),
  },
  validateInput: (raw) => chatSchema.parse(raw),
  complexity: {
    metric: { label: 'Durable messages committed', keys: ['commits'] },
    best: 'Expected O(1) message-ID replay lookup',
    average: 'Per-room append order plus recipient fan-out',
    worst: 'Reconnect scans retained history after the user cursor',
    space: 'O(retained messages+delivery history+cursors)',
    why: 'A room log gives a committed per-room sequence, while online fan-out and offline replay are delivery mechanisms. Stable message identity prevents a retry after a lost response from appending again. This model has one serial room owner, fixed membership and durable-log assumptions; global ordering, end-to-end encryption and production presence/partition protocols require additional design.',
  },
  *generate(input) {
    type Message = {
      id: string;
      user: 'alice' | 'bob' | 'carol';
      room: 'general' | 'support';
      text: string;
      seq: number;
    };
    const c = counters(),
      members = {
        general: ['alice', 'bob', 'carol'],
        support: ['bob', 'carol'],
      },
      logs: { general: Message[]; support: Message[] } = {
        general: [],
        support: [],
      },
      messages = new Map<string, Message>(),
      online = new Set(['alice', 'bob', 'carol']),
      cursors = new Map<string, number>(),
      deliveries: {
        user: string;
        room: string;
        seq: number;
        id: string;
        replay: boolean;
      }[] = [],
      responses: { event: number; status: string; seq: number | null }[] = [];
    let lost = false;
    c.commits = 0;
    c.deliveries = 0;
    c.retries = 0;
    const scene: VisualState = {
      kind: 'architecture',
      values: [],
      nodes: [
        { id: 'client', label: 'Chat clients + cursors', x: 0, y: 90 },
        { id: 'gateway', label: 'Connection gateway', x: 220, y: 90 },
        { id: 'owner', label: 'Per-room ordered owner', x: 440, y: 0 },
        { id: 'log', label: 'Durable room log', x: 650, y: 0 },
        {
          id: 'fanout',
          label: 'Online fan-out / reconnect replay',
          x: 440,
          y: 190,
        },
      ],
      edges: [
        { from: 'client', to: 'gateway' },
        { from: 'gateway', to: 'owner' },
        { from: 'owner', to: 'log' },
        { from: 'log', to: 'fanout' },
        { from: 'fanout', to: 'gateway' },
      ],
    };
    function send(message: Message, recipient: string, replay: boolean) {
      const key = `${recipient}:${message.room}`;
      if ((cursors.get(key) ?? 0) >= message.seq) return;
      deliveries.push({
        user: recipient,
        room: message.room,
        seq: message.seq,
        id: message.id,
        replay,
      });
      cursors.set(key, message.seq);
      c.deliveries++;
    }
    yield frame(
      scene,
      'Commit a room sequence before treating online delivery as durable acknowledgment.',
      c,
      1,
      { rooms: 2 },
    );
    for (let index = 0; index < input.events.length; index++) {
      const event = input.events[index];
      yield frame(
        scene,
        'Choose the state boundary this connection or message event must update.',
        c,
        3,
        { event: index, kind: event.kind, user: event.user },
        [],
        {
          prompt:
            'Can a lost send response prove the message was never committed?',
          choices: ['No', 'Yes'],
          answer: 'No',
          hint: 'A response can disappear after the durable append; retries need stable message identity.',
        },
      );
      if (event.kind === 'disconnect') {
        online.delete(event.user);
        responses.push({ event: index, status: 'offline', seq: null });
      } else if (event.kind === 'reconnect') {
        online.add(event.user);
        for (const r of ['general', 'support'] as const)
          if (members[r].includes(event.user))
            for (const message of logs[r]) send(message, event.user, true);
        responses.push({
          event: index,
          status: 'replayed-after-cursor',
          seq: null,
        });
      } else {
        if (!online.has(event.user)) {
          responses.push({ event: index, status: 'sender-offline', seq: null });
          continue;
        }
        if (!members[event.room].includes(event.user)) {
          responses.push({ event: index, status: 'forbidden-room', seq: null });
          continue;
        }
        const old = messages.get(event.id);
        if (old) {
          const same =
            old.user === event.user &&
            old.room === event.room &&
            old.text === event.text;
          c.retries++;
          responses.push({
            event: index,
            status: same ? 'replayed-commit' : 'id-conflict',
            seq: same ? old.seq : null,
          });
          continue;
        }
        if (index === input.crashAt) {
          responses.push({
            event: index,
            status: 'unavailable-before-commit',
            seq: null,
          });
          continue;
        }
        const message = { ...event, seq: logs[event.room].length + 1 };
        logs[event.room].push(message);
        messages.set(event.id, message);
        c.commits++;
        c.writes++;
        for (const recipient of members[event.room])
          if (online.has(recipient)) send(message, recipient, false);
        const responseLost = input.loseFirstAck && !lost;
        if (responseLost) lost = true;
        responses.push({
          event: index,
          status: responseLost ? 'committed-response-lost' : 'committed',
          seq: responseLost ? null : message.seq,
        });
      }
      yield frame(
        scene,
        'Keep durable append identity separate from transient connection state.',
        c,
        5,
        {
          event: index,
          committed: c.commits,
          deliveries: c.deliveries,
          online: [...online].join(','),
        },
        [{ id: 'log', kind: 'visited' }],
      );
    }
    yield frame(
      {
        ...scene,
        result: {
          logs,
          responses,
          deliveries,
          cursors: Object.fromEntries(cursors),
          online: [...online],
          commits: c.commits,
        },
      },
      'Room ordering, retry identity and reconnect cursors solve different parts of chat reliability.',
      c,
      6,
      { commits: c.commits, deliveries: c.deliveries },
    );
  },
};
const feedSchema = z
  .object({
    mode: z.enum(['push', 'pull', 'hybrid']).default('hybrid'),
    followers: z
      .array(
        z.tuple([
          z.number().int().min(0).max(7),
          z.number().int().min(0).max(7),
        ]),
      )
      .max(32),
    celebrityThreshold: z.number().int().min(1).max(8).default(3),
    fanoutBudget: z.number().int().min(1).max(16).default(2),
    fanoutDown: z.boolean().default(false),
    events: z
      .array(
        z.discriminatedUnion('kind', [
          z.object({
            kind: z.literal('post'),
            author: z.number().int().min(0).max(7),
            id: z.string().min(1).max(20),
            text: z.string().max(64),
          }),
          z.object({
            kind: z.literal('read'),
            user: z.number().int().min(0).max(7),
          }),
        ]),
      )
      .min(1)
      .max(32),
  })
  .strict();
export const newsFeed: Visualizer<z.infer<typeof feedSchema>> = {
  id: 'news-feed-design',
  maxSize: 32,
  measureSize: (p) => p.events.length,
  inputHint:
    'followers pairs are [follower,author]. Push builds inbox copies; pull scans relevant author logs; hybrid pulls high-fanout authors and pushes the rest. Each event begins with a bounded fan-out worker budget. Own posts are included.',
  controls: [
    {
      key: 'mode',
      label: 'Feed materialization',
      type: 'select',
      options: ['push', 'pull', 'hybrid'].map((value) => ({
        value,
        label: value,
      })),
    },
    {
      key: 'celebrityThreshold',
      label: 'Hybrid follower threshold',
      type: 'number',
      min: 1,
      max: 8,
    },
    {
      key: 'fanoutBudget',
      label: 'Fan-out copies per event',
      type: 'number',
      min: 1,
      max: 16,
    },
    { key: 'fanoutDown', label: 'Stop fan-out workers', type: 'boolean' },
  ],
  presets: {
    best: feedSchema.parse({
      followers: [[1, 0]],
      events: [
        { kind: 'post', author: 0, id: 'p1', text: 'hello' },
        { kind: 'read', user: 1 },
      ],
    }),
    average: feedSchema.parse({
      followers: [
        [1, 0],
        [2, 0],
        [3, 0],
        [1, 2],
      ],
      events: [
        { kind: 'post', author: 0, id: 'p1', text: 'popular author' },
        { kind: 'post', author: 2, id: 'p2', text: 'friend' },
        { kind: 'read', user: 1 },
        { kind: 'read', user: 3 },
      ],
    }),
    worst: feedSchema.parse({
      mode: 'push',
      fanoutDown: true,
      followers: [
        [1, 0],
        [2, 0],
        [3, 0],
      ],
      events: [
        { kind: 'post', author: 0, id: 'p1', text: 'waiting for fan-out' },
        { kind: 'read', user: 1 },
      ],
    }),
    random: (n) =>
      feedSchema.parse({
        followers: [
          [1, 0],
          [2, 0],
          [3, 0],
        ],
        events: Array.from({ length: Math.min(32, Math.max(1, n)) }, (_, i) =>
          i % 3 === 2
            ? { kind: 'read', user: 1 }
            : {
                kind: 'post',
                author: i % 2 ? 2 : 0,
                id: `p${i}`,
                text: `post ${i}`,
              },
        ),
      }),
  },
  validateInput(raw) {
    const p = feedSchema.parse(raw);
    const seen = new Set<string>();
    for (const [follower, author] of p.followers) {
      const key = `${follower}:${author}`;
      if (follower === author || seen.has(key))
        throw new Error(
          'Follow edges must be distinct and cannot be self-follows.',
        );
      seen.add(key);
    }
    return p;
  },
  complexity: {
    metric: { label: 'Inbox copies materialized', keys: ['fanoutCopies'] },
    best: 'Push shifts work to writes and serves materialized reads',
    average: 'Hybrid avoids exploding writes for high-fanout authors',
    worst: 'Pull scans relevant logs; push can accumulate a fan-out backlog',
    space: 'O(posts+materialized copies+pending fan-out)',
    why: 'The same durable post can be materialized into many inboxes or merged at read time. Hybrid uses a declared follower-count threshold. Delayed push work can make a feed temporarily incomplete even after the post is durable; a read must deduplicate merged sources. Ranking, pagination and follow-graph changes are outside this chronological example.',
  },
  *generate(input) {
    type Post = { id: string; author: number; text: string; sequence: number };
    const c = counters(),
      posts = new Map<string, Post>(),
      inboxes = Array.from({ length: 8 }, () => new Set<string>()),
      authorPosts = Array.from({ length: 8 }, () => [] as Post[]),
      queue = new Fifo<{ user: number; id: string }>(),
      followers = Array.from({ length: 8 }, (_, author) =>
        input.followers.filter(([, a]) => a === author).map(([f]) => f),
      ),
      reads: { user: number; posts: string[]; pendingFanout: number }[] = [],
      conflicts: string[] = [];
    c.fanoutCopies = 0;
    c.readScans = 0;
    c.posts = 0;
    const isPull = (author: number) =>
      input.mode === 'pull' ||
      (input.mode === 'hybrid' &&
        followers[author].length >= input.celebrityThreshold);
    const scene: VisualState = {
      kind: 'architecture',
      values: [],
      nodes: [
        { id: 'author', label: 'Post authors', x: 0, y: 80 },
        { id: 'log', label: 'Durable post log', x: 210, y: 80 },
        { id: 'queue', label: 'Fan-out tasks', x: 420, y: 0 },
        { id: 'inbox', label: 'Materialized inboxes', x: 630, y: 0 },
        {
          id: 'merge',
          label: 'Deduplicate + chronological merge',
          x: 630,
          y: 180,
        },
        { id: 'reader', label: 'Feed reader', x: 850, y: 180 },
      ],
      edges: [
        { from: 'author', to: 'log' },
        { from: 'log', to: 'queue' },
        { from: 'queue', to: 'inbox' },
        { from: 'inbox', to: 'merge' },
        { from: 'log', to: 'merge' },
        { from: 'merge', to: 'reader' },
      ],
    };
    yield frame(
      scene,
      'Choose where fan-out work occurs before promising feed freshness.',
      c,
      1,
      { mode: input.mode },
    );
    for (let index = 0; index < input.events.length; index++) {
      if (!input.fanoutDown)
        for (
          let budget = input.fanoutBudget;
          queue.length && budget > 0;
          budget--
        ) {
          const task = queue.shift()!;
          inboxes[task.user].add(task.id);
          c.fanoutCopies++;
          c.writes++;
        }
      const event = input.events[index];
      if (event.kind === 'post') {
        const old = posts.get(event.id);
        if (old) {
          if (old.author !== event.author || old.text !== event.text)
            conflicts.push(event.id);
          continue;
        }
        const post = {
          id: event.id,
          author: event.author,
          text: event.text,
          sequence: posts.size,
        };
        posts.set(post.id, post);
        authorPosts[post.author].push(post);
        c.posts++;
        c.writes++;
        if (!isPull(post.author))
          for (const user of [post.author, ...followers[post.author]])
            queue.push({ user, id: post.id });
        yield frame(
          scene,
          'Persist once, then enqueue inbox copies only for the selected materialization policy.',
          c,
          3,
          {
            author: post.author,
            followers: followers[post.author].length,
            pullAtRead: isPull(post.author),
            pending: queue.length,
          },
          [],
          {
            prompt:
              'Does a durable post imply every pushed inbox is already updated?',
            choices: ['No', 'Yes'],
            answer: 'No',
            hint: 'Fan-out tasks may still be pending or their workers may be down.',
          },
        );
      } else {
        const ids = new Set(inboxes[event.user]),
          authors = new Set([
            event.user,
            ...input.followers
              .filter(([f]) => f === event.user)
              .map(([, a]) => a),
          ]);
        for (const author of authors)
          if (isPull(author))
            for (const post of authorPosts[author]) {
              ids.add(post.id);
              c.readScans++;
            }
        const feed = [...ids]
          .map((id) => posts.get(id)!)
          .filter((p) => authors.has(p.author))
          .sort((a, b) => b.sequence - a.sequence)
          .slice(0, 10)
          .map((p) => p.id);
        reads.push({
          user: event.user,
          posts: feed,
          pendingFanout: queue.length,
        });
        yield frame(
          scene,
          'Merge relevant pull posts with materialized inbox entries, deduplicating by post ID.',
          c,
          3,
          { reader: event.user, posts: feed.join(','), pending: queue.length },
          [{ id: 'merge', kind: 'visited' }],
        );
      }
      yield frame(
        scene,
        'Keep durable posts, materialized copies and outstanding fan-out work visible.',
        c,
        5,
        { event: index, posts: posts.size, pending: queue.length },
      );
    }
    yield frame(
      {
        ...scene,
        result: {
          reads,
          posts: [...posts.values()],
          pendingFanout: queue.length,
          fanoutCopies: c.fanoutCopies,
          readScans: c.readScans,
          conflicts,
        },
      },
      'Hybrid changes where work is paid; it does not make delayed delivery disappear.',
      c,
      6,
      { posts: posts.size, pendingFanout: queue.length },
    );
  },
};
