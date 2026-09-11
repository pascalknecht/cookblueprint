import React from "react";
import Link from "next/link";
import { ChefHat } from "lucide-react";
import { getServerTranslator } from "@/lib/i18n/server";
import { GOOGLE_PLAY_URL } from "./download-buttons";
import { HashLink } from "./hash-link";

const linkClassName = "text-sm text-muted-foreground transition-colors hover:text-foreground";

function FooterLinkGroup({
  category,
  links,
}: {
  category: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold">{category}</h3>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.label}>
            {link.href.includes("#") ? (
              <HashLink href={link.href} className={linkClassName}>
                {link.label}
              </HashLink>
            ) : (
              <a href={link.href} className={linkClassName}>
                {link.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function Footer() {
  const t = await getServerTranslator();

  const productGroup = {
    category: t("footer.categoryProduct"),
    links: [
      { label: t("footer.linkFeatures"), href: "/#features" },
      { label: t("footer.linkHowItWorks"), href: "/#how-it-works" },
      { label: t("footer.linkPricing"), href: "/#pricing" },
    ],
  };

  const legalGroup = {
    category: t("footer.categoryLegal"),
    links: [
      { label: t("footer.linkPrivacyPolicy"), href: "/privacy" },
      { label: t("footer.linkTermsOfService"), href: "/terms-of-service" },
    ],
  };

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="mb-4 flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <ChefHat className="size-4" />
              </div>
              <span className="font-display text-lg">CookBlueprint</span>
            </Link>
            <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
              {t("footer.tagline")}
            </p>
          </div>

          <FooterLinkGroup {...productGroup} />

          <div>
            <h3 className="mb-4 text-sm font-semibold">{t("footer.categoryGetApp")}</h3>
            <ul className="space-y-2.5">
              <li>
                <a
                  href={GOOGLE_PLAY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClassName}
                >
                  {t("download.googlePlay")}
                </a>
              </li>
              <li>
                <span aria-disabled="true" className="text-sm text-muted-foreground/50">
                  {t("download.appStore")} ({t("download.comingSoon")})
                </span>
              </li>
            </ul>
          </div>

          <FooterLinkGroup {...legalGroup} />
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className={linkClassName}>
              {t("footer.privacy")}
            </Link>
            <Link href="/terms-of-service" className={linkClassName}>
              {t("footer.terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
