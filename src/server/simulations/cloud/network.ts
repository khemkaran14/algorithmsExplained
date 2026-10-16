import 'server-only';
import { z } from 'zod';
import { frame, counters } from '@/engine/helpers';
import type { Visualizer, VisualState } from '@/engine/types';
export function ipv4Number(value: string) {
  return value.split('.').reduce((n, part) => n * 256 + Number(part), 0) >>> 0;
}
export function cidrContains(cidr: string, ip: string) {
  const [network, bits] = cidr.split('/'),
    prefix = Number(bits),
    mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  return (ipv4Number(ip) & mask) >>> 0 === (ipv4Number(network) & mask) >>> 0;
}
const cidr = z.string().refine((value) => {
  const [address, bits, ...extra] = value.split('/');
  if (
    extra.length ||
    !z.ipv4().safeParse(address).success ||
    !/^([0-9]|[12][0-9]|3[0-2])$/.test(bits ?? '')
  )
    return false;
  const prefix = Number(bits),
    mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  return ipv4Number(address) === (ipv4Number(address) & mask) >>> 0;
}, 'Use a canonical IPv4 network CIDR, for example 10.0.0.0/16.');
const rule = z
  .object({
    direction: z.enum(['inbound', 'outbound']),
    action: z.enum(['allow', 'deny']),
    protocol: z.enum(['tcp', 'udp', 'all']).default('all'),
    cidr,
    from: z.number().int().min(0).max(65535),
    to: z.number().int().min(0).max(65535),
    priority: z.number().int().min(0).max(1000),
  })
  .refine((r) => r.to >= r.from, 'Port interval must be ordered.');
const schema = z
  .object({
    vmIP: z.ipv4().default('10.0.1.10'),
    subnet: cidr.default('10.0.1.0/24'),
    publicIP: z.boolean().default(false),
    policy: z
      .enum(['stateful-allow-list', 'ordered-stateless', 'priority-stateful'])
      .default('stateful-allow-list'),
    routes: z
      .array(
        z.object({
          cidr,
          target: z.enum(['local', 'internet', 'nat', 'peering', 'blackhole']),
          priority: z.number().int().min(0).max(1000).default(100),
        }),
      )
      .min(1)
      .max(12)
      .default([
        { cidr: '10.0.0.0/16', target: 'local', priority: 100 },
        { cidr: '0.0.0.0/0', target: 'nat', priority: 100 },
      ]),
    rules: z
      .array(rule)
      .max(16)
      .default([
        {
          direction: 'outbound',
          action: 'allow',
          protocol: 'all',
          cidr: '0.0.0.0/0',
          from: 443,
          to: 443,
          priority: 100,
        },
      ]),
    packets: z
      .array(
        z.object({
          direction: z.enum(['inbound', 'outbound']),
          source: z.ipv4(),
          destination: z.ipv4(),
          sourcePort: z.number().int().min(1).max(65535),
          destinationPort: z.number().int().min(1).max(65535),
          protocol: z.enum(['tcp', 'udp']).default('tcp'),
        }),
      )
      .min(1)
      .max(24),
  })
  .strict()
  .superRefine((p, ctx) => {
    if (
      p.policy === 'ordered-stateless' &&
      new Set(p.rules.map((rule) => `${rule.direction}:${rule.priority}`))
        .size !== p.rules.length
    )
      ctx.addIssue({
        code: 'custom',
        message:
          'Ordered stateless rule numbers must be unique within each direction.',
      });
    if (!cidrContains(p.subnet, p.vmIP))
      ctx.addIssue({
        code: 'custom',
        message: 'VM address must belong to its subnet.',
      });
    if (
      p.policy === 'stateful-allow-list' &&
      p.rules.some((r) => r.action === 'deny')
    )
      ctx.addIssue({
        code: 'custom',
        message: 'An allow-list policy cannot contain explicit deny rules.',
      });
    if (
      p.packets.some(
        (packet) =>
          (packet.direction === 'outbound'
            ? packet.source
            : packet.destination) !== p.vmIP,
      )
    )
      ctx.addIssue({
        code: 'custom',
        message: 'Every packet must use the VM address on its local endpoint.',
      });
  });
type Input = z.infer<typeof schema>;
const packets: Input['packets'] = [
  {
    direction: 'outbound',
    source: '10.0.1.10',
    destination: '203.0.113.10',
    sourcePort: 50000,
    destinationPort: 443,
    protocol: 'tcp',
  },
  {
    direction: 'inbound',
    source: '203.0.113.10',
    destination: '10.0.1.10',
    sourcePort: 443,
    destinationPort: 50000,
    protocol: 'tcp',
  },
];
export function networking(slug = 'vpc-subnets-routes-nat'): Visualizer<Input> {
  return {
    id: slug,
    maxSize: 24,
    measureSize: (p) => p.packets.length,
    inputHint:
      'Canonical IPv4 CIDRs, longest-prefix routing, abstract gateway/NAT admission and three firewall policy styles. Outbound NAT establishes a mapping only after a permitted initiation; unsolicited inbound traffic cannot use it. Stateful return traffic can reuse an established allowed flow; stateless policies need a reverse-port rule. This bounded five-tuple request/reply model omits full TCP state, NAT port allocation, timeouts and exact provider route precedence.',
    controls: [
      {
        key: 'publicIP',
        label: 'VM has an Internet-routable public mapping',
        type: 'boolean',
      },
      {
        key: 'policy',
        label: 'Firewall policy style',
        type: 'select',
        options: [
          'stateful-allow-list',
          'ordered-stateless',
          'priority-stateful',
        ].map((value) => ({ value, label: value })),
      },
    ],
    presets: {
      best: schema.parse({ packets }),
      average: schema.parse({
        packets: [
          ...packets,
          {
            direction: 'inbound',
            source: '198.51.100.5',
            destination: '10.0.1.10',
            sourcePort: 40000,
            destinationPort: 22,
            protocol: 'tcp',
          },
        ],
      }),
      worst: schema.parse({ policy: 'ordered-stateless', packets }),
      random: (n) =>
        schema.parse({
          packets: Array.from(
            { length: Math.min(24, Math.max(1, n)) },
            (_, i) => ({ ...packets[i % 2] }),
          ),
        }),
    },
    validateInput: (raw) => schema.parse(raw),
    complexity: {
      best: 'An established stateful reply reuses a permitted flow after route/gateway checks',
      average:
        'O(packets × (routes + rules)) simple table scan and priority ordering',
      worst:
        'A missing reverse rule or NAT mapping blocks traffic even when another layer permits it',
      space: 'O(routes + rules + tracked flows + history)',
      why: 'Security groups are stateful allow lists; AWS NACLs are ordered stateless rules; Google VPC firewall rules use priority/stateful behavior. These conceptual styles omit provider-specific details, hierarchical policy and implied rules.',
      metric: { label: 'Firewall rule checks', keys: ['ruleChecks'] },
    },
    *generate(p) {
      const flows = new Set<string>(),
        nat = new Set<string>(),
        history: {
          packet: number;
          direction: string;
          route: string | null;
          target: string | null;
          routeAllowed: boolean;
          firewallAllowed: boolean;
          established: boolean;
          allowed: boolean;
          reason: string;
        }[] = [],
        c = counters();
      c.ruleChecks = 0;
      c.routeChecks = 0;
      c.allowed = 0;
      c.denied = 0;
      const flow = (packet: Input['packets'][number]) =>
          `${packet.protocol}|${packet.source}|${packet.sourcePort}|${packet.destination}|${packet.destinationPort}`,
        reverse = (packet: Input['packets'][number]) =>
          `${packet.protocol}|${packet.destination}|${packet.destinationPort}|${packet.source}|${packet.sourcePort}`;
      const scene: VisualState = {
        kind: 'architecture',
        values: [],
        nodes: [
          { id: 'vm', label: `VM ${p.vmIP} / ${p.subnet}`, x: 0, y: 100 },
          { id: 'firewall', label: p.policy, x: 240, y: 100 },
          { id: 'route', label: 'Longest-prefix route', x: 480, y: 100 },
          {
            id: 'gateway',
            label: 'Local / peer / Internet / NAT',
            x: 720,
            y: 100,
          },
        ],
        edges: [
          { from: 'vm', to: 'firewall' },
          { from: 'firewall', to: 'route' },
          { from: 'route', to: 'gateway' },
        ],
      };
      yield frame(
        scene,
        'Routing reachability, address translation and firewall admission are independent decisions.',
        c,
        1,
      );
      for (let index = 0; index < p.packets.length; index++) {
        const packet = p.packets[index],
          peer =
            packet.direction === 'outbound'
              ? packet.destination
              : packet.source;
        const routes = p.routes
            .map((route, order) => ({ ...route, order }))
            .filter((route) => {
              c.routeChecks++;
              return cidrContains(route.cidr, peer);
            })
            .sort(
              (a, b) =>
                Number(b.cidr.split('/')[1]) - Number(a.cidr.split('/')[1]) ||
                a.priority - b.priority ||
                a.order - b.order,
            ),
          route = routes[0],
          established = flows.has(flow(packet)) || flows.has(reverse(packet));
        let routeAllowed = route !== undefined && route.target !== 'blackhole',
          reason = route ? 'route-selected' : 'no-route';
        if (routeAllowed && route!.target === 'internet' && !p.publicIP) {
          routeAllowed = false;
          reason = 'internet-route-needs-public-mapping';
        }
        if (
          routeAllowed &&
          route!.target === 'nat' &&
          packet.direction === 'inbound' &&
          !nat.has(reverse(packet))
        ) {
          routeAllowed = false;
          reason = 'NAT-rejects-unsolicited-inbound';
        }
        let firewallAllowed = false;
        if (p.policy !== 'ordered-stateless' && established)
          firewallAllowed = true;
        else {
          const rules = p.rules
            .map((r, order) => ({ ...r, order }))
            .sort(
              (a, b) =>
                a.priority - b.priority ||
                (p.policy === 'priority-stateful'
                  ? Number(a.action !== 'deny') - Number(b.action !== 'deny')
                  : 0) ||
                a.order - b.order,
            );
          for (const rule of rules) {
            c.ruleChecks++;
            if (
              rule.direction !== packet.direction ||
              (rule.protocol !== 'all' && rule.protocol !== packet.protocol) ||
              !cidrContains(rule.cidr, peer) ||
              packet.destinationPort < rule.from ||
              packet.destinationPort > rule.to
            )
              continue;
            if (p.policy === 'stateful-allow-list') {
              firewallAllowed = true;
              break;
            }
            firewallAllowed = rule.action === 'allow';
            break;
          }
        }
        const allowed = routeAllowed && firewallAllowed;
        yield frame(
          scene,
          'Apply the most specific route and gateway requirements, then the chosen stateful/stateless firewall semantics.',
          c,
          3,
          {
            packet: index,
            peer,
            route: route?.cidr ?? 'none',
            target: route?.target ?? 'none',
            established,
          },
          [],
          {
            prompt: 'Does this packet pass every modeled network layer?',
            choices: ['Allow packet', 'Reject packet'],
            answer: allowed ? 'Allow packet' : 'Reject packet',
            hint: 'A firewall allow cannot repair a missing route/public mapping. NAT accepts only mapped replies; stateless return ports need their own rules.',
          },
        );
        if (allowed) {
          c.allowed++;
          if (p.policy !== 'ordered-stateless') flows.add(flow(packet));
          if (packet.direction === 'outbound' && route!.target === 'nat')
            nat.add(flow(packet));
          reason =
            established && p.policy !== 'ordered-stateless'
              ? 'established-return-allowed'
              : 'all-layers-allowed';
        } else {
          c.denied++;
          if (routeAllowed && !firewallAllowed)
            reason = 'firewall-default-or-explicit-deny';
        }
        history.push({
          packet: index,
          direction: packet.direction,
          route: route?.cidr ?? null,
          target: route?.target ?? null,
          routeAllowed,
          firewallAllowed,
          established,
          allowed,
          reason,
        });
        yield frame(
          scene,
          'Record why a layer admitted or rejected the packet without sending network traffic.',
          c,
          5,
          { packet: index, allowed, reason },
          [
            {
              id: allowed ? 'gateway' : routeAllowed ? 'firewall' : 'route',
              kind: allowed ? 'visited' : 'error',
            },
          ],
        );
      }
      yield frame(
        {
          ...scene,
          result: {
            history,
            allowed: c.allowed,
            denied: c.denied,
            trackedFlows: [...flows],
            natMappings: [...nat],
            scope:
              'One VM, canonical IPv4, abstract gateway admission and request/reply tracking. No actual packets, vendor control-plane operations or complete TCP/NAT behavior.',
          },
        },
        'Compare provider policy styles using concrete direction, ports and connection state; route tables and network security policies solve different parts of reachability.',
        c,
        6,
      );
    },
  };
}

export { cidr as ipv4Cidr };
