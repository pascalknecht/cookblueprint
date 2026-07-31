import { Link2, ShoppingCart, Sparkles } from "lucide-react";
import React from "react";
import { getServerTranslator } from "@/lib/i18n/server";

export async function HowItWorksSection() {
  const t = await getServerTranslator();

  const steps = [
    { step: "1", title: t("howItWorks.step1Title"), description: t("howItWorks.step1Description"), icon: Link2, chip: "bg-gold/15 text-gold" },
    { step: "2", title: t("howItWorks.step2Title"), description: t("howItWorks.step2Description"), icon: Sparkles, chip: "bg-primary/10 text-primary" },
    { step: "3", title: t("howItWorks.step3Title"), description: t("howItWorks.step3Description"), icon: ShoppingCart, chip: "bg-success/15 text-success" },
  ];

  return (
    <section className="border-t border-border py-20 md:py-28" id="how-it-works">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {t("howItWorks.eyebrow")}
          </p>
          <h2 className="font-display text-3xl md:text-5xl">
            {t("howItWorks.title")}
          </h2>
          <p className="mt-5 text-base text-muted-foreground md:text-lg">
            {t("howItWorks.subtitle")}
          </p>
        </div>

        <div className="relative mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.step} className="text-center">
              <div className={`mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl ${step.chip}`}>
                <step.icon className="size-6" />
              </div>
              <p className="text-muted-foreground mb-1 text-xs font-medium uppercase tracking-[0.14em]">
                {t("howItWorks.stepLabel", { step: step.step })}
              </p>
              <h3 className="mb-2 text-lg font-semibold tracking-tight">
                {step.title}
              </h3>
              <p className="text-muted-foreground mx-auto max-w-xs text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
