"use client";

import { ChefHat, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";

import { LanguageSwitcher } from "@/components/language-switcher";
import {
  DownloadButtons,
  GOOGLE_PLAY_URL,
  type DownloadButtonsLabels,
} from "./download-buttons";
import { HashLink } from "./hash-link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFloatingNav } from "@/hooks/use-floating-nav";
import { useHeroNavMask } from "@/hooks/use-hero-nav-mask";

export type SiteHeaderLabels = {
  features: string;
  howItWorks: string;
  pricing: string;
  menu: string;
};

const NAV_ITEMS = [
  { href: "/#features", key: "features" },
  { href: "/#how-it-works", key: "howItWorks" },
  { href: "/#pricing", key: "pricing" },
] as const;

type SiteHeaderProps = {
  labels: SiteHeaderLabels;
  downloadLabels: DownloadButtonsLabels;
};

function NavigationRow({
  labels,
  downloadLabels,
  floating,
  focusedKey,
}: SiteHeaderProps & {
  floating: boolean;
  focusedKey?: string | null;
}) {
  const menuTrigger = useRef<HTMLButtonElement>(null);

  return (
    <nav
      aria-label="Main"
      data-floating={floating ? "true" : undefined}
      data-focused={focusedKey}
      className="marketing-nav pointer-events-auto flex items-center"
    >
      <div className="flex min-w-0 flex-1 items-center justify-start">
        <Link href="/" data-nav-key="logo" className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-[10px]">
            <ChefHat className="size-4.5" />
          </div>
          <span className="font-display text-lg">CookBlueprint</span>
        </Link>
      </div>

      <div className="hidden items-center gap-7 lg:flex">
        {NAV_ITEMS.map((item) => (
          <HashLink
            key={item.key}
            data-nav-key={item.key}
            href={item.href}
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            {labels[item.key]}
          </HashLink>
        ))}
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-end gap-1">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              ref={menuTrigger}
              data-nav-key="menu"
              variant="ghost"
              size="icon-sm"
              className="size-11 lg:hidden"
              aria-label={labels.menu}
            >
              <Menu className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="min-w-44"
            onCloseAutoFocus={(event) => {
              // Restoring focus must not cancel an in-progress anchor scroll.
              event.preventDefault();
              menuTrigger.current?.focus({ preventScroll: true });
            }}
          >
            {NAV_ITEMS.map((item) => (
              <DropdownMenuItem key={item.key} asChild>
                <HashLink href={item.href}>{labels[item.key]}</HashLink>
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem asChild>
              <a
                href={GOOGLE_PLAY_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                {downloadLabels.googlePlay}
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              {downloadLabels.appStore} ({downloadLabels.comingSoon})
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div data-nav-key="language" className="flex">
          <LanguageSwitcher compact />
        </div>

        <div data-nav-key="download" className="hidden lg:flex">
          <DownloadButtons
            labels={downloadLabels}
            compact
            className="hidden lg:flex"
          />
        </div>
      </div>
    </nav>
  );
}

export function SiteHeader(props: SiteHeaderProps) {
  const overHero = usePathname() === "/";
  const floating = useFloatingNav();
  const maskRef = useHeroNavMask(overHero);
  const [focusedKey, setFocusedKey] = useState<string | null>(null);

  return (
    <header
      className={`marketing-header pointer-events-none sticky top-0 z-50 ${overHero ? "marketing-header--overlay" : ""}`}
    >
      <div
        ref={maskRef}
        className={`nav-mask-shell ${overHero ? "nav-mask-shell--active" : ""}`}
      >
        <div
          className="nav-layer nav-layer--page"
          onFocusCapture={(event) => {
            const target = event.target as HTMLElement;
            setFocusedKey(
              target.matches(":focus-visible")
                ? (target.closest<HTMLElement>("[data-nav-key]")?.dataset
                    .navKey ?? null)
                : null,
            );
          }}
          onBlurCapture={() => setFocusedKey(null)}
        >
          <NavigationRow {...props} floating={floating} />
        </div>
        {overHero ? (
          <div className="nav-layer nav-layer--hero" aria-hidden="true" inert>
            <NavigationRow
              {...props}
              floating={floating}
              focusedKey={focusedKey}
            />
          </div>
        ) : null}
      </div>
    </header>
  );
}
