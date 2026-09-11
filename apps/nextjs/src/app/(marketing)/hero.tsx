import { ArrowDown, Check } from "lucide-react";
import { getLocale, getServerTranslator } from "@/lib/i18n/server";
import { DownloadButtons } from "./download-buttons";
import { HashLink } from "./hash-link";
import { PhoneMockup } from "./phone-mockup";

export async function HeroSection() {
  const [t, locale] = await Promise.all([getServerTranslator(), getLocale()]);

  return (
    <section className="landing-hero">
      <div className="landing-container hero-layout">
        <div className="hero-copy">
          <h1 className="font-display hero-title">
            {t("hero.titleLine1")}
            <span className="text-primary italic">
              {t("hero.titleEmphasis")}
            </span>
          </h1>
          <p className="hero-description">{t("hero.subtitle")}</p>
          <div className="hero-actions">
            <DownloadButtons
              size="lg"
              labels={{
                googlePlay: t("download.googlePlay"),
                appStore: t("download.appStore"),
                comingSoon: t("download.comingSoon"),
              }}
            />
            <p className="hero-reassurance">
              <Check aria-hidden="true" className="size-4" />
              {t("hero.disclaimer")}
            </p>
          </div>
          <HashLink href="#how-it-works" className="hero-explore">
            {t("hero.ctaSecondary")}
            <ArrowDown aria-hidden="true" className="size-4" />
          </HashLink>
        </div>

        <div className="hero-stage">
          <div className="hero-stage-ground" aria-hidden="true" />
          <figure className="hero-plan">
            <PhoneMockup
              src={`/screenshots/${locale}/plan.webp`}
              alt={t("screenshots.planCaption")}
              width={212}
            />
          </figure>
          <figure className="hero-recipes">
            <PhoneMockup
              src={`/screenshots/${locale}/recipes.webp`}
              alt={t("hero.screenshotAlt")}
              width={270}
              priority
            />
          </figure>
        </div>
      </div>
    </section>
  );
}
