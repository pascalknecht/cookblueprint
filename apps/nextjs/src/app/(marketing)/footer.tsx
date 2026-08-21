import React from "react";
import Link from "next/link";
import { ChefHat } from "lucide-react";
import { getServerTranslator } from "@/lib/i18n/server";

export async function Footer() {
  const t = await getServerTranslator();

  const footerLinkGroups = [
    {
      category: t("footer.categoryProduct"),
      links: [
        { label: t("footer.linkFeatures"), href: "/#features" },
        { label: t("footer.linkHowItWorks"), href: "/#how-it-works" },
        { label: t("footer.linkPricing"), href: "/#pricing" },
      ],
    },
    {
      category: t("footer.categoryAccount"),
      links: [
        { label: t("footer.linkLogIn"), href: "/login" },
        { label: t("footer.linkGetStarted"), href: "/register" },
      ],
    },
    {
      category: t("footer.categoryLegal"),
      links: [
        { label: t("footer.linkPrivacyPolicy"), href: "/privacy" },
        { label: t("footer.linkTermsOfService"), href: "/terms-of-service" },
      ],
    },
  ];

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="mb-4 flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <ChefHat className="size-4" />
              </div>
              <span className="font-display text-lg italic">CookBlueprint</span>
            </Link>
            <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
              {t("footer.tagline")}
            </p>
          </div>

          {footerLinkGroups.map(({ category, links }) => (
            <div key={category}>
              <h3 className="mb-4 text-sm font-semibold">{category}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("footer.privacy")}
            </Link>
            <Link
              href="/terms-of-service"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("footer.terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
