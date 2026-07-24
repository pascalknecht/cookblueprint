import { parseJsonBody, unauthorizedResponse } from "@/lib/api";
import { getActiveOrganizationContext } from "@/lib/get-active-organization";
import { addMealPlanIngredientsToShoppingList } from "@/use-cases/shopping-items";
import { z } from "zod";

const bodySchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});

export async function POST(request: Request) {
  const ctx = await getActiveOrganizationContext();
  if (!ctx) return unauthorizedResponse();

  const parsed = await parseJsonBody(request, bodySchema);
  if ("error" in parsed) return parsed.error;

  if (parsed.data.endDate < parsed.data.startDate) {
    return Response.json({ error: "endDate must not be before startDate." }, { status: 400 });
  }

  const added = await addMealPlanIngredientsToShoppingList(
    ctx.organizationId,
    parsed.data.startDate,
    parsed.data.endDate,
  );
  return Response.json({ items: added }, { status: 201 });
}
