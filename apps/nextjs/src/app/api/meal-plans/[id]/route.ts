import { notFoundResponse, unauthorizedResponse } from "@/lib/api";
import { getActiveOrganizationContext } from "@/lib/get-active-organization";
import { deleteMealPlanEntry } from "@/use-cases/meal-plans";

type RouteParams = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: RouteParams) {
  const ctx = await getActiveOrganizationContext();
  if (!ctx) return unauthorizedResponse();

  const { id } = await params;
  const deleted = await deleteMealPlanEntry(ctx.organizationId, id);
  if (!deleted) return notFoundResponse("Meal plan entry");

  return Response.json({ id });
}
