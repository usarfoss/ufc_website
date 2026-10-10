/**
 * A laptop must not be able to point a Prisma command (migrate reset, db push, seed...) at the real database by accident. That is how most
 * "everything is gone" stories start: a .env that still holds the production address, and a command meant for a test database.
 *
 * Set PRODUCTION_DB_HOST on your machine (just the host name of the production database, with or without "-pooler"). From then on any Prisma
 * command or script here that would connect to it stops, unless you say ALLOW_PRODUCTION_DB=yes for that one command. On Vercel (the
 * VERCEL variable is set) it does nothing, because that is where the real database is meant to be used.
 */
const hostOf = (value: string) => {
  try {
    return new URL(value).hostname.replace("-pooler", "").toLowerCase();
  } catch {
    return "";
  }
};

export function assertNotProduction(connectionString: string | undefined, what: string) {
  const production = process.env.PRODUCTION_DB_HOST?.trim();
  if (!production || !connectionString || process.env.VERCEL || process.env.ALLOW_PRODUCTION_DB === "yes") return;

  if (hostOf(connectionString) === production.replace("-pooler", "").toLowerCase()) {
    throw new Error(
      `${what} would run against the PRODUCTION database (${production}). This is blocked on purpose.\n` +
        "Point DATABASE_URL at your development database (a Neon branch) instead. " +
        "If you really mean to change production, run this one command with ALLOW_PRODUCTION_DB=yes in front of it.",
    );
  }
}
