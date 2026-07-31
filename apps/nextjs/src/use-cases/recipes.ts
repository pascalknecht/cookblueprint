import { prisma } from "@/lib/prisma";
import { toPaginationEnvelope, toSkipTake, type PaginationQuery } from "@/lib/pagination";
import type { RecipeFrequency } from "@/lib/recipe-frequency";
import { Prisma } from "@/lib/generated/prisma/client/client";

export type RecipeIngredientInput = {
  n: string;
  q: string;
  cat: string;
};

export type RecipeInput = {
  title: string;
  color: string;
  imageUrl?: string | null;
  frequency: RecipeFrequency;
  time: number;
  servings: number;
  kcal: string;
  tags: string[];
  ingredients: RecipeIngredientInput[];
  steps: string[];
};

const RECIPE_ORDER_FIELDS = new Set(["createdAt", "updatedAt", "title", "time", "servings"]);

export async function listRecipes(
  organizationId: string,
  pagination: PaginationQuery,
  filters: { tag?: string },
) {
  const where: Prisma.RecipeWhereInput = {
    organizationId,
    ...(pagination.queryFilter
      ? { title: { contains: pagination.queryFilter, mode: "insensitive" } }
      : {}),
    ...(filters.tag ? { tags: { has: filters.tag } } : {}),
  };

  const orderByField =
    pagination.orderBy && RECIPE_ORDER_FIELDS.has(pagination.orderBy) ? pagination.orderBy : "createdAt";

  const [items, total] = await Promise.all([
    prisma.recipe.findMany({
      where,
      orderBy: { [orderByField]: pagination.orderDirection },
      ...toSkipTake(pagination),
    }),
    prisma.recipe.count({ where }),
  ]);

  return toPaginationEnvelope(items, total, pagination);
}

export function getRecipe(organizationId: string, id: string) {
  return prisma.recipe.findFirst({ where: { id, organizationId } });
}

export function createRecipe(organizationId: string, data: RecipeInput) {
  return prisma.recipe.create({
    data: { ...data, organizationId },
  });
}

export async function updateRecipe(organizationId: string, id: string, data: RecipeInput) {
  const existing = await prisma.recipe.findFirst({ where: { id, organizationId }, select: { id: true } });
  if (!existing) return null;

  return prisma.recipe.update({ where: { id }, data });
}

export async function deleteRecipe(organizationId: string, id: string) {
  const existing = await prisma.recipe.findFirst({ where: { id, organizationId }, select: { id: true } });
  if (!existing) return false;

  await prisma.recipe.delete({ where: { id } });
  return true;
}
