import React from "react";
import Link from "next/link";
import { ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getServerTranslator } from "@/lib/i18n/server";

export async function Header() {
  const t = await getServerTranslator();
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ChefHat className="size-4.5" />
          </div>
          <span className="font-display text-xl italic">Mise</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/#features"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("header.features")}
          </Link>
          <Link
            href="/#how-it-works"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("header.howItWorks")}
          </Link>
          <Link
            href="/#pricing"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("header.pricing")}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">{t("header.logIn")}</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/register">{t("header.getStarted")}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
