"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

export function Links() {
  const { t } = useTranslation();
  const path = usePathname();

  if (path !== "/") {
    return null;
  }

  return (
    <div>
      <Button variant={"link"} asChild>
        <Link href="/#features">{t("header.features")}</Link>
      </Button>

      <Button variant={"link"} asChild>
        <Link href="/#pricing">{t("header.pricing")}</Link>
      </Button>
    </div>
  );
}
