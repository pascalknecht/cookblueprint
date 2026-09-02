import { parseJsonBody, unauthorizedResponse } from "@/lib/api";
import { getActiveOrganizationContext } from "@/lib/get-active-organization";
import { generateMealPlan } from "@/use-cases/meal-plans";
import { COOKING_STYLES } from "@repo/shared";
import { z } from "zod";

export const maxDuration = 30;

const generateBodySchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  avoidRepeats: z.boolean().optional(),
  cookingStyle: z.enum(COOKING_STYLES).optional(),
  leftovers: z.boolean().optional(),
  keepPlanned: z.boolean().optional(),
});

export async function POST(request: Request) {
  const ctx = await getActiveOrganizationContext();
  if (!ctx) return unauthorizedResponse();

  const parsed = await parseJsonBody(request, generateBodySchema);
  if ("error" in parsed) return parsed.error;

  if (parsed.data.endDate < parsed.data.startDate) {
    return Response.json({ error: "endDate must not be before startDate." }, { status: 400 });
  }

  const entries = await generateMealPlan(ctx.organizationId, ctx.userId, parsed.data);
  return Response.json({ items: entries });
}
