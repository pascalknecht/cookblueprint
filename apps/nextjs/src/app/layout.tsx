import React from "react";
import "@/app/globals.css";
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { I18nProvider } from "@/lib/i18n/client";
import { getLocale, getServerTranslator } from "@/lib/i18n/server";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export async function generateMetadata(): Promise<Metadata> {
  const [t, locale] = await Promise.all([getServerTranslator(), getLocale()]);
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    openGraph: {
      title: t("meta.title"),
      description: t("meta.description"),
      locale,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning className={cn("font-sans", inter.variable)}>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable,
        )}
      >
        <I18nProvider initialLocale={locale}>
          <TooltipProvider>
            <Toaster />
            <div className="flex flex-col w-full">
              <div>{children}</div>
            </div>
          </TooltipProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
