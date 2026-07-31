import React from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getLocale, getServerTranslator } from "@/lib/i18n/server";
import { PhoneMockup } from "./phone-mockup";

export async function HeroSection() {
  const [t, locale] = await Promise.all([getServerTranslator(), getLocale()]);

  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute top-[-10%] right-[-10%] size-[32rem] rounded-full bg-primary/5 blur-3xl"
      />

      <div className="relative container mx-auto grid gap-16 px-4 md:grid-cols-2 md:items-center md:gap-8">
        <div className="mx-auto max-w-xl text-center md:mx-0 md:text-left">
          <h1 className="font-display text-foreground mb-6 text-4xl md:text-5xl lg:text-6xl">
            {t("hero.titleLine1")}
            <br />
            <span className="text-primary italic">{t("hero.titleEmphasis")}</span>
          </h1>

          <p className="text-muted-foreground mx-auto mb-10 max-w-md text-base md:mx-0 md:text-lg">
            {t("hero.subtitle")}
          </p>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row md:justify-start">
            <Button size="lg" asChild>
              <Link href="/register">
                {t("hero.ctaPrimary")}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="#features">{t("hero.ctaSecondary")}</Link>
            </Button>
          </div>

          <p className="text-muted-foreground mt-4 text-xs">
            {t("hero.disclaimer")}
          </p>
        </div>

        <div className="relative mx-auto w-[280px]">
          <PhoneMockup
            src={`/screenshots/${locale}/recipes.webp`}
            alt={t("hero.screenshotAlt")}
            width={280}
            priority
          />
        </div>
      </div>
    </section>
  );
}
