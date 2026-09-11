import { getLocale, getServerTranslator } from "@/lib/i18n/server";
import { PhoneMockup } from "./phone-mockup";

export async function ScreenshotsSection() {
  const [t, locale] = await Promise.all([getServerTranslator(), getLocale()]);

  const shots = [
    {
      src: `/screenshots/${locale}/recipes.webp`,
      caption: t("screenshots.recipesCaption"),
    },
    {
      src: `/screenshots/${locale}/plan.webp`,
      caption: t("screenshots.planCaption"),
    },
    {
      src: `/screenshots/${locale}/shopping.webp`,
      caption: t("screenshots.shoppingCaption"),
    },
    {
      src: `/screenshots/${locale}/recipe-detail.webp`,
      caption: t("screenshots.detailCaption"),
    },
  ] as const;

  return (
    <section className="screenshot-section border-border border-t py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="text-muted-foreground mb-3 text-xs font-medium tracking-[0.18em] uppercase">
            {t("screenshots.eyebrow")}
          </p>
          <h2 className="font-display text-3xl md:text-5xl">
            {t("screenshots.title")}
          </h2>
          <p className="text-muted-foreground mt-5 text-base md:text-lg">
            {t("screenshots.subtitle")}
          </p>
        </div>

        <div
          className="screenshot-gallery"
          role="region"
          aria-label={t("screenshots.title")}
          tabIndex={0}
        >
          {shots.map((shot) => (
            <figure key={shot.src} className="screenshot-figure">
              <PhoneMockup src={shot.src} alt={shot.caption} width={220} />
              <figcaption className="mt-5 text-center text-sm font-semibold">
                {shot.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
