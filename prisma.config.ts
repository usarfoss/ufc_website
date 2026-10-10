import "dotenv/config";
import { defineConfig } from "prisma/config";
import { assertNotProduction } from "./prisma/db-guard";

/**
 * The Prisma command line (migrations) wants a direct connection: the pooled address does not support the locks a migration takes. So
 * DIRECT_URL is used when it is set, and DATABASE_URL (which the running site uses, pooled) when it is not.
 */
const url = process.env.DIRECT_URL || process.env.DATABASE_URL;

assertNotProduction(url, "This Prisma command");

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url,
  },
});
