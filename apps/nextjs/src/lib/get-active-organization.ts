import { getSSRSession } from "./get-server-session";
import { prisma } from "./prisma";

export type ActiveOrganizationContext = {
  userId: string;
  organizationId: string;
};

/**
 * Resolves the current session's active organization and verifies the user
 * is still a member of it. Returns null if there's no session, no active
 * organization selected, or the membership no longer exists.
 */
export async function getActiveOrganizationContext(): Promise<ActiveOrganizationContext | null> {
  const { user, session } = await getSSRSession();
  if (!user || !session?.activeOrganizationId) return null;

  const membership = await prisma.member.findFirst({
    where: { userId: user.id, organizationId: session.activeOrganizationId },
    select: { id: true },
  });
  if (!membership) return null;

  return { userId: user.id, organizationId: session.activeOrganizationId };
}
