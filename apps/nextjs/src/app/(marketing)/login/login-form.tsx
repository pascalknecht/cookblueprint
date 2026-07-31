"use client";

import React from "react";
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
import { signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const formSchema = z.object({
  email: z.email(),
  password: z.string().min(1, { error: "Password is required" }),
});

export function LoginForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await signIn.email({
      email: values.email,
      password: values.password,
      callbackURL: "/billing",
      fetchOptions: {
        onSuccess: () => {
          router.push("/billing");
        },
        onError: (error) => {
          if (error.error.message === "Email not verified") {
            toast.error(t("login.verifyEmailToast"));
            return;
          }
          toast.error(error.error.message);
        },
      },
    });
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">{t("login.title")}</h1>
          <p className="text-muted-foreground">{t("login.subtitle")}</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>{t("login.emailLabel")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("login.emailPlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>{t("login.passwordLabel")}</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="text-right text-sm">
              <Link href="/forgot-password" className="underline">
                {t("login.forgotPassword")}
              </Link>
            </div>
            <Button
              type="submit"
              className="w-full bg-black text-white hover:bg-black/90"
            >
              {t("login.submit")}
            </Button>
          </form>
        </Form>

        <p className="text-center text-sm text-muted-foreground">
          {t("login.noAccount")}
          <Link href="/register" className="underline">
            {t("login.signUp")}
          </Link>
        </p>
      </div>
    </div>
  );
}
