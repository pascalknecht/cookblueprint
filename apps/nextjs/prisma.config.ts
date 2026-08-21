import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

const appRoot = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(appRoot, ".env") });

export default defineConfig({
  schema: "prisma",
  datasource: {
    // `prisma generate` (unlike `migrate`/`db push`) never opens a
    // connection — it only reads the schema — so this only needs to be
    // *some* string, not a working one. Using prisma/config's `env()`
    // helper here would throw at config-load time whenever DATABASE_URL
    // is unset, which breaks `pnpm install` for every workspace in this
    // monorepo (postinstall runs prisma generate), not just this app —
    // e.g. building apps/mobile has no reason to have a database URL.
    url: process.env.DATABASE_URL ?? "postgresql://user:password@localhost:5432/placeholder",
  },
});
