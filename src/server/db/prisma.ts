import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaRead: PrismaClient | undefined;
};

/**
 * How many connections one server instance may hold open. Every serverless instance has its own pool, so this is multiplied by however many
 * instances are running at once, and the database has a hard limit on connections. Through Neon's pooled address (a host with "-pooler" in it)
 * many of these share a few real connections, which is what lets a few hundred people use the site at once. Keep it small.
 */
const POOL_MAX = Math.max(1, Number(process.env.DATABASE_POOL_MAX) || 5);

let warned = false;
/** The pooled address is the one for the running site. A direct address works until enough people arrive at once, and then it falls over. */
const warnIfNotPooled = (connectionString: string) => {
  if (warned || process.env.NODE_ENV !== "production") return;
  warned = true;
  try {
    const host = new URL(connectionString).hostname;
    if (host.endsWith(".neon.tech") && !host.includes("-pooler")) {
      console.warn(
        `DATABASE_URL points at ${host}, which is Neon's direct address. Use the pooled one (the host with "-pooler" in it) for the running site, ` +
          "and keep the direct one in DIRECT_URL for migrations.",
      );
    }
  } catch {
    // Not a URL we can read: the driver will say what is wrong with it.
  }
};

const createPrismaClient = (connectionString: string) =>
  new PrismaClient({
    adapter: new PrismaPg({
      connectionString,
      max: POOL_MAX,
      // Connections that nobody is using are let go quickly, so a quiet site holds none open and the database is free to go to sleep.
      idleTimeoutMillis: 10_000,
      // A database that has been asleep takes a few seconds to wake. Waiting that long is better than failing the first visitor.
      connectionTimeoutMillis: 15_000,
    }),
  });

/** A client that is only created the first time it is used, so route discovery during a build does not need secrets. */
const lazy = (create: () => PrismaClient) => {
  let client: PrismaClient | undefined;
  const get = () => (client ??= create());
  return new Proxy({} as PrismaClient, {
    get(_target, property) {
      const instance = get();
      const value = Reflect.get(instance, property, instance);
      return typeof value === "function" ? value.bind(instance) : value;
    },
  });
};

/** The primary database. Everything writes here, and anything that has to see its own writes reads here. */
export const prisma = lazy(() => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL must be configured before creating Prisma Client.");
  }

  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  warnIfNotPooled(connectionString);
  const client = createPrismaClient(connectionString);
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
  return client;
});

/**
 * Where reads go when a slightly old answer is fine: the read replica if DATABASE_REPLICA_URL is set, and the primary if it is not (so nothing
 * changes until a replica exists). A replica trails the primary by a moment, so only use this for reads that do not feed a cache or sit right
 * after a write: a cache would hold the old answer for its whole lifetime, and a member would not see what they just did.
 */
export const prismaRead: PrismaClient = process.env.DATABASE_REPLICA_URL
  ? lazy(() => {
      if (globalForPrisma.prismaRead) return globalForPrisma.prismaRead;
      const client = createPrismaClient(process.env.DATABASE_REPLICA_URL!);
      if (process.env.NODE_ENV !== "production") globalForPrisma.prismaRead = client;
      return client;
    })
  : prisma;
