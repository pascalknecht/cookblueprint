import { parseJsonBody, unauthorizedResponse } from "@/lib/api";
import { getActiveOrganizationContext } from "@/lib/get-active-organization";
import { generateMealPlan } from "@/use-cases/meal-plans";
import { z } from "zod";

const generateBodySchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  vegetarianOnly: z.boolean().optional(),
  avoidRepeats: z.boolean().optional(),
});

export async function POST(request: Request) {
  const ctx = await getActiveOrganizationContext();
  if (!ctx) return unauthorizedResponse();

  const parsed = await parseJsonBody(request, generateBodySchema);
  if ("error" in parsed) return parsed.error;

  if (parsed.data.endDate < parsed.data.startDate) {
    return Response.json({ error: "endDate must not be before startDate." }, { status: 400 });
  }

  const entries = await generateMealPlan(ctx.organizationId, parsed.data);
  return Response.json({ items: entries });
}
