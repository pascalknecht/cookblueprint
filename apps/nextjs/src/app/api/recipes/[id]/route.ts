import { notFoundResponse, parseJsonBody, unauthorizedResponse } from "@/lib/api";
import { getActiveOrganizationContext } from "@/lib/get-active-organization";
import { ALL_RECIPE_FREQUENCIES, DEFAULT_RECIPE_FREQUENCY } from "@/lib/recipe-frequency";
import { deleteRecipe, getRecipe, updateRecipe } from "@/use-cases/recipes";
import { z } from "zod";

const recipeIngredientSchema = z.object({
  n: z.string().min(1),
  q: z.string(),
  cat: z.string().min(1),
});

const recipeBodySchema = z.object({
  title: z.string().min(1),
  color: z.string().min(1),
  imageUrl: z.url().nullable().optional(),
  frequency: z.enum(ALL_RECIPE_FREQUENCIES).default(DEFAULT_RECIPE_FREQUENCY),
  time: z.coerce.number().int().min(0),
  servings: z.coerce.number().int().min(1),
  kcal: z.string().min(1),
  tags: z.array(z.string()).default([]),
  ingredients: z.array(recipeIngredientSchema).default([]),
  steps: z.array(z.string()).default([]),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const ctx = await getActiveOrganizationContext();
  if (!ctx) return unauthorizedResponse();

  const { id } = await params;
  const recipe = await getRecipe(ctx.organizationId, id);
  if (!recipe) return notFoundResponse("Recipe");

  return Response.json(recipe);
}

export async function PUT(request: Request, { params }: RouteParams) {
  const ctx = await getActiveOrganizationContext();
  if (!ctx) return unauthorizedResponse();

  const parsed = await parseJsonBody(request, recipeBodySchema);
  if ("error" in parsed) return parsed.error;

  const { id } = await params;
  const recipe = await updateRecipe(ctx.organizationId, id, parsed.data);
  if (!recipe) return notFoundResponse("Recipe");

  return Response.json(recipe);
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const ctx = await getActiveOrganizationContext();
  if (!ctx) return unauthorizedResponse();

  const { id } = await params;
  const deleted = await deleteRecipe(ctx.organizationId, id);
  if (!deleted) return notFoundResponse("Recipe");

  return Response.json({ id });
}
