import { Mail, Users } from "lucide-react";
import React from "react";
import { getServerTranslator } from "@/lib/i18n/server";

export async function HouseholdSection() {
  const t = await getServerTranslator();

  const members = [
    { name: "Sarah", role: t("household.roleOwner"), initial: "S" },
    { name: "Mike", role: t("household.roleMember"), initial: "M" },
    { name: "Anna", role: t("household.roleMember"), initial: "A" },
  ];

  return (
    <section className="border-t border-border bg-muted/30 py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto grid max-w-5xl items-center gap-12 md:grid-cols-2 md:gap-16">
          <div>
            <p className="text-primary mb-3 text-xs font-semibold uppercase tracking-[0.18em]">
              {t("household.eyebrow")}
            </p>
            <h2 className="font-display text-3xl md:text-4xl">
              {t("household.title")}
            </h2>
            <p className="text-muted-foreground mt-5 text-base leading-relaxed md:text-lg">
              {t("household.description")}
            </p>
            <div className="mt-6 flex items-center gap-2 text-sm">
              <Mail className="text-berry size-4" />
              <span className="text-muted-foreground">
                {t("household.inviteHint")}
              </span>
            </div>
          </div>

          <div className="border-border bg-card mx-auto w-full max-w-sm rounded-2xl border p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Users className="text-primary size-4" />
              <p className="text-sm font-semibold">{t("household.demoHouseholdName")}</p>
            </div>
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.name} className="flex items-center gap-3">
                  <div className="bg-primary/15 flex size-9 items-center justify-center rounded-full text-sm font-medium">
                    {member.initial}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-muted-foreground text-xs">{member.role}</p>
                  </div>
                </div>
              ))}
              <div className="border-border flex items-center gap-3 rounded-xl border border-dashed p-2.5">
                <div className="bg-muted flex size-9 items-center justify-center rounded-full">
                  <Mail className="text-muted-foreground size-4" />
                </div>
                <p className="text-muted-foreground text-sm">{t("household.inviteSomeone")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
