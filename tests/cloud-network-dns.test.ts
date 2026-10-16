import { expect, it } from 'vitest';
import { networking, cidrContains } from '@/server/simulations/cloud/network';
import { dns } from '@/server/simulations/cloud/dns';
function net(raw: unknown) {
  const v = networking();
  return [...v.generate(v.validateInput(raw))].at(-1)!.state.result as {
    allowed: number;
    denied: number;
    history: { allowed: boolean; target: string; reason: string }[];
  };
}
function resolve(raw: unknown) {
  return [...dns.generate(dns.validateInput(raw))].at(-1)!.state.result as {
    history: {
      status: string;
      addresses: string[];
      stale: boolean;
      unhealthyTargets: string[];
    }[];
    cacheHits: number;
  };
}
it('CIDR membership handles /0, host routes and unsigned high addresses', () => {
  expect(cidrContains('0.0.0.0/0', '255.255.255.255')).toBe(true);
  expect(cidrContains('255.255.255.255/32', '255.255.255.255')).toBe(true);
  expect(cidrContains('10.0.0.0/16', '10.1.0.1')).toBe(false);
});
it('stateful NAT permits a mapped reply and rejects unsolicited inbound initiation', () => {
  const r = net(networking().presets.average);
  expect(r.history.map((h) => h.allowed)).toEqual([true, true, false]);
  expect(r.history[2].reason).toBe('NAT-rejects-unsolicited-inbound');
});
it('stateless filtering needs the reverse ephemeral-port rule even when NAT has a mapping', () => {
  const r = net(networking().presets.worst);
  expect(r.history.map((h) => h.allowed)).toEqual([true, false]);
});
it('a more specific blackhole route overrides an otherwise usable default NAT path', () => {
  const p = networking().presets.best,
    r = net({
      ...p,
      routes: [
        ...p.routes,
        { cidr: '203.0.113.0/24', target: 'blackhole', priority: 1 },
      ],
    });
  expect(r.allowed).toBe(0);
  expect(r.history[0].target).toBe('blackhole');
});
it('an Internet route alone does not give a private VM public reachability', () => {
  const p = networking().presets.best,
    r = net({ ...p, routes: [{ cidr: '0.0.0.0/0', target: 'internet' }] });
  expect(r.allowed).toBe(0);
});
it('an authoritative update and shorter new TTL do not rewrite an old cached expiration', () => {
  const r = resolve(dns.presets.average);
  expect(r.history[2].addresses).toEqual(['10.0.0.1']);
  expect(r.history[2].stale).toBe(true);
  expect(r.history[3].addresses).toEqual(['10.0.0.2']);
  expect(r.history[4].addresses).toEqual(['10.0.0.2']);
});
it('cached negative answers can outlive a newly created authoritative record', () => {
  const r = resolve(dns.presets.worst);
  expect(r.history[5].status).toBe('authoritative-NXDOMAIN');
  expect(r.history[7].status).toBe('cached-NXDOMAIN');
  expect(r.history[7].stale).toBe(true);
});
it('health filtering does not erase a previously cached unhealthy target', () => {
  const r = resolve(dns.presets.worst);
  expect(r.history[2].unhealthyTargets).toEqual(['10.0.0.1']);
  expect(r.history[3].status).toBe('modeled-no-healthy-answer');
});
