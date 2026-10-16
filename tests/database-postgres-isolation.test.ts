// @vitest-environment node
import { randomUUID } from 'node:crypto';
import { Client } from 'pg';
import { describe, expect, it } from 'vitest';
describe.skipIf(!process.env.DATABASE_URL)(
  'independent PostgreSQL write-skew reference',
  () => {
    it.each(['REPEATABLE READ', 'SERIALIZABLE'] as const)(
      '%s cross-row invariant behavior',
      async (isolation) => {
        const schema = `isolation_test_${randomUUID().replaceAll('-', '')}`,
          clients = [0, 1, 2].map(
            () => new Client({ connectionString: process.env.DATABASE_URL }),
          );
        await Promise.all(clients.map((c) => c.connect()));
        const [admin, a, b] = clients;
        try {
          await admin.query(`CREATE SCHEMA "${schema}"`);
          await admin.query(
            `CREATE TABLE "${schema}".on_call (id int primary key, active int not null)`,
          );
          await admin.query(
            `INSERT INTO "${schema}".on_call VALUES (1,1),(2,1)`,
          );
          await a.query(`BEGIN ISOLATION LEVEL ${isolation}`);
          await b.query(`BEGIN ISOLATION LEVEL ${isolation}`);
          expect(
            (
              await a.query(
                `SELECT sum(active)::int AS total FROM "${schema}".on_call`,
              )
            ).rows[0].total,
          ).toBe(2);
          expect(
            (
              await b.query(
                `SELECT sum(active)::int AS total FROM "${schema}".on_call`,
              )
            ).rows[0].total,
          ).toBe(2);
          let aborts = 0;
          const execute = async (client: Client, sql: string) => {
            try {
              await client.query(sql);
            } catch (error) {
              if ((error as { code?: string }).code !== '40001') throw error;
              aborts++;
              await client.query('ROLLBACK');
            }
          };
          await execute(
            a,
            `UPDATE "${schema}".on_call SET active=0 WHERE id=1`,
          );
          await execute(
            b,
            `UPDATE "${schema}".on_call SET active=0 WHERE id=2`,
          );
          await execute(a, 'COMMIT');
          await execute(b, 'COMMIT');
          const total = (
            await admin.query(
              `SELECT sum(active)::int AS total FROM "${schema}".on_call`,
            )
          ).rows[0].total;
          if (isolation === 'REPEATABLE READ') {
            expect(aborts).toBe(0);
            expect(total).toBe(0);
          } else {
            expect(aborts).toBeGreaterThan(0);
            expect(total).toBeGreaterThanOrEqual(1);
          }
        } finally {
          await Promise.allSettled([a.query('ROLLBACK'), b.query('ROLLBACK')]);
          await admin.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
          await Promise.all(clients.map((c) => c.end()));
        }
      },
    );
  },
);
