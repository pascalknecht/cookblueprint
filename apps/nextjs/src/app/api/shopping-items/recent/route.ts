import { unauthorizedResponse } from "@/lib/api";
import { getActiveOrganizationContext } from "@/lib/get-active-organization";
import { listRecentShoppingItems } from "@/use-cases/shopping-items";

export async function GET() {
  const ctx = await getActiveOrganizationContext();
  if (!ctx) return unauthorizedResponse();

  const items = await listRecentShoppingItems(ctx.organizationId);
  return Response.json({ items });
}
