import 'server-only';
import { z } from 'zod';
import { frame, counters } from '@/engine/helpers';
import type { Visualizer, VisualState } from '@/engine/types';
const customer = z.object({
  id: z.number().int().min(0).max(99),
  name: z.string().min(1).max(24),
});
const order = z.object({
  id: z.number().int().min(0).max(99),
  customerId: z.number().int().min(0).max(99).nullable(),
  amount: z.number().int().min(0).max(999),
});
const schema = z
  .object({
    customers: z.array(customer).max(16),
    orders: z.array(order).max(24),
    join: z.enum(['inner', 'left', 'right', 'full']).default('left'),
    minAmount: z.number().int().min(0).max(999).default(0),
    havingTotal: z.number().int().min(0).max(9999).default(0),
    limit: z.number().int().min(1).max(16).default(8),
    enforceConstraints: z.boolean().default(true),
  })
  .strict();
type Input = z.infer<typeof schema>;
const base = {
  customers: [
    { id: 1, name: 'Asha' },
    { id: 2, name: 'Ben' },
    { id: 3, name: 'Chen' },
  ],
  orders: [
    { id: 10, customerId: 1, amount: 30 },
    { id: 11, customerId: 1, amount: 70 },
    { id: 12, customerId: 2, amount: 15 },
    { id: 13, customerId: null, amount: 50 },
  ],
};
function scene(): VisualState {
  return {
    kind: 'architecture',
    values: [],
    nodes: [
      { id: 'customers', label: 'Customers: primary key id', x: 0, y: 0 },
      { id: 'orders', label: 'Orders: FK customerId → id', x: 0, y: 140 },
      { id: 'join', label: 'FROM / JOIN + ON', x: 230, y: 70 },
      { id: 'filter', label: 'WHERE → GROUP → HAVING', x: 460, y: 70 },
      { id: 'output', label: 'SELECT → ORDER → LIMIT', x: 690, y: 70 },
    ],
    edges: [
      { from: 'customers', to: 'join' },
      { from: 'orders', to: 'join' },
      { from: 'join', to: 'filter' },
      { from: 'filter', to: 'output' },
    ],
  };
}
export function relational(slug = 'sql-joins'): Visualizer<Input> {
  const query = slug === 'sql-query-execution-order',
    keys = ['relational-model-keys', 'er-modelling'].includes(slug);
  return {
    id: slug,
    maxSize: 24,
    measureSize: (p) => p.orders.length,
    inputHint:
      'Small customers/orders relations. Customer and order IDs are primary keys; nullable customerId is a foreign key. SQL equality never matches NULL. Duplicates and orphan keys are reported; enforced constraints reject the example relation before query execution. JOIN outputs preserve bag multiplicity. Query-order mode applies WHERE before grouping, then HAVING, ORDER and LIMIT.',
    controls: [
      {
        key: 'join',
        label: 'SQL join type',
        type: 'select',
        options: ['inner', 'left', 'right', 'full'].map((value) => ({
          value,
          label: value,
        })),
      },
      {
        key: 'enforceConstraints',
        label: 'Enforce primary and foreign keys',
        type: 'boolean',
      },
      ...(query
        ? [
            {
              key: 'minAmount',
              label: 'WHERE minimum order amount',
              type: 'number' as const,
              min: 0,
              max: 999,
            },
            {
              key: 'havingTotal',
              label: 'HAVING minimum total',
              type: 'number' as const,
              min: 0,
              max: 9999,
            },
            {
              key: 'limit',
              label: 'Result row limit',
              type: 'number' as const,
              min: 1,
              max: 16,
            },
          ]
        : []),
    ],
    presets: {
      best: schema.parse({
        customers: [base.customers[0]],
        orders: [base.orders[0]],
      }),
      average: schema.parse(base),
      worst: schema.parse({
        ...base,
        enforceConstraints: false,
        customers: [...base.customers, { id: 1, name: 'Duplicate' }],
        orders: [...base.orders, { id: 10, customerId: 9, amount: 8 }],
      }),
      random: (n) => {
        const count = Math.min(16, Math.max(1, n));
        return schema.parse({
          customers: Array.from({ length: count }, (_, i) => ({
            id: i,
            name: `C${i}`,
          })),
          orders: Array.from({ length: Math.min(24, n) }, (_, i) => ({
            id: i,
            customerId: i % count,
            amount: (i * 17) % 100,
          })),
        });
      },
    },
    validateInput: (raw) => schema.parse(raw),
    complexity: {
      best: 'O(C + O) key validation plus query work',
      average: 'O(C × O) nested-loop join; grouping and result sorting follow',
      worst: 'O(C × O + G log G); bag duplicates can multiply rows',
      space: 'O(C + O + output rows + groups)',
      why: 'C customers, O orders and G groups. This is an explicit logical query evaluator, not PostgreSQL optimizer order or a claim about indexed/hash joins.',
      metric: { label: 'Join comparisons', keys: ['comparisons'] },
    },
    *generate(p) {
      const c = counters(),
        s = scene(),
        violations: string[] = [],
        customerIds = new Set<number>(),
        orderIds = new Set<number>();
      yield frame(
        s,
        'Identify entities, keys and the one-to-many relationship before evaluating a query.',
        c,
        1,
      );
      for (const row of p.customers) {
        c.reads++;
        if (customerIds.has(row.id))
          violations.push(`Duplicate Customer.id ${row.id}`);
        customerIds.add(row.id);
      }
      for (const row of p.orders) {
        c.reads++;
        if (orderIds.has(row.id))
          violations.push(`Duplicate Order.id ${row.id}`);
        orderIds.add(row.id);
        if (row.customerId !== null && !customerIds.has(row.customerId))
          violations.push(`Orphan Order.customerId ${row.customerId}`);
      }
      yield frame(
        s,
        'A nullable foreign key permits NULL, but a non-null value must reference an existing customer.',
        c,
        2,
        { violations: violations.length },
        violations.length ? [{ id: 'orders', kind: 'error' }] : [],
        {
          prompt:
            'Can this dataset be accepted with the displayed constraint setting?',
          choices: ['Accept dataset', 'Reject constraint violations'],
          answer:
            p.enforceConstraints && violations.length
              ? 'Reject constraint violations'
              : 'Accept dataset',
          hint: 'Primary keys must be unique. Non-null foreign keys must exist; disabling enforcement is an explicit unsafe experiment.',
        },
      );
      if (keys || (p.enforceConstraints && violations.length)) {
        yield frame(
          {
            ...s,
            result: {
              accepted: !p.enforceConstraints || violations.length === 0,
              violations,
              customers: p.customers.length,
              orders: p.orders.length,
              nullableForeignKeys: p.orders.filter((o) => o.customerId === null)
                .length,
              cardinality:
                'One customer to many orders; an order has zero or one customer when constraints hold.',
            },
          },
          'The relationship is a data invariant, not just a line on an ER diagram.',
          c,
          6,
        );
        return;
      }
      type Joined = {
        customerId: number | null;
        customerName: string | null;
        orderId: number | null;
        amount: number | null;
      };
      const joined: Joined[] = [],
        matchedOrders = new Set<number>();
      for (const customer of p.customers) {
        let matched = false;
        for (let index = 0; index < p.orders.length; index++) {
          const order = p.orders[index];
          c.comparisons++;
          c.reads += 2;
          const equal =
            order.customerId !== null && customer.id === order.customerId;
          yield frame(
            s,
            'ON tests equality; SQL NULL does not compare equal to a key.',
            c,
            3,
            { customer: customer.id, order: order.id, matches: equal },
            [{ id: 'join', kind: 'comparing' }],
            {
              prompt: 'Does this ON equality produce a matched row?',
              choices: ['Emit matched pair', 'No match'],
              answer: equal ? 'Emit matched pair' : 'No match',
              hint: 'Compare the customer primary key with a non-null order foreign key.',
            },
          );
          if (equal) {
            matched = true;
            matchedOrders.add(index);
            joined.push({
              customerId: customer.id,
              customerName: customer.name,
              orderId: order.id,
              amount: order.amount,
            });
            c.writes++;
          }
        }
        if (!matched && ['left', 'full'].includes(p.join)) {
          joined.push({
            customerId: customer.id,
            customerName: customer.name,
            orderId: null,
            amount: null,
          });
          c.writes++;
        }
      }
      if (['right', 'full'].includes(p.join))
        p.orders.forEach((o, i) => {
          if (!matchedOrders.has(i)) {
            joined.push({
              customerId: null,
              customerName: null,
              orderId: o.id,
              amount: o.amount,
            });
            c.writes++;
          }
        });
      yield frame(
        s,
        'Outer joins add null-extended unmatched rows only on preserved sides.',
        c,
        4,
        { joinedRows: joined.length },
        [{ id: 'join', kind: 'visited' }],
      );
      if (!query) {
        yield frame(
          { ...s, result: { join: p.join, rows: joined, violations } },
          'A join emits one row per matching pair and preserves SQL bag multiplicity.',
          c,
          6,
          { rows: joined.length },
        );
        return;
      }
      const filtered = joined.filter((row) => {
        c.reads++;
        return row.amount !== null && row.amount >= p.minAmount;
      });
      yield frame(
        s,
        'WHERE filters individual rows before aggregates. A condition on the right table can remove null-extended LEFT JOIN rows.',
        c,
        4,
        { before: joined.length, after: filtered.length },
        [{ id: 'filter', kind: 'comparing' }],
      );
      const groups = new Map<
        string,
        {
          customerId: number | null;
          customerName: string | null;
          total: number;
          count: number;
        }
      >();
      for (const row of filtered) {
        const key = JSON.stringify([row.customerId, row.customerName]),
          group = groups.get(key) ?? {
            customerId: row.customerId,
            customerName: row.customerName,
            total: 0,
            count: 0,
          };
        group.total += row.amount!;
        group.count++;
        groups.set(key, group);
        c.writes++;
      }
      const having = [...groups.values()].filter(
        (g) => g.total >= p.havingTotal,
      );
      having.sort((a, b) => {
        c.comparisons++;
        return (
          b.total - a.total ||
          (a.customerId ?? 100) - (b.customerId ?? 100) ||
          (a.customerName ?? '').localeCompare(b.customerName ?? '')
        );
      });
      yield frame(
        {
          ...s,
          result: {
            joined,
            afterWhere: filtered,
            groups: [...groups.values()],
            afterHaving: having,
            rows: having.slice(0, p.limit),
            logicalOrder: [
              'FROM/JOIN/ON',
              'WHERE',
              'GROUP BY',
              'HAVING',
              'SELECT',
              'ORDER BY',
              'LIMIT',
            ],
            violations,
          },
        },
        'HAVING filters groups, ORDER sorts selected aggregates, and LIMIT applies last. Physical execution may differ while preserving semantics.',
        c,
        6,
        { groups: groups.size, outputRows: Math.min(having.length, p.limit) },
        [{ id: 'output', kind: 'visited' }],
      );
    },
  };
}
