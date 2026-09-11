import { Button } from "@/components/ui/button";
import { getServerTranslator } from "@/lib/i18n/server";
import { DownloadButtons } from "./download-buttons";
import { HashLink } from "./hash-link";

export async function CallToAction() {
  const t = await getServerTranslator();
  return (
    <section className="closing-section py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl md:text-5xl">
            {t("callToAction.titlePrefix")}
            <span className="text-primary italic">
              {t("callToAction.titleEmphasis")}
            </span>
          </h2>
          <p className="text-muted-foreground mt-5 text-base md:text-lg">
            {t("callToAction.subtitle")}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4">
            <DownloadButtons
              size="lg"
              labels={{
                googlePlay: t("download.googlePlay"),
                appStore: t("download.appStore"),
                comingSoon: t("download.comingSoon"),
              }}
            />
            <Button variant="outline" size="lg" asChild>
              <HashLink href="#pricing">
                {t("callToAction.ctaSecondary")}
              </HashLink>
            </Button>
          </div>
          <p className="text-muted-foreground mt-4 text-xs">
            {t("callToAction.disclaimer")}
          </p>
        </div>
      </div>
    </section>
  );
}
