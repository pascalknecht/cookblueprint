import React from "react";
import { MessageCircleOff, Repeat, Users } from "lucide-react";
import { getServerTranslator } from "@/lib/i18n/server";

export async function TrustBar() {
  const t = await getServerTranslator();

  const highlights = [
    { icon: MessageCircleOff, text: t("trustBar.highlight1"), color: "text-clay" },
    { icon: Users, text: t("trustBar.highlight2"), color: "text-berry" },
    { icon: Repeat, text: t("trustBar.highlight3"), color: "text-success" },
  ];

  return (
    <section className="border-t border-border py-8">
      <div className="container mx-auto px-4">
        <div className="mx-auto flex max-w-4xl flex-col flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm sm:flex-row">
          {highlights.map(({ icon: Icon, text, color }) => (
            <div key={text} className="text-muted-foreground flex items-center gap-2">
              <Icon className={`size-4 shrink-0 ${color}`} />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
