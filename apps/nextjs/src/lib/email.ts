import "server-only";

import { Resend } from "resend";

import { env } from "@/env";

const resend = new Resend(env.RESEND_API_KEY);
const from = env.EMAIL_FROM ?? "CookBlueprint <onboarding@resend.dev>";

export async function sendVerificationEmail(to: string, url: string) {
  await resend.emails.send({
    from,
    to,
    subject: "Verify your email for CookBlueprint",
    html: `
      <p>Welcome to CookBlueprint! Confirm your email address to finish creating your account.</p>
      <p><a href="${url}">Verify email</a></p>
      <p>If you didn't create an account, you can ignore this email.</p>
    `,
  });
}

export async function sendResetPasswordEmail(to: string, url: string) {
  await resend.emails.send({
    from,
    to,
    subject: "Reset your CookBlueprint password",
    html: `
      <p>We received a request to reset your CookBlueprint password.</p>
      <p><a href="${url}">Reset password</a></p>
      <p>If you didn't request this, you can ignore this email — your password won't change.</p>
    `,
  });
}
