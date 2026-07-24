import { prisma } from "@/lib/prisma";
import { toPaginationEnvelope, toSkipTake, type PaginationQuery } from "@/lib/pagination";
import type { RecipeIngredientInput } from "./recipes";

export type ShoppingItemInput = {
  name: string;
  quantity: string;
  category: string;
};

function parseIngredients(ingredients: unknown): RecipeIngredientInput[] {
  if (!Array.isArray(ingredients)) return [];
  return ingredients.filter(
    (ing): ing is RecipeIngredientInput =>
      typeof ing === "object" && ing !== null && "n" in ing && "q" in ing && "cat" in ing,
  );
}

export async function listShoppingItems(organizationId: string, pagination: PaginationQuery) {
  const where = { organizationId };

  const [items, total] = await Promise.all([
    prisma.shoppingListItem.findMany({
      where,
      orderBy: { createdAt: pagination.orderDirection },
      ...toSkipTake(pagination),
    }),
    prisma.shoppingListItem.count({ where }),
  ]);

  return toPaginationEnvelope(items, total, pagination);
}

export function createShoppingItem(organizationId: string, data: ShoppingItemInput) {
  return prisma.shoppingListItem.create({ data: { ...data, organizationId } });
}

export async function updateShoppingItem(
  organizationId: string,
  id: string,
  data: Partial<ShoppingItemInput & { checked: boolean }>,
) {
  const existing = await prisma.shoppingListItem.findFirst({ where: { id, organizationId }, select: { id: true } });
  if (!existing) return null;

  return prisma.shoppingListItem.update({ where: { id }, data });
}

export async function deleteShoppingItem(organizationId: string, id: string) {
  const existing = await prisma.shoppingListItem.findFirst({ where: { id, organizationId }, select: { id: true } });
  if (!existing) return false;

  await prisma.shoppingListItem.delete({ where: { id } });
  return true;
}

export async function deleteShoppingItemsBulk(organizationId: string, ids: string[]) {
  const result = await prisma.shoppingListItem.deleteMany({ where: { id: { in: ids }, organizationId } });
  return result.count;
}

/** Creates only the items whose name doesn't already exist (case-insensitive) in the org's list. */
async function createDedupedItems(organizationId: string, candidates: ShoppingItemInput[]) {
  if (candidates.length === 0) return [];

  const existing = await prisma.shoppingListItem.findMany({
    where: { organizationId },
    select: { name: true },
  });
  const existingNames = new Set(existing.map((item) => item.name.toLowerCase()));

  const seen = new Set<string>();
  const toCreate = candidates.filter((item) => {
    const key = item.name.toLowerCase();
    if (existingNames.has(key) || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  if (toCreate.length === 0) return [];

  await prisma.shoppingListItem.createMany({
    data: toCreate.map((item) => ({ ...item, organizationId })),
  });

  return prisma.shoppingListItem.findMany({
    where: { organizationId, name: { in: toCreate.map((item) => item.name) } },
  });
}

export function createShoppingItemsBulk(organizationId: string, items: ShoppingItemInput[]) {
  return createDedupedItems(organizationId, items);
}

export async function addRecipeIngredientsToShoppingList(organizationId: string, recipeId: string) {
  const recipe = await prisma.recipe.findFirst({ where: { id: recipeId, organizationId } });
  if (!recipe) return null;

  const candidates = parseIngredients(recipe.ingredients).map((ing) => ({
    name: ing.n,
    quantity: ing.q,
    category: ing.cat,
  }));

  return createDedupedItems(organizationId, candidates);
}

export async function addMealPlanIngredientsToShoppingList(
  organizationId: string,
  startDate: Date,
  endDate: Date,
) {
  const entries = await prisma.mealPlanEntry.findMany({
    where: { organizationId, date: { gte: startDate, lte: endDate } },
    include: { recipe: true },
  });

  const candidatesByName = new Map<string, ShoppingItemInput>();
  for (const entry of entries) {
    for (const ing of parseIngredients(entry.recipe.ingredients)) {
      const key = ing.n.toLowerCase();
      if (!candidatesByName.has(key)) {
        candidatesByName.set(key, { name: ing.n, quantity: ing.q, category: ing.cat });
      }
    }
  }

  return createDedupedItems(organizationId, Array.from(candidatesByName.values()));
}
