// Adds one sample recipe (with a real photo) to a household's recipe book.
//
// Image handling: uploads the source photo to DigitalOcean Spaces if configured
// (DO_SPACES_* in apps/nextjs/.env — see .env.example), otherwise falls back to
// hotlinking the source URL directly so the recipe still renders today.
//
// Usage: pnpm dlx tsx scripts/seed-sample-recipe.ts [email]
//   email — a member's email to pick their organization. Defaults to the first
//   organization found (by creation order) if omitted or not matched.
//
// Run from apps/nextjs/.

import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(scriptDir, "..", ".env") });

const { PrismaClient } = await import("../src/lib/generated/prisma/client/client");
const { PrismaPg } = await import("@prisma/adapter-pg");
const { isSpacesConfigured, uploadImageFromUrl } = await import("../src/lib/storage");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Elena Leya — https://unsplash.com/photos/photo-1670398564097-0762e1b30b3a (Unsplash License, free to use)
const SOURCE_IMAGE_URL =
  "https://images.unsplash.com/photo-1670398564097-0762e1b30b3a?w=1200&h=900&fit=crop&crop=entropy&q=80";

const SAMPLE_RECIPE = {
  title: "Herb-Roasted Chicken with Peas & Tomatoes",
  color: "#C77C3A", // MiseColors.clay
  time: 55,
  servings: 4,
  kcal: "520",
  tags: ["Dinner"],
  ingredients: [
    { n: "Chicken breast", q: "4 pieces", cat: "Meat & Fish" },
    { n: "Cherry tomatoes", q: "200 g", cat: "Produce" },
    { n: "Frozen peas", q: "150 g", cat: "Produce" },
    { n: "Garlic", q: "3 cloves", cat: "Produce" },
    { n: "Butter", q: "2 tbsp", cat: "Dairy & Eggs" },
    { n: "Olive oil", q: "2 tbsp", cat: "Pantry" },
    { n: "Smoked paprika", q: "1 tsp", cat: "Pantry" },
    { n: "Salt & pepper", q: "to taste", cat: "Pantry" },
  ],
  steps: [
    "Pat the chicken breasts dry and season both sides with salt, pepper, and smoked paprika.",
    "Heat olive oil in a large oven-safe skillet over medium-high heat and sear the chicken for 3–4 minutes per side until golden.",
    "Add garlic and cherry tomatoes to the pan, then transfer to a 200°C (400°F) oven for 15–18 minutes until the chicken is cooked through.",
    "Stir in the peas and butter during the last 3 minutes so they warm through and the sauce turns glossy.",
    "Rest the chicken for 5 minutes, slice, and serve spooned over with the pan sauce.",
  ],
};

async function resolveOrganizationId(emailArg?: string) {
  if (emailArg) {
    const member = await prisma.member.findFirst({
      where: { user: { email: emailArg } },
      orderBy: { createdAt: "asc" },
      select: { organizationId: true },
    });
    if (member) return member.organizationId;
    console.warn(`No member found for "${emailArg}" — falling back to the first organization.`);
  }

  const org = await prisma.organization.findFirst({ orderBy: { createdAt: "asc" }, select: { id: true, name: true } });
  if (!org) throw new Error("No organization exists yet — sign up in the app first.");
  return org.id;
}

async function resolveImageUrl(): Promise<string> {
  if (!isSpacesConfigured()) {
    console.log("DigitalOcean Spaces not configured — using the Unsplash URL directly (see .env.example).");
    return SOURCE_IMAGE_URL;
  }

  console.log("Uploading source image to DigitalOcean Spaces…");
  const key = `recipes/${Date.now()}-herb-roasted-chicken.jpg`;
  const url = await uploadImageFromUrl(SOURCE_IMAGE_URL, key);
  console.log(`Uploaded to ${url}`);
  return url;
}

async function main() {
  const emailArg = process.argv[2];
  const organizationId = await resolveOrganizationId(emailArg);
  const imageUrl = await resolveImageUrl();

  const recipe = await prisma.recipe.create({
    data: { ...SAMPLE_RECIPE, imageUrl, organizationId },
  });

  console.log(`Created recipe "${recipe.title}" (${recipe.id}) in organization ${organizationId}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
