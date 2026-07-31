import { getLocale, getServerTranslator } from "@/lib/i18n/server";
import { PhoneMockup } from "./phone-mockup";

export async function ScreenshotsSection() {
  const [t, locale] = await Promise.all([getServerTranslator(), getLocale()]);

  const shots = [
    { src: `/screenshots/${locale}/recipes.webp`, caption: t("screenshots.recipesCaption") },
    { src: `/screenshots/${locale}/plan.webp`, caption: t("screenshots.planCaption") },
    { src: `/screenshots/${locale}/shopping.webp`, caption: t("screenshots.shoppingCaption") },
    { src: `/screenshots/${locale}/recipe-detail.webp`, caption: t("screenshots.detailCaption") },
  ] as const;

  return (
    <section className="border-t border-border py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {t("screenshots.eyebrow")}
          </p>
          <h2 className="font-display text-3xl md:text-5xl">{t("screenshots.title")}</h2>
          <p className="mt-5 text-base text-muted-foreground md:text-lg">
            {t("screenshots.subtitle")}
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-6 md:grid-cols-4 md:gap-8">
          {shots.map((shot) => (
            <figure key={shot.src} className="mx-auto">
              <PhoneMockup src={shot.src} alt={shot.caption} width={220} />
              <figcaption className="text-muted-foreground mt-4 text-center text-sm font-medium">
                {shot.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
