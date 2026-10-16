// @vitest-environment node
import { Client } from 'pg';
import { describe, expect, it } from 'vitest';
import { relational } from '@/server/simulations/database/relational';
function result(slug: string, raw: unknown) {
  const v = relational(slug);
  return [...v.generate(v.validateInput(raw))].at(-1)!.state.result as Record<
    string,
    unknown
  >;
}
it('rejects duplicate primary keys and non-null orphan foreign keys while accepting NULL', () => {
  const r = result('relational-model-keys', {
    customers: [
      { id: 1, name: 'A' },
      { id: 1, name: 'B' },
    ],
    orders: [
      { id: 1, customerId: null, amount: 1 },
      { id: 2, customerId: 9, amount: 2 },
    ],
  });
  expect(r.accepted).toBe(false);
  expect(r.nullableForeignKeys).toBe(1);
  expect(r.violations).toHaveLength(2);
});
it('preserves bag multiplicity when constraints are intentionally disabled', () => {
  const r = result('sql-joins', {
    enforceConstraints: false,
    customers: [
      { id: 1, name: 'A' },
      { id: 1, name: 'A' },
    ],
    orders: [
      { id: 1, customerId: 1, amount: 2 },
      { id: 1, customerId: 1, amount: 2 },
    ],
    join: 'inner',
  });
  expect(r.rows).toHaveLength(4);
});
it('a right-side WHERE predicate removes unmatched left rows before grouping', () => {
  const v = relational('sql-query-execution-order'),
    r = result(v.id, v.presets.average);
  expect((r.joined as unknown[]).length).toBeGreaterThan(
    (r.afterWhere as unknown[]).length,
  );
  expect(r.rows).toEqual([
    { customerId: 1, customerName: 'Asha', total: 100, count: 2 },
    { customerId: 2, customerName: 'Ben', total: 15, count: 1 },
  ]);
});
describe.skipIf(!process.env.DATABASE_URL)(
  'independent PostgreSQL semantics',
  () => {
    it.each(['inner', 'left', 'right', 'full'] as const)(
      '%s join matches PostgreSQL including NULL extension',
      async (join) => {
        const client = new Client({
          connectionString: process.env.DATABASE_URL,
        });
        await client.connect();
        try {
          const v = relational(),
            p = v.validateInput({ ...v.presets.average, join });
          // JSON recordsets isolate every test without creating or changing application tables.
          const sql = `WITH customers AS (SELECT * FROM jsonb_to_recordset($1::jsonb) AS c(id int,name text)), orders AS (SELECT * FROM jsonb_to_recordset($2::jsonb) AS o(id int,"customerId" int,amount int)) SELECT c.id AS "customerId",c.name AS "customerName",o.id AS "orderId",o.amount FROM customers c ${join.toUpperCase()} JOIN orders o ON c.id=o."customerId"`;
          const actual = (
            await client.query(sql, [
              JSON.stringify(p.customers),
              JSON.stringify(p.orders),
            ])
          ).rows;
          const expected = result(v.id, p).rows as unknown[];
          const sorted = (rows: unknown[]) =>
            rows.map((row) => JSON.stringify(row)).sort();
          expect(sorted(expected)).toEqual(sorted(actual));
        } finally {
          await client.end();
        }
      },
    );
    it('logical filter/group/having/order/limit matches PostgreSQL', async () => {
      const client = new Client({ connectionString: process.env.DATABASE_URL });
      await client.connect();
      try {
        const v = relational('sql-query-execution-order'),
          p = v.validateInput({
            ...v.presets.average,
            minAmount: 20,
            havingTotal: 80,
            limit: 1,
          });
        const sql = `WITH customers AS (SELECT * FROM jsonb_to_recordset($1::jsonb) AS c(id int,name text)), orders AS (SELECT * FROM jsonb_to_recordset($2::jsonb) AS o(id int,"customerId" int,amount int)) SELECT c.id AS "customerId",c.name AS "customerName",sum(o.amount)::int AS total,count(*)::int AS count FROM customers c LEFT JOIN orders o ON c.id=o."customerId" WHERE o.amount >= $3 GROUP BY c.id,c.name HAVING sum(o.amount) >= $4 ORDER BY total DESC,c.id,c.name LIMIT $5`;
        expect(result(v.id, p).rows).toEqual(
          (
            await client.query(sql, [
              JSON.stringify(p.customers),
              JSON.stringify(p.orders),
              p.minAmount,
              p.havingTotal,
              p.limit,
            ])
          ).rows,
        );
      } finally {
        await client.end();
      }
    });
  },
);
