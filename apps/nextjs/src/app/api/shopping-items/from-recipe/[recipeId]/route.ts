import { notFoundResponse, unauthorizedResponse } from "@/lib/api";
import { getActiveOrganizationContext } from "@/lib/get-active-organization";
import { addRecipeIngredientsToShoppingList } from "@/use-cases/shopping-items";

type RouteParams = { params: Promise<{ recipeId: string }> };

export async function POST(_request: Request, { params }: RouteParams) {
  const ctx = await getActiveOrganizationContext();
  if (!ctx) return unauthorizedResponse();

  const { recipeId } = await params;
  const added = await addRecipeIngredientsToShoppingList(ctx.organizationId, recipeId);
  if (added === null) return notFoundResponse("Recipe");

  return Response.json({ items: added }, { status: 201 });
}
