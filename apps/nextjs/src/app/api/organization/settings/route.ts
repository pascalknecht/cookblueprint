import { parseJsonBody, unauthorizedResponse } from "@/lib/api";
import { getActiveOrganizationContext } from "@/lib/get-active-organization";
import { ALL_MEAL_TYPES } from "@/lib/meal-types";
import { getOrganizationSettings, updateEnabledMealTypes } from "@/use-cases/organizations";
import { z } from "zod";

const settingsBodySchema = z.object({
  enabledMealTypes: z.array(z.enum(ALL_MEAL_TYPES)).min(1),
});

export async function GET() {
  const ctx = await getActiveOrganizationContext();
  if (!ctx) return unauthorizedResponse();

  const settings = await getOrganizationSettings(ctx.organizationId);
  return Response.json(settings);
}

export async function PATCH(request: Request) {
  const ctx = await getActiveOrganizationContext();
  if (!ctx) return unauthorizedResponse();

  const parsed = await parseJsonBody(request, settingsBodySchema);
  if ("error" in parsed) return parsed.error;

  const settings = await updateEnabledMealTypes(ctx.organizationId, parsed.data.enabledMealTypes);
  return Response.json(settings);
}
