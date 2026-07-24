"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

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

const formSchema = z
  .object({
    newPassword: z.string().min(8, {
      error: "Password must be at least 8 characters.",
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    error: "Passwords don't match",
    path: ["confirmPassword"],
  });

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const error = searchParams.get("error");
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!token) return;
    setLoading(true);
    const { error: resetError } = await client.resetPassword({
      newPassword: values.newPassword,
      token,
    });
    setLoading(false);
    if (resetError) {
      toast.error(resetError.message ?? "Could not reset password");
      return;
    }
    toast.success("Password updated — log in with your new password");
    router.push("/login");
  }

  if (error || !token) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4 rounded-xl bg-white p-8 text-center shadow-lg">
          <h1 className="text-2xl font-semibold tracking-tight">
            Link expired
          </h1>
          <p className="text-muted-foreground">
            This password reset link is invalid or has expired. Request a new
            one below.
          </p>
          <Link href="/forgot-password" className="inline-block underline">
            Request a new link
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
            Set a new password
          </h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Confirm password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white hover:bg-black/90"
            >
              Reset password
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
