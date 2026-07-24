import React from "react";
import Link from "next/link";

type VerifyEmailPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : undefined;

  if (error) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4 rounded-xl bg-white p-8 text-center shadow-lg">
          <h1 className="text-2xl font-semibold tracking-tight">
            Link expired
          </h1>
          <p className="text-muted-foreground">
            This verification link is invalid or has expired. Try logging in
            again to get a new one sent to your email.
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
      <div className="w-full max-w-md space-y-4 rounded-xl bg-white p-8 text-center shadow-lg">
        <h1 className="text-2xl font-semibold tracking-tight">
          Email verified
        </h1>
        <p className="text-muted-foreground">
          Your email is confirmed. You can log in now.
        </p>
        <Link href="/login" className="inline-block underline">
          Log in
        </Link>
      </div>
    </div>
  );
}
