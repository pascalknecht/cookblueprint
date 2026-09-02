import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getServerTranslator } from "@/lib/i18n/server";
import { HashLink } from "./hash-link";

export async function CallToAction() {
  const t = await getServerTranslator();
  return (
    <section className="border-t border-border py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl md:text-5xl">
            {t("callToAction.titlePrefix")}
            <span className="text-primary italic">{t("callToAction.titleEmphasis")}</span>
          </h2>
          <p className="text-muted-foreground mt-5 text-base md:text-lg">
            {t("callToAction.subtitle")}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              className="rounded-full bg-near text-near-foreground hover:bg-near/90"
              asChild
            >
              <Link href="/register">
                {t("callToAction.ctaPrimary")}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <HashLink href="#pricing">{t("callToAction.ctaSecondary")}</HashLink>
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
