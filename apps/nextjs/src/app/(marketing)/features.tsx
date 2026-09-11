import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Link2,
  ShoppingCart,
  Soup,
  Salad,
  Wheat,
} from "lucide-react";
import React from "react";
import { getServerTranslator } from "@/lib/i18n/server";

async function RecipesVisual() {
  const t = await getServerTranslator();
  const recipes = [
    {
      name: t("features.recipesVisualLentilSoup"),
      tag: t("features.tagDinner"),
      icon: Soup,
    },
    {
      name: t("features.recipesVisualTacos"),
      tag: t("features.tagLunch"),
      icon: Salad,
    },
    {
      name: t("features.recipesVisualOats"),
      tag: t("features.tagBreakfast"),
      icon: Wheat,
    },
  ];

  return (
    <div className="border-border bg-card mx-auto w-full max-w-sm rounded-[18px] border p-4">
      <div className="border-border mb-1 flex items-center gap-2 border-b pb-4">
        <div className="bg-gold/15 flex size-9 shrink-0 items-center justify-center rounded-xl">
          <Link2 className="text-gold size-4" />
        </div>
        <div>
          <p className="text-sm font-medium">
            {t("features.recipesVisualImportTitle")}
          </p>
          <p className="text-muted-foreground text-xs">
            {t("features.recipesVisualImportSubtitle")}
          </p>
        </div>
      </div>
      {recipes.map((recipe) => (
        <div
          key={recipe.name}
          className="border-border/60 flex flex-wrap items-center justify-between gap-2 border-b py-3 last:border-0 last:pb-0"
        >
          <div className="flex items-center gap-3">
            <div className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
              <recipe.icon className="size-4" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium">{recipe.name}</p>
          </div>
          <span className="text-muted-foreground bg-muted rounded-full px-2 py-1 text-[10px] font-medium tracking-wide uppercase">
            {recipe.tag}
          </span>
        </div>
      ))}
    </div>
  );
}

async function MealPlanVisual() {
  const t = await getServerTranslator();
  const week = [
    { day: t("features.dayMonday"), meal: t("features.mealLentilSoup") },
    { day: t("features.dayTuesday"), meal: t("features.mealStirFry") },
    { day: t("features.dayWednesday"), meal: t("features.mealTacos") },
    { day: t("features.dayThursday"), meal: t("features.mealSalmon") },
    { day: t("features.dayFriday"), meal: t("features.mealPizza") },
  ];

  return (
    <div className="border-border bg-card mx-auto w-full max-w-sm rounded-2xl border p-2 shadow-sm">
      {week.map(({ day, meal }, i) => (
        <div
          key={day}
          className={`flex items-center justify-between px-3 py-2.5 ${i !== week.length - 1 ? "border-border/60 border-b" : ""}`}
        >
          <span className="text-muted-foreground text-sm">{day}</span>
          <span className="text-sm font-medium">{meal}</span>
        </div>
      ))}
    </div>
  );
}

async function ShoppingListVisual() {
  const t = await getServerTranslator();
  const items = [
    { item: t("features.itemSalmon"), done: true },
    { item: t("features.itemTomatoes"), done: true },
    { item: t("features.itemTortillas"), done: false },
    { item: t("features.itemRice"), done: false },
  ];

  return (
    <div className="border-border bg-card mx-auto w-full max-w-sm rounded-2xl border p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold">{t("features.listVisualTitle")}</p>
        <span className="text-muted-foreground text-xs">
          {t("features.listVisualCount", { count: items.length })}
        </span>
      </div>
      <div className="space-y-2.5">
        {items.map(({ item, done }) => (
          <div key={item} className="flex items-center gap-2.5">
            <div
              className={`flex size-4 shrink-0 items-center justify-center rounded-full border ${done ? "bg-success border-success" : "border-border"}`}
            >
              {done ? (
                <svg
                  viewBox="0 0 24 24"
                  className="size-2.5 fill-none stroke-white stroke-[3]"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              ) : null}
            </div>
            <span
              className={`text-sm ${done ? "text-muted-foreground line-through" : ""}`}
            >
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const colorClasses = {
  gold: { chip: "bg-gold/15 text-gold", bullet: "text-gold" },
  primary: { chip: "bg-primary/10 text-primary", bullet: "text-primary" },
  success: { chip: "bg-success/15 text-success", bullet: "text-success" },
} as const;

export async function FeaturesSection() {
  const t = await getServerTranslator();

  const capabilities = [
    {
      eyebrow: t("features.recipesEyebrow"),
      icon: BookOpen,
      color: "gold",
      title: t("features.recipesTitle"),
      description: t("features.recipesDescription"),
      bullets: [
        t("features.recipesBullet1"),
        t("features.recipesBullet2"),
        t("features.recipesBullet3"),
      ],
      visual: RecipesVisual,
    },
    {
      eyebrow: t("features.planEyebrow"),
      icon: CalendarDays,
      color: "primary",
      title: t("features.planTitle"),
      description: t("features.planDescription"),
      bullets: [
        t("features.planBullet1"),
        t("features.planBullet2"),
        t("features.planBullet3"),
      ],
      visual: MealPlanVisual,
    },
    {
      eyebrow: t("features.listEyebrow"),
      icon: ShoppingCart,
      color: "success",
      title: t("features.listTitle"),
      description: t("features.listDescription"),
      bullets: [
        t("features.listBullet1"),
        t("features.listBullet2"),
        t("features.listBullet3"),
      ],
      visual: ShoppingListVisual,
    },
  ] as const;

  return (
    <section className="features-section py-16 md:py-24" id="features">
      <div className="container mx-auto px-4">
        <div className="feature-intro mb-16">
          <p className="text-muted-foreground mb-3 text-xs font-medium tracking-[0.18em] uppercase">
            {t("features.eyebrow")}
          </p>
          <h2 className="font-display text-3xl md:text-5xl">
            {t("features.title")}
          </h2>
          <p className="text-muted-foreground mt-5 text-base md:text-lg">
            {t("features.subtitle")}
          </p>
        </div>

        <div className="mx-auto max-w-5xl space-y-16 md:space-y-20">
          {capabilities.map((capability, index) => {
            const colors = colorClasses[capability.color];
            return (
              <div
                key={capability.eyebrow}
                className="grid items-center gap-10 md:grid-cols-2 md:gap-16"
              >
                <div className={index % 2 === 1 ? "md:order-2" : ""}>
                  <div className="mb-3 flex items-center gap-2">
                    <div
                      className={`flex size-8 items-center justify-center rounded-lg ${colors.chip}`}
                    >
                      <capability.icon className="size-4" />
                    </div>
                    <p className="text-muted-foreground text-xs font-semibold tracking-[0.18em] uppercase">
                      {capability.eyebrow}
                    </p>
                  </div>
                  <h3 className="text-2xl font-semibold tracking-tight md:text-3xl">
                    {capability.title}
                  </h3>
                  <p className="text-muted-foreground mt-4 text-base leading-relaxed">
                    {capability.description}
                  </p>
                  <ul className="mt-6 space-y-2.5">
                    {capability.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex items-start gap-2 text-sm"
                      >
                        <ArrowRight
                          className={`mt-0.5 size-4 shrink-0 ${colors.bullet}`}
                        />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div
                  className={`feature-visual feature-visual-${capability.color} ${index % 2 === 1 ? "md:order-1" : ""}`}
                >
                  <capability.visual />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
