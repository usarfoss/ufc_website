/**
 * Checks that a database can be reached, and says what kind of connection and permissions you have. It only ever reads.
 *
 *   npm run db:ping                       checks DATABASE_URL from .env
 *   npm run db:ping -- "postgresql://…"   checks any other database (a standby, a restored copy)
 *
 * What it tells you:
 *  - whether the address is Neon's pooled one (what the running site should use) or the direct one (what migrations and backups use),
 *  - how long connecting and one query took (a database that was asleep shows up here as a few seconds),
 *  - the Postgres version (the backup tools have to be the same version or newer),
 *  - whether this login could drop or empty the tables (the site's own login should not be able to), and how many rows the main tables hold.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.argv.slice(2).find((arg) => arg.startsWith("postgres")) ?? process.env.DATABASE_URL;
if (!connectionString) throw new Error("Give an address, or set DATABASE_URL.");

const host = new URL(connectionString).hostname;
const pooled = host.includes("-pooler");
console.log(`host        ${host}  (${pooled ? "pooled" : "direct"})`);

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString, max: 1, connectionTimeoutMillis: 20_000 }) });

try {
  const t0 = Date.now();
  const [info] = await prisma.$queryRawUnsafe<{ version: string; user: string; db: string }[]>(
    "select version() as version, current_user as user, current_database() as db",
  );
  const connectMs = Date.now() - t0;

  const t1 = Date.now();
  await prisma.$queryRawUnsafe("select 1");
  const queryMs = Date.now() - t1;

  console.log(`connected   ${connectMs} ms  (a second query took ${queryMs} ms)`);
  console.log(`login       ${info.user} on ${info.db}`);
  console.log(`version     ${info.version.split(",")[0]}`);

  const [rights] = await prisma.$queryRawUnsafe<{ owner: string | null; truncate: boolean | null }[]>(
    `select (select tableowner from pg_tables where schemaname = 'public' and tablename = 'users') as owner,
            case when to_regclass('public.users') is null then null else has_table_privilege(current_user, 'public.users', 'TRUNCATE') end as truncate`,
  );
  if (rights.owner === null) {
    console.log("tables      none found (an empty database)");
  } else {
    const owns = rights.owner === info.user;
    console.log(`tables      owned by ${rights.owner}`);
    console.log(
      `power       ${
        owns || rights.truncate
          ? "this login CAN drop or empty the tables (use it for migrations only, never for the running site)"
          : "this login can read and write rows but cannot drop or empty tables"
      }`,
    );
    const counts = await prisma.$queryRawUnsafe<{ name: string; rows: bigint }[]>(
      `select 'users' as name, count(*)::bigint as rows from users
       union all select 'events', count(*)::bigint from events
       union all select 'event_attendees', count(*)::bigint from event_attendees
       union all select 'activities', count(*)::bigint from activities`,
    );
    for (const row of counts) console.log(`rows        ${row.name.padEnd(16)}${row.rows}`);
  }
} finally {
  await prisma.$disconnect();
}
