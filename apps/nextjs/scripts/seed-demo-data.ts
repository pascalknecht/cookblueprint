// Replaces a household's recipes, meal plan, and shopping list with a curated,
// good-looking demo data set — used to produce marketing screenshots.
//
// Image handling: uploads each source photo to DigitalOcean Spaces if configured
// (DO_SPACES_* in apps/nextjs/.env — see .env.example), otherwise hotlinks the
// Unsplash source URL directly.
//
// Usage: pnpm dlx tsx scripts/seed-demo-data.ts [email]
//   email — a member's email to pick their organization. Defaults to
//   test.user@example.com.
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

const HOUSEHOLD_NAME = "Rivera's Kitchen";
const USER_NAME = "Sam Rivera";

type SeedRecipe = {
  key: string;
  title: string;
  color: string;
  time: number;
  servings: number;
  kcal: string;
  tags: string[];
  sourceImageUrl: string;
  ingredients: { n: string; q: string; cat: string }[];
  steps: string[];
};

// All photos are Unsplash License (free to use), referenced by their public photo id.
const RECIPES: SeedRecipe[] = [
  {
    key: "chicken",
    title: "Herb-Roasted Chicken with Peas & Tomatoes",
    color: "#C77C3A", // clay
    time: 55,
    servings: 4,
    kcal: "520",
    tags: ["Dinner"],
    sourceImageUrl:
      "https://images.unsplash.com/photo-1670398564097-0762e1b30b3a?w=1200&h=900&fit=crop&crop=entropy&q=80",
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
  },
  {
    key: "pancakes",
    title: "Fluffy Banana Pancakes",
    color: "#E8A33D", // gold
    time: 20,
    servings: 2,
    kcal: "410",
    tags: ["Breakfast"],
    sourceImageUrl:
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200&h=900&fit=crop&crop=entropy&q=80",
    ingredients: [
      { n: "Flour", q: "200 g", cat: "Pantry" },
      { n: "Ripe banana", q: "2", cat: "Produce" },
      { n: "Eggs", q: "2", cat: "Dairy & Eggs" },
      { n: "Milk", q: "250 ml", cat: "Dairy & Eggs" },
      { n: "Baking powder", q: "2 tsp", cat: "Pantry" },
      { n: "Butter", q: "1 tbsp", cat: "Dairy & Eggs" },
      { n: "Maple syrup", q: "to serve", cat: "Pantry" },
    ],
    steps: [
      "Mash the bananas in a large bowl until mostly smooth.",
      "Whisk in the eggs and milk, then sift in the flour and baking powder and stir until just combined.",
      "Melt a little butter in a nonstick pan over medium heat and ladle in rounds of batter.",
      "Cook for 2–3 minutes until bubbles form on top, then flip and cook 1–2 minutes more.",
      "Stack and serve warm with maple syrup and extra banana slices.",
    ],
  },
  {
    key: "yogurtBowl",
    title: "Sunrise Yogurt & Berry Bowl",
    color: "#D98324", // amber
    time: 8,
    servings: 1,
    kcal: "320",
    tags: ["Breakfast", "Veg"],
    sourceImageUrl:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&h=900&fit=crop&crop=entropy&q=80",
    ingredients: [
      { n: "Greek yogurt", q: "250 g", cat: "Dairy & Eggs" },
      { n: "Mixed berries", q: "100 g", cat: "Produce" },
      { n: "Rolled oats", q: "3 tbsp", cat: "Pantry" },
      { n: "Honey", q: "1 tbsp", cat: "Pantry" },
      { n: "Chia seeds", q: "1 tsp", cat: "Pantry" },
    ],
    steps: [
      "Spoon the yogurt into a bowl.",
      "Top with berries, oats, and chia seeds.",
      "Drizzle with honey and serve right away.",
    ],
  },
  {
    key: "salmonVeg",
    title: "Pan-Seared Salmon with Garden Vegetables",
    color: "#C4553E", // brand
    time: 30,
    servings: 2,
    kcal: "540",
    tags: ["Dinner"],
    sourceImageUrl:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=1200&h=900&fit=crop&crop=entropy&q=80",
    ingredients: [
      { n: "Salmon fillets", q: "2 pieces", cat: "Meat & Fish" },
      { n: "Baby spinach", q: "100 g", cat: "Produce" },
      { n: "Cucumber", q: "1", cat: "Produce" },
      { n: "Cherry tomatoes", q: "100 g", cat: "Produce" },
      { n: "Olive oil", q: "2 tbsp", cat: "Pantry" },
      { n: "Lemon", q: "1", cat: "Produce" },
      { n: "Salt & pepper", q: "to taste", cat: "Pantry" },
    ],
    steps: [
      "Pat the salmon dry and season with salt and pepper.",
      "Heat olive oil in a skillet over medium-high heat and sear the salmon skin-side down for 4–5 minutes.",
      "Flip and cook 2–3 minutes more until just cooked through.",
      "Wilt the spinach in the same pan, then plate with cucumber and cherry tomatoes.",
      "Finish with a squeeze of lemon.",
    ],
  },
  {
    key: "chickpeaBowl",
    title: "Rainbow Chickpea & Avocado Bowl",
    color: "#2FA46A", // success
    time: 15,
    servings: 2,
    kcal: "430",
    tags: ["Lunch", "Veg"],
    sourceImageUrl:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&h=900&fit=crop&crop=entropy&q=80",
    ingredients: [
      { n: "Chickpeas (canned)", q: "1 can", cat: "Pantry" },
      { n: "Avocado", q: "1", cat: "Produce" },
      { n: "Cherry tomatoes", q: "100 g", cat: "Produce" },
      { n: "Sweet potato", q: "1", cat: "Produce" },
      { n: "Red cabbage", q: "80 g", cat: "Produce" },
      { n: "Mixed sprouts", q: "a handful", cat: "Produce" },
      { n: "Lemon dressing", q: "2 tbsp", cat: "Pantry" },
    ],
    steps: [
      "Roast diced sweet potato at 200°C (400°F) for 20 minutes until tender.",
      "Rinse and drain the chickpeas.",
      "Arrange the cabbage, tomatoes, and sprouts around a bowl.",
      "Add the roasted sweet potato, chickpeas, and sliced avocado in the center.",
      "Drizzle with lemon dressing and serve.",
    ],
  },
  {
    key: "steakTagliatelle",
    title: "Creamy Steak Tagliatelle",
    color: "#B0447E", // berry
    time: 35,
    servings: 3,
    kcal: "610",
    tags: ["Dinner"],
    sourceImageUrl:
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=1200&h=900&fit=crop&crop=entropy&q=80",
    ingredients: [
      { n: "Tagliatelle", q: "300 g", cat: "Pantry" },
      { n: "Sirloin steak", q: "300 g", cat: "Meat & Fish" },
      { n: "Sun-dried tomatoes", q: "60 g", cat: "Pantry" },
      { n: "Baby spinach", q: "80 g", cat: "Produce" },
      { n: "Heavy cream", q: "200 ml", cat: "Dairy & Eggs" },
      { n: "Parmesan", q: "40 g", cat: "Dairy & Eggs" },
      { n: "Garlic", q: "2 cloves", cat: "Produce" },
    ],
    steps: [
      "Cook the tagliatelle in salted boiling water until al dente; reserve a cup of pasta water.",
      "Sear the steak in a hot pan for 2–3 minutes per side, then rest and slice thin.",
      "In the same pan, soften the garlic and sun-dried tomatoes, then stir in the cream.",
      "Add the spinach and simmer until wilted, then toss in the drained pasta and parmesan.",
      "Top with the sliced steak and serve immediately.",
    ],
  },
  {
    key: "squashSoup",
    title: "Roasted Butternut Squash Soup",
    color: "#E8A33D", // gold
    time: 40,
    servings: 4,
    kcal: "260",
    tags: ["Lunch", "Veg"],
    sourceImageUrl:
      "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=1200&h=900&fit=crop&crop=entropy&q=80",
    ingredients: [
      { n: "Butternut squash", q: "1 large", cat: "Produce" },
      { n: "Onion", q: "1", cat: "Produce" },
      { n: "Garlic", q: "2 cloves", cat: "Produce" },
      { n: "Vegetable stock", q: "800 ml", cat: "Pantry" },
      { n: "Heavy cream", q: "100 ml", cat: "Dairy & Eggs" },
      { n: "Feta", q: "50 g", cat: "Dairy & Eggs" },
      { n: "Pumpkin seeds", q: "2 tbsp", cat: "Pantry" },
    ],
    steps: [
      "Roast the cubed squash with onion and garlic at 200°C (400°F) for 25 minutes.",
      "Transfer to a pot with the vegetable stock and simmer for 10 minutes.",
      "Blend until smooth, then stir in the cream.",
      "Ladle into bowls and top with crumbled feta and pumpkin seeds.",
    ],
  },
  {
    key: "thaiBeefSalad",
    title: "Thai Beef Salad with Fresh Herbs",
    color: "#C4553E", // brand
    time: 25,
    servings: 2,
    kcal: "390",
    tags: ["Dinner", "Lunch"],
    sourceImageUrl:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=900&fit=crop&crop=entropy&q=80",
    ingredients: [
      { n: "Beef sirloin", q: "300 g", cat: "Meat & Fish" },
      { n: "Mixed salad leaves", q: "100 g", cat: "Produce" },
      { n: "Red onion", q: "1/2", cat: "Produce" },
      { n: "Fresh mint & coriander", q: "a handful", cat: "Produce" },
      { n: "Cashew nuts", q: "30 g", cat: "Pantry" },
      { n: "Lime", q: "1", cat: "Produce" },
      { n: "Fish sauce", q: "1 tbsp", cat: "Pantry" },
    ],
    steps: [
      "Sear the beef 2–3 minutes per side for medium-rare, then rest and slice thin.",
      "Toss the salad leaves, red onion, and herbs in a large bowl.",
      "Whisk lime juice with fish sauce for the dressing.",
      "Top the salad with sliced beef and cashews, then drizzle with dressing.",
    ],
  },
  {
    key: "salmonPoke",
    title: "Sesame Salmon Poke Bowl",
    color: "#2FA46A", // success
    time: 20,
    servings: 2,
    kcal: "470",
    tags: ["Lunch"],
    sourceImageUrl:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&h=900&fit=crop&crop=entropy&q=80",
    ingredients: [
      { n: "Salmon fillet (sushi-grade)", q: "250 g", cat: "Meat & Fish" },
      { n: "Cooked rice", q: "300 g", cat: "Pantry" },
      { n: "Edamame", q: "100 g", cat: "Produce" },
      { n: "Sweetcorn", q: "80 g", cat: "Produce" },
      { n: "Cucumber", q: "1", cat: "Produce" },
      { n: "Red cabbage", q: "60 g", cat: "Produce" },
      { n: "Soy-sesame dressing", q: "2 tbsp", cat: "Pantry" },
    ],
    steps: [
      "Cube the salmon and toss lightly in soy-sesame dressing.",
      "Divide the rice between bowls.",
      "Arrange the salmon, edamame, corn, cucumber, and cabbage on top.",
      "Drizzle with extra dressing and serve chilled or at room temperature.",
    ],
  },
];

// Monday–Sunday of the current week.
function currentWeekDates(): Date[] {
  const today = new Date();
  const day = today.getDay(); // 0 = Sunday
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + mondayOffset);
  return Array.from({ length: 7 }, (_, i) => new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i));
}

const WEEK_PLAN: Record<string, { breakfast: string; lunch: string; dinner: string }> = {
  mon: { breakfast: "pancakes", lunch: "chickpeaBowl", dinner: "chicken" },
  tue: { breakfast: "yogurtBowl", lunch: "squashSoup", dinner: "salmonVeg" },
  wed: { breakfast: "pancakes", lunch: "salmonPoke", dinner: "steakTagliatelle" },
  thu: { breakfast: "yogurtBowl", lunch: "thaiBeefSalad", dinner: "chicken" },
  fri: { breakfast: "pancakes", lunch: "chickpeaBowl", dinner: "salmonVeg" },
  sat: { breakfast: "yogurtBowl", lunch: "squashSoup", dinner: "steakTagliatelle" },
  sun: { breakfast: "pancakes", lunch: "salmonPoke", dinner: "thaiBeefSalad" },
};
const WEEK_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

const SHOPPING_ITEMS: { name: string; quantity: string; category: string; checked: boolean }[] = [
  { name: "Avocado", quantity: "3", category: "Produce", checked: false },
  { name: "Cherry tomatoes", quantity: "500 g", category: "Produce", checked: true },
  { name: "Baby spinach", quantity: "200 g", category: "Produce", checked: true },
  { name: "Red cabbage", quantity: "1 head", category: "Produce", checked: false },
  { name: "Fresh basil", quantity: "1 bunch", category: "Produce", checked: false },
  { name: "Garlic", quantity: "1 bulb", category: "Produce", checked: true },
  { name: "Sweet potatoes", quantity: "4", category: "Produce", checked: false },
  { name: "Greek yogurt", quantity: "500 g", category: "Dairy & Eggs", checked: false },
  { name: "Butter", quantity: "250 g", category: "Dairy & Eggs", checked: true },
  { name: "Parmesan", quantity: "100 g", category: "Dairy & Eggs", checked: false },
  { name: "Eggs", quantity: "12", category: "Dairy & Eggs", checked: true },
  { name: "Salmon fillets", quantity: "4 pieces", category: "Meat & Fish", checked: false },
  { name: "Sirloin steak", quantity: "600 g", category: "Meat & Fish", checked: false },
  { name: "Chicken breast", quantity: "4 pieces", category: "Meat & Fish", checked: false },
  { name: "Sourdough bread", quantity: "1 loaf", category: "Bakery", checked: true },
  { name: "Tortilla wraps", quantity: "8", category: "Bakery", checked: false },
  { name: "Basmati rice", quantity: "1 kg", category: "Pantry", checked: false },
  { name: "Honey", quantity: "1 jar", category: "Pantry", checked: true },
];

const RECENT_EXTRA = [
  { name: "Milk", category: "Dairy & Eggs" },
  { name: "Olive oil", category: "Pantry" },
  { name: "Rolled oats", category: "Pantry" },
  { name: "Cucumber", category: "Produce" },
];

async function resolveOrganization(email: string) {
  const member = await prisma.member.findFirst({
    where: { user: { email } },
    orderBy: { createdAt: "asc" },
    select: { organizationId: true, userId: true },
  });
  if (!member) throw new Error(`No member found for "${email}". Sign up with that email first.`);
  return member;
}

async function resolveImageUrl(sourceUrl: string, slug: string): Promise<string> {
  if (!isSpacesConfigured()) return sourceUrl;
  const key = `recipes/${Date.now()}-${slug}.jpg`;
  return uploadImageFromUrl(sourceUrl, key);
}

async function main() {
  const email = process.argv[2] ?? "test.user@example.com";
  const { organizationId, userId } = await resolveOrganization(email);

  await prisma.organization.update({ where: { id: organizationId }, data: { name: HOUSEHOLD_NAME } });
  await prisma.user.update({ where: { id: userId }, data: { name: USER_NAME } });

  await prisma.recipe.deleteMany({ where: { organizationId } }); // cascades meal plan entries
  await prisma.shoppingListItem.deleteMany({ where: { organizationId } });
  await prisma.recentShoppingItem.deleteMany({ where: { organizationId } });

  const recipeIdByKey: Record<string, string> = {};
  for (const recipe of RECIPES) {
    console.log(`Creating recipe "${recipe.title}"…`);
    const imageUrl = await resolveImageUrl(recipe.sourceImageUrl, recipe.key);
    const created = await prisma.recipe.create({
      data: {
        organizationId,
        title: recipe.title,
        color: recipe.color,
        imageUrl,
        time: recipe.time,
        servings: recipe.servings,
        kcal: recipe.kcal,
        tags: recipe.tags,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
      },
    });
    recipeIdByKey[recipe.key] = created.id;
  }

  const dates = currentWeekDates();
  let mealPlanCount = 0;
  for (let i = 0; i < WEEK_ORDER.length; i++) {
    const dayKey = WEEK_ORDER[i]!;
    const date = dates[i]!;
    const day = WEEK_PLAN[dayKey]!;
    for (const [mealType, recipeKey] of Object.entries(day)) {
      await prisma.mealPlanEntry.create({
        data: { organizationId, date, mealType, recipeId: recipeIdByKey[recipeKey]! },
      });
      mealPlanCount++;
    }
  }
  console.log(`Created ${mealPlanCount} meal plan entries for the week of ${dates[0]!.toDateString()}.`);

  await prisma.shoppingListItem.createMany({
    data: SHOPPING_ITEMS.map((item) => ({ ...item, organizationId })),
  });
  console.log(`Created ${SHOPPING_ITEMS.length} shopping list items.`);

  const recentNames = new Map<string, string>();
  for (const item of SHOPPING_ITEMS) recentNames.set(item.name, item.category);
  for (const extra of RECENT_EXTRA) recentNames.set(extra.name, extra.category);
  await prisma.recentShoppingItem.createMany({
    data: Array.from(recentNames.entries()).map(([name, category]) => ({ organizationId, name, category })),
  });
  console.log(`Created ${recentNames.size} recent shopping item suggestions.`);

  console.log(`\nDone. Household "${HOUSEHOLD_NAME}" (${organizationId}) is ready for screenshots.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
