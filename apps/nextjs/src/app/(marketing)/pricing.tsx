import React from "react";
import { Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getServerTranslator } from "@/lib/i18n/server";

export async function PricingSection() {
  const t = await getServerTranslator();

  const plans = [
    {
      name: t("pricing.freeName"),
      description: t("pricing.freeDescription"),
      price: "$0",
      period: t("pricing.perMonth"),
      cta: t("pricing.freeCta"),
      ctaVariant: "outline" as const,
      highlighted: false,
      features: [
        t("pricing.freeFeature1"),
        t("pricing.freeFeature2"),
        t("pricing.freeFeature3"),
        t("pricing.freeFeature4"),
      ],
    },
    {
      name: t("pricing.proName"),
      description: t("pricing.proDescription"),
      price: "$4",
      period: t("pricing.perMonth"),
      cta: t("pricing.proCta"),
      ctaVariant: "default" as const,
      highlighted: true,
      badge: t("pricing.proBadge"),
      features: [
        t("pricing.proFeature1"),
        t("pricing.proFeature2"),
        t("pricing.proFeature3"),
        t("pricing.proFeature4"),
      ],
    },
  ];

  return (
    <section className="border-t border-border py-20 md:py-28" id="pricing">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {t("pricing.eyebrow")}
          </p>
          <h2 className="font-display text-3xl md:text-5xl">
            {t("pricing.title")}
          </h2>
          <p className="mt-5 text-base text-muted-foreground md:text-lg">
            {t("pricing.subtitle")}
          </p>
        </div>

        <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={plan.highlighted ? "border-primary/40 shadow-md" : ""}
            >
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  {plan.badge ? (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-primary-foreground">
                      {plan.badge}
                    </span>
                  ) : null}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <span className="text-4xl font-semibold tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {plan.period}
                  </span>
                </div>
                <ul className="space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="text-primary mt-0.5 size-4 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant={plan.ctaVariant} size="lg" className="w-full" asChild>
                  <Link href="/register">{plan.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
