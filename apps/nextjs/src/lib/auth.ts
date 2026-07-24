import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "./generated/prisma/client/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { organization } from "better-auth/plugins";
import { env } from "@/env";
import { sendResetPasswordEmail, sendVerificationEmail } from "./email";
import { mobileWebDevOrigins } from "./mobile-dev-origins";
import {
  createDefaultOrganizationForUser,
  resolveDefaultActiveOrganizationId,
} from "@/use-cases/organizations";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  // The mise:// entry trusts the Expo app's custom scheme for real native
  // builds.
  trustedOrigins: ["mise://", ...mobileWebDevOrigins],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: ({ user, url }) => sendResetPasswordEmail(user.email, url),
  },
  emailVerification: {
    sendVerificationEmail: ({ user, url }) => sendVerificationEmail(user.email, url),
    // Re-sends a fresh link automatically whenever an unverified user tries to log in.
    sendOnSignIn: true,
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  databaseHooks: {
    user: {
      create: {
        // Runs at signup regardless of verification status, so a fresh
        // organization always exists by the time the user can log in.
        after: async (user) => {
          await createDefaultOrganizationForUser(user);
        },
      },
    },
    session: {
      create: {
        // Defaults every new session to the user's organization, replacing
        // the client-side `organization.setActive()` call that no longer
        // has a session to act on immediately after signup.
        before: async (session) => {
          const organizationId = await resolveDefaultActiveOrganizationId(session.userId);
          return organizationId ? { data: { activeOrganizationId: organizationId } } : undefined;
        },
      },
    },
  },
  plugins: [organization(), expo()],
});
