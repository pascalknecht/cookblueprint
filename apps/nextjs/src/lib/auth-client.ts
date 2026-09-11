import { createAuthClient } from "better-auth/react";
import { env } from "@/env";

export const client = createAuthClient({
  baseURL: env.NEXT_PUBLIC_APP_URL,
});
