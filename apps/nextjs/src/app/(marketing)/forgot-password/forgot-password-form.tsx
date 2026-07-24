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

const formSchema = z.object({
  email: z.email(),
});

export function ForgotPasswordForm() {
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
            Check your email
          </h1>
          <p className="text-muted-foreground">
            If that email is registered, we&apos;ve sent a link to reset your
            password.
          </p>
          <Link href="/login" className="inline-block underline">
            Back to login
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
            Reset your password
          </h1>
          <p className="text-muted-foreground">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="test@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full bg-black text-white hover:bg-black/90"
            >
              Send reset link
            </Button>
          </form>
        </Form>

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
