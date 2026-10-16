import 'server-only';
import { z } from 'zod';
import { frame, counters } from '@/engine/helpers';
import type { Visualizer, VisualState } from '@/engine/types';
import { cidrContains, ipv4Cidr } from './network';
/** Bounded case-sensitive glob matching; '*' spans any sequence and '?' one character. */
export function globMatch(pattern: string, text: string) {
  let row = Array<boolean>(text.length + 1).fill(false);
  row[0] = true;
  for (const char of pattern) {
    const next = Array<boolean>(text.length + 1).fill(false);
    if (char === '*') next[0] = row[0];
    for (let j = 1; j <= text.length; j++)
      next[j] =
        char === '*'
          ? row[j] || next[j - 1]
          : row[j - 1] && (char === '?' || char === text[j - 1]);
    row = next;
  }
  return row[text.length];
}
const name = z.string().regex(/^[a-zA-Z0-9:/._-]{1,64}$/),
  pattern = z.string().regex(/^[a-zA-Z0-9:/._*?-]{1,64}$/),
  principal = name.refine(
    (value) => !value.startsWith('role:'),
    'role: is reserved for issued role sessions.',
  );
const schema = z
  .object({
    sessionTTL: z.number().int().min(1).max(12).default(4),
    roles: z
      .array(
        z.object({
          name,
          trust: z.array(pattern).min(1).max(4),
          requireMfa: z.boolean().default(true),
        }),
      )
      .max(8)
      .default([{ name: 'reader', trust: ['alice'], requireMfa: true }]),
    policies: z
      .array(
        z.object({
          id: name,
          effect: z.enum(['allow', 'deny']),
          principal: pattern,
          actions: z.array(pattern).min(1).max(8),
          resources: z.array(pattern).min(1).max(8),
          requireMfa: z.boolean().default(false),
          environment: z.enum(['any', 'dev', 'prod']).default('any'),
          source: ipv4Cidr.default('0.0.0.0/0'),
        }),
      )
      .min(1)
      .max(16)
      .default([
        {
          id: 'read-course',
          effect: 'allow',
          principal: 'role:reader',
          actions: ['storage:read'],
          resources: ['bucket/course/*'],
          requireMfa: false,
          environment: 'any',
          source: '0.0.0.0/0',
        },
        {
          id: 'deny-delete',
          effect: 'deny',
          principal: '*',
          actions: ['storage:delete'],
          resources: ['*'],
          requireMfa: false,
          environment: 'any',
          source: '0.0.0.0/0',
        },
      ]),
    operations: z
      .array(
        z.discriminatedUnion('kind', [
          z.object({
            kind: z.literal('assume'),
            principal,
            role: name,
            session: name,
            mfa: z.boolean().default(false),
          }),
          z.object({
            kind: z.literal('call'),
            principal,
            session: name.optional(),
            action: name,
            resource: name,
            mfa: z.boolean().default(false),
            environment: z.enum(['dev', 'prod']).default('dev'),
            source: z.ipv4().default('192.0.2.10'),
          }),
          z.object({ kind: z.literal('tick') }),
        ]),
      )
      .min(1)
      .max(24),
  })
  .strict()
  .superRefine((p, ctx) => {
    if (
      new Set(p.roles.map((r) => r.name)).size !== p.roles.length ||
      new Set(p.policies.map((p) => p.id)).size !== p.policies.length
    )
      ctx.addIssue({
        code: 'custom',
        message: 'Role names and policy IDs must be distinct.',
      });
  });
export const iam: Visualizer<z.infer<typeof schema>> = {
  id: 'iam-users-roles-policies',
  maxSize: 24,
  measureSize: (p) => p.operations.length,
  inputHint:
    'Flattened case-sensitive grant/deny statements, conditions, role trust and short-lived issued-session fixtures. Explicit matching deny overrides matching allow; otherwise default deny. A caller cannot claim a role principal without a trusted session bound to its original identity. MFA/source/environment flags represent trusted exercise context, never a pattern for accepting unverified client claims. AWS and GCP have additional distinct hierarchy/boundary evaluators not modeled here.',
  controls: [
    {
      key: 'sessionTTL',
      label: 'Temporary role-session lifetime in operation ticks',
      type: 'number',
      min: 1,
      max: 12,
    },
  ],
  presets: {
    best: schema.parse({
      operations: [
        {
          kind: 'assume',
          principal: 'alice',
          role: 'reader',
          session: 's1',
          mfa: true,
        },
        {
          kind: 'call',
          principal: 'alice',
          session: 's1',
          action: 'storage:read',
          resource: 'bucket/course/a',
        },
      ],
    }),
    average: schema.parse({
      sessionTTL: 3,
      operations: [
        {
          kind: 'assume',
          principal: 'alice',
          role: 'reader',
          session: 's1',
          mfa: true,
        },
        {
          kind: 'call',
          principal: 'alice',
          session: 's1',
          action: 'storage:read',
          resource: 'bucket/course/a',
        },
        {
          kind: 'call',
          principal: 'alice',
          session: 's1',
          action: 'storage:delete',
          resource: 'bucket/course/a',
        },
        {
          kind: 'call',
          principal: 'alice',
          session: 's1',
          action: 'storage:read',
          resource: 'bucket/course/a',
        },
      ],
    }),
    worst: schema.parse({
      operations: [
        {
          kind: 'assume',
          principal: 'mallory',
          role: 'reader',
          session: 's1',
          mfa: true,
        },
        {
          kind: 'assume',
          principal: 'alice',
          role: 'reader',
          session: 's2',
          mfa: false,
        },
        {
          kind: 'call',
          principal: 'alice',
          action: 'storage:read',
          resource: 'bucket/course/a',
        },
      ],
    }),
    random: (n) =>
      schema.parse({
        operations: [
          {
            kind: 'assume',
            principal: 'alice',
            role: 'reader',
            session: 's1',
            mfa: true,
          },
          ...Array.from({ length: Math.min(23, Math.max(0, n - 1)) }, () => ({
            kind: 'call',
            principal: 'alice',
            session: 's1',
            action: 'storage:read',
            resource: 'bucket/course/a',
          })),
        ],
      }),
  },
  validateInput: (raw) => schema.parse(raw),
  complexity: {
    best: 'An untrusted or expired session is rejected before policy evaluation',
    average: 'O(calls × statements × bounded pattern matching)',
    worst:
      'Broad wildcard grants expand the resource/action set unless constrained by conditions or explicit deny',
    space: 'O(policies + roles + temporary-session fixtures + history)',
    why: 'This is not full AWS IAM/SCP/resource/boundary evaluation or Google allow/deny/access-boundary hierarchy. Use native policy simulators and least-privilege review for a real deployment.',
    metric: { label: 'Policy statements checked', keys: ['policyChecks'] },
  },
  *generate(p) {
    const sessions = new Map<
        string,
        { principal: string; role: string; mfa: boolean; expires: number }
      >(),
      history: {
        tick: number;
        kind: string;
        identity: string | null;
        allowed: boolean;
        reason: string;
        matchingAllows: string[];
        matchingDenies: string[];
      }[] = [],
      c = counters();
    c.policyChecks = 0;
    c.allowed = 0;
    c.denied = 0;
    c.issued = 0;
    const scene: VisualState = {
      kind: 'architecture',
      values: [],
      nodes: [
        {
          id: 'principal',
          label: 'Authenticated source identity',
          x: 0,
          y: 100,
        },
        { id: 'trust', label: 'Role trust + MFA', x: 240, y: 0 },
        { id: 'session', label: 'Temporary session / expiry', x: 480, y: 0 },
        {
          id: 'policy',
          label: 'Action/resource/condition evaluation',
          x: 480,
          y: 200,
        },
        {
          id: 'resource',
          label: 'Default deny; explicit deny wins',
          x: 740,
          y: 100,
        },
      ],
      edges: [
        { from: 'principal', to: 'trust' },
        { from: 'trust', to: 'session' },
        { from: 'session', to: 'policy' },
        { from: 'principal', to: 'policy' },
        { from: 'policy', to: 'resource' },
      ],
    };
    yield frame(
      scene,
      'Authentication identifies a caller; authorization decides whether its current identity and context may perform this action.',
      c,
      1,
    );
    for (let tick = 0; tick < p.operations.length; tick++) {
      const op = p.operations[tick];
      let allowed = false,
        reason = '',
        identity: string | null = null;
      const matchingAllows: string[] = [],
        matchingDenies: string[] = [];
      if (op.kind === 'tick') reason = 'time-advanced';
      else if (op.kind === 'assume') {
        const role = p.roles.find((r) => r.name === op.role);
        identity = op.principal;
        if (sessions.has(op.session)) reason = 'session-ID-already-used';
        else if (!role) reason = 'unknown-role';
        else if (
          !role.trust.some((pattern) => globMatch(pattern, op.principal))
        )
          reason = 'role-trust-rejected';
        else if (role.requireMfa && !op.mfa) reason = 'role-MFA-required';
        else {
          sessions.set(op.session, {
            principal: op.principal,
            role: op.role,
            mfa: op.mfa,
            expires: tick + p.sessionTTL,
          });
          c.issued++;
          allowed = true;
          reason = 'temporary-session-issued';
        }
      } else {
        identity = op.principal;
        let contextMfa = op.mfa,
          valid = true;
        if (op.session) {
          const session = sessions.get(op.session);
          if (!session) {
            reason = 'unknown-session';
            valid = false;
          } else if (session.principal !== op.principal) {
            reason = 'session-owner-mismatch';
            valid = false;
          } else if (session.expires <= tick) {
            reason = 'expired-session';
            valid = false;
          } else {
            identity = `role:${session.role}`;
            contextMfa = session.mfa;
          }
        }
        if (valid) {
          for (const statement of p.policies) {
            c.policyChecks++;
            const matches =
              globMatch(statement.principal, identity) &&
              statement.actions.some((pattern) =>
                globMatch(pattern, op.action),
              ) &&
              statement.resources.some((pattern) =>
                globMatch(pattern, op.resource),
              ) &&
              (!statement.requireMfa || contextMfa) &&
              (statement.environment === 'any' ||
                statement.environment === op.environment) &&
              cidrContains(statement.source, op.source);
            if (matches)
              (statement.effect === 'deny'
                ? matchingDenies
                : matchingAllows
              ).push(statement.id);
          }
          allowed = matchingAllows.length > 0 && matchingDenies.length === 0;
          reason = matchingDenies.length
            ? 'explicit-deny'
            : matchingAllows.length
              ? 'matching-allow'
              : 'default-deny';
        }
        yield frame(
          scene,
          'Evaluate the trusted current identity, action, resource and conditions; an explicit deny dominates any allow.',
          c,
          3,
          { identity, action: op.action, resource: op.resource, tick },
          [],
          {
            prompt: 'What is the authorization result?',
            choices: ['Allow action', 'Deny action'],
            answer: allowed ? 'Allow action' : 'Deny action',
            hint: 'Role trust does not grant every action. Check session binding/expiry, matching conditions, explicit denies and finally default deny.',
          },
        );
        if (allowed) c.allowed++;
        else c.denied++;
      }
      history.push({
        tick,
        kind: op.kind,
        identity,
        allowed,
        reason,
        matchingAllows,
        matchingDenies,
      });
      yield frame(
        scene,
        'Keep session issuance and resource authorization distinct; these session IDs are public teaching fixtures, not credentials.',
        c,
        5,
        { tick, allowed, reason, identity },
        [
          {
            id: op.kind === 'assume' ? 'trust' : 'policy',
            kind: allowed ? 'visited' : 'error',
          },
        ],
      );
    }
    yield frame(
      {
        ...scene,
        result: {
          sessions: Object.fromEntries(sessions),
          history,
          allowedCalls: c.allowed,
          deniedCalls: c.denied,
          issuedSessions: c.issued,
          scope:
            'Public exercise identities/session IDs, bounded glob patterns and flattened deny-overrides policy; no real credentials or cloud authorization operation.',
        },
      },
      'Prefer narrowly scoped roles, verified trusted context and short-lived credentials; validate actual provider policy semantics separately.',
      c,
      6,
    );
  },
};
