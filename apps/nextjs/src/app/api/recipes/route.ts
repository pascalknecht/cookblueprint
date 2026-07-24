import { parseJsonBody, unauthorizedResponse } from "@/lib/api";
import { getActiveOrganizationContext } from "@/lib/get-active-organization";
import { paginationQuerySchema } from "@/lib/pagination";
import { createRecipe, listRecipes } from "@/use-cases/recipes";
import { z } from "zod";

const recipeIngredientSchema = z.object({
  n: z.string().min(1),
  q: z.string(),
  cat: z.string().min(1),
});

const recipeBodySchema = z.object({
  title: z.string().min(1),
  color: z.string().min(1),
  time: z.coerce.number().int().min(0),
  servings: z.coerce.number().int().min(1),
  kcal: z.string().min(1),
  tags: z.array(z.string()).default([]),
  ingredients: z.array(recipeIngredientSchema).default([]),
  steps: z.array(z.string()).default([]),
});

export async function GET(request: Request) {
  const ctx = await getActiveOrganizationContext();
  if (!ctx) return unauthorizedResponse();

  const url = new URL(request.url);
  const pagination = paginationQuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!pagination.success) {
    return Response.json(
      { error: "Invalid query parameters.", details: pagination.error.flatten() },
      { status: 400 },
    );
  }

  const tag = url.searchParams.get("tag") ?? undefined;
  const result = await listRecipes(ctx.organizationId, pagination.data, { tag });
  return Response.json(result);
}

export async function POST(request: Request) {
  const ctx = await getActiveOrganizationContext();
  if (!ctx) return unauthorizedResponse();

  const parsed = await parseJsonBody(request, recipeBodySchema);
  if ("error" in parsed) return parsed.error;

  const recipe = await createRecipe(ctx.organizationId, parsed.data);
  return Response.json(recipe, { status: 201 });
}
