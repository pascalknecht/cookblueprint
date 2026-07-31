"use client";

import React from "react";
import { LoaderButton } from "@/components/loader-button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { deleteAccountAction } from "./actions";
import { signOut } from "@/lib/auth-client";
import { useTranslation } from "react-i18next";

export const deleteSchema = z.object({
  confirm: z.string().refine((v) => v === "Please delete", {
    error: "Please type 'Please delete' to confirm",
  }),
});

export function DeleteAccountButton() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const form = useForm<{ confirm: string }>({
    resolver: zodResolver(deleteSchema),
    defaultValues: {
      confirm: "",
    },
  });

  function onSubmit() {
    startTransition(() => {
      deleteAccountAction().then(() =>
        signOut({
          fetchOptions: {
            onSuccess: () => {
              window.location.href = "/";
            },
          },
        })
      );
    });
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button className="w-fit" variant="destructive">
          {t("deleteAccount.trigger")}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("deleteAccount.confirmTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("deleteAccount.confirmDescriptionPrefix")}
            <strong>{t("deleteAccount.confirmDescriptionEmphasis")}</strong>
            {t("deleteAccount.confirmDescriptionSuffix")}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="confirm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("deleteAccount.confirmLabel")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <AlertDialogFooter>
              <AlertDialogCancel>{t("deleteAccount.cancel")}</AlertDialogCancel>
              <LoaderButton isLoading={pending} variant="destructive">
                {t("deleteAccount.delete")}
              </LoaderButton>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
