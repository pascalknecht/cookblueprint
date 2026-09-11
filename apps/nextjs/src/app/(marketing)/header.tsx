import React from "react";
import { getServerTranslator } from "@/lib/i18n/server";
import { SiteHeader } from "./site-header";

export async function Header() {
  const t = await getServerTranslator();
  return (
    <SiteHeader
      labels={{
        features: t("header.features"),
        howItWorks: t("header.howItWorks"),
        pricing: t("header.pricing"),
        menu: t("header.menu"),
      }}
      downloadLabels={{
        googlePlay: t("download.googlePlay"),
        appStore: t("download.appStore"),
        comingSoon: t("download.comingSoon"),
      }}
    />
  );
}
