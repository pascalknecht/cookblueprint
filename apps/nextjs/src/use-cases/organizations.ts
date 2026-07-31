import { randomUUID } from "crypto";

import { normalizeEnabledMealTypes } from "@/lib/meal-types";
import { prisma } from "@/lib/prisma";

function slugify(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "kitchen"
  );
}

/** Bootstraps a default single-owner organization for a newly created user. */
export async function createDefaultOrganizationForUser(user: { id: string; name: string }) {
  const firstName = user.name.split(" ")[0] || user.name;
  const slug = `${slugify(user.name)}-${Date.now().toString(36)}`;

  const organization = await prisma.organization.create({
    data: {
      id: randomUUID(),
      name: `${firstName}'s Kitchen`,
      slug,
      createdAt: new Date(),
    },
  });

  await prisma.member.create({
    data: {
      id: randomUUID(),
      organizationId: organization.id,
      userId: user.id,
      role: "owner",
      createdAt: new Date(),
    },
  });

  return organization;
}

/** The organization a new session should default to, if the user belongs to one. */
export async function resolveDefaultActiveOrganizationId(userId: string) {
  const membership = await prisma.member.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: { organizationId: true },
  });
  return membership?.organizationId ?? null;
}

export async function getOrganizationSettings(organizationId: string) {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { enabledMealTypes: true },
  });
  return organization;
}

export function updateEnabledMealTypes(organizationId: string, enabledMealTypes: string[]) {
  return prisma.organization.update({
    where: { id: organizationId },
    data: { enabledMealTypes: normalizeEnabledMealTypes(enabledMealTypes) },
    select: { enabledMealTypes: true },
  });
}
