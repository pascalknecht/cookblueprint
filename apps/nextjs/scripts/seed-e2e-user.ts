// Ensures a fixed, already-verified account exists for the mobile app's
// server-backed Maestro flows (apps/mobile/.maestro/*, tagged "server").
//
// Those flows can't complete real email verification locally — there's no
// working RESEND_API_KEY in dev — so this does by script what the mobile
// README otherwise has a developer do by hand: sign up through the real API,
// then flip emailVerified directly in the database.
//
// Talks to the running dev server for sign-up (same endpoint the app calls),
// not to src/lib/auth.ts directly — that file transitively imports
// "server-only", which throws when loaded outside Next's own build pipeline.
//
// Usage: pnpm dlx tsx scripts/seed-e2e-user.ts
// Run from apps/nextjs, with the dev server already running (pnpm dev).

import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(scriptDir, "..", ".env") });

const { PrismaClient } = await import(
  "../src/lib/generated/prisma/client/client"
);
const { PrismaPg } = await import("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Keep in sync with the credentials hardcoded into apps/mobile/.maestro/*.yaml.
export const E2E_USER_EMAIL = "e2e@example.com";
export const E2E_USER_PASSWORD = "e2e-test-password-1234";
const E2E_USER_NAME = "E2E Test";

async function main() {
  const baseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

  const response = await fetch(`${baseUrl}/api/auth/sign-up/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: E2E_USER_NAME,
      email: E2E_USER_EMAIL,
      password: E2E_USER_PASSWORD,
    }),
  });

  if (response.ok) {
    console.log(`Created ${E2E_USER_EMAIL}`);
  } else {
    const bodyText = await response.text();
    const alreadyExists =
      response.status === 422 || /already exists/i.test(bodyText);
    if (!alreadyExists) {
      throw new Error(`Sign-up failed (${response.status}): ${bodyText}`);
    }
    console.log(`${E2E_USER_EMAIL} already exists`);
  }

  const user = await prisma.user.update({
    where: { email: E2E_USER_EMAIL },
    data: { emailVerified: true },
  });

  console.log(`${E2E_USER_EMAIL} is verified (id: ${user.id}) and ready for E2E flows.`);
}

await main();
await prisma.$disconnect();
