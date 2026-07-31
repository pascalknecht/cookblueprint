"use client";

import React, { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { client } from "@/lib/auth-client";
import { env } from "@/env";
import { useTranslation } from "react-i18next";

const formSchema = z.object({
  email: z.email(),
});

export function ForgotPasswordForm() {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await client.requestPasswordReset({
      email: values.email,
      redirectTo: `${env.NEXT_PUBLIC_APP_URL}/reset-password`,
    });
    // Always show the same success state, whether or not the email exists —
    // matches better-auth's own non-enumerating response.
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4 rounded-xl bg-white p-8 text-center shadow-lg">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("forgotPassword.checkEmailTitle")}
          </h1>
          <p className="text-muted-foreground">
            {t("forgotPassword.checkEmailBody")}
          </p>
          <Link href="/login" className="inline-block underline">
            {t("forgotPassword.backToLogin")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("forgotPassword.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("forgotPassword.subtitle")}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>{t("forgotPassword.emailLabel")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("forgotPassword.emailPlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full bg-black text-white hover:bg-black/90"
            >
              {t("forgotPassword.submit")}
            </Button>
          </form>
        </Form>

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="underline">
            {t("forgotPassword.backToLogin")}
          </Link>
        </p>
      </div>
    </div>
  );
}
