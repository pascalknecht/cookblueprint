"use client";

import { ArrowRight, ChefHat, Menu } from "lucide-react";
import Link from "next/link";

import { LanguageSwitcher } from "@/components/language-switcher";
import { HashLink } from "./hash-link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFloatingNav } from "@/hooks/use-floating-nav";

export type SiteHeaderLabels = {
  features: string;
  howItWorks: string;
  pricing: string;
  logIn: string;
  getStarted: string;
  menu: string;
};

const NAV_ITEMS = [
  { href: "/#features", key: "features" },
  { href: "/#how-it-works", key: "howItWorks" },
  { href: "/#pricing", key: "pricing" },
] as const;

export function SiteHeader({ labels }: { labels: SiteHeaderLabels }) {
  const floating = useFloatingNav();

  return (
    <header className="pointer-events-none sticky top-0 z-50">
      <div className="flex h-[4.5rem] justify-center">
        <nav
          aria-label="Main"
          data-floating={floating ? "true" : undefined}
          className="marketing-nav pointer-events-auto flex items-center"
        >
          <div className="flex min-w-0 flex-1 items-center justify-start">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-[10px] bg-primary text-primary-foreground">
                <ChefHat className="size-4.5" />
              </div>
              <span className="font-display text-lg">CookBlueprint</span>
            </Link>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            {NAV_ITEMS.map((item) => (
              <HashLink
                key={item.key}
                href={item.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {labels[item.key]}
              </HashLink>
            ))}
          </div>

          <div className="flex min-w-0 flex-1 items-center justify-end gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="md:hidden"
                  aria-label={labels.menu}
                >
                  <Menu className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-44">
                {NAV_ITEMS.map((item) => (
                  <DropdownMenuItem key={item.key} asChild>
                    <HashLink href={item.href}>{labels[item.key]}</HashLink>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem asChild>
                  <Link href="/login">{labels.logIn}</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <LanguageSwitcher compact />

            <Button variant="ghost" size="sm" className="hidden md:inline-flex" asChild>
              <Link href="/login">{labels.logIn}</Link>
            </Button>
            <Button
              size="sm"
              className="rounded-full bg-near text-near-foreground hover:bg-near/90"
              asChild
            >
              <Link href="/register">
                {labels.getStarted}
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
