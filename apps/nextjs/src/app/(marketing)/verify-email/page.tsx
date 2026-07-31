import React from "react";
import Link from "next/link";
import { getServerTranslator } from "@/lib/i18n/server";

type VerifyEmailPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : undefined;
  const t = await getServerTranslator();

  if (error) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4 rounded-xl bg-white p-8 text-center shadow-lg">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("verifyEmail.linkExpiredTitle")}
          </h1>
          <p className="text-muted-foreground">
            {t("verifyEmail.linkExpiredBody")}
          </p>
          <Link href="/login" className="inline-block underline">
            {t("verifyEmail.backToLogin")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4 rounded-xl bg-white p-8 text-center shadow-lg">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("verifyEmail.verifiedTitle")}
        </h1>
        <p className="text-muted-foreground">
          {t("verifyEmail.verifiedBody")}
        </p>
        <Link href="/login" className="inline-block underline">
          {t("verifyEmail.logIn")}
        </Link>
      </div>
    </div>
  );
}
