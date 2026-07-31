"use client";

import { LoaderButton } from "@/components/loader-button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  ArrowUpRight,
  CheckCircle2,
  CreditCard,
  Loader2,
  RefreshCcw,
  Sparkles,
} from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export type BillingPlanView = {
  priceId: string;
  productName: string;
  productDescription: string | null;
  amount: number;
  currency: string;
  interval: string;
  intervalCount: number;
};

export type BillingStateView = {
  customerId: string | null;
  customerEmail: string | null;
  hasActiveSubscription: boolean;
  activeSubscription: {
    id: string;
    status: string | null;
    priceId: string | null;
    productName: string | null;
    currentPeriodEnd: number | null;
  } | null;
  plans: BillingPlanView[];
};

type CheckoutIntent = "create" | "update";

function formatPrice(plan: BillingPlanView): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: plan.currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  const amount = plan.amount / 100;
  return formatter.format(amount);
}

type Translate = ReturnType<typeof useTranslation>["t"];

const INTERVAL_KEY: Record<string, "intervalDay" | "intervalWeek" | "intervalMonth" | "intervalYear"> = {
  day: "intervalDay",
  week: "intervalWeek",
  month: "intervalMonth",
  year: "intervalYear",
};
const INTERVAL_KEY_PLURAL: Record<string, "intervalDayPlural" | "intervalWeekPlural" | "intervalMonthPlural" | "intervalYearPlural"> = {
  day: "intervalDayPlural",
  week: "intervalWeekPlural",
  month: "intervalMonthPlural",
  year: "intervalYearPlural",
};

function formatInterval(plan: BillingPlanView, t: Translate): string {
  const singularKey = INTERVAL_KEY[plan.interval];
  if (plan.intervalCount <= 1) {
    return `/${singularKey ? t(`subscriptionManagement.${singularKey}`) : plan.interval}`;
  }
  const pluralKey = INTERVAL_KEY_PLURAL[plan.interval];
  const unit = pluralKey ? t(`subscriptionManagement.${pluralKey}`) : `${plan.interval}s`;
  return `${t("subscriptionManagement.every")} ${plan.intervalCount} ${unit}`;
}

function formatSubscriptionStatus(status: string | null, t: Translate): string {
  if (!status) {
    return t("subscriptionManagement.unknownStatus");
  }
  return status.replaceAll("_", " ");
}

function formatDateFromUnix(timestamp: number | null): string {
  if (!timestamp) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(timestamp * 1000));
}

type SubscriptionManagementProps = {
  billingState: BillingStateView;
};

export function SubscriptionManagement({
  billingState,
}: SubscriptionManagementProps) {
  const { t } = useTranslation();
  const [submittingPlanId, setSubmittingPlanId] = useState<string | null>(null);
  const [isPortalPending, startPortalTransition] = useTransition();

  const currentPlanId = billingState.activeSubscription?.priceId ?? null;

  async function startCheckout(priceId: string, intent: CheckoutIntent) {
    try {
      setSubmittingPlanId(priceId);
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          intent,
        }),
      });

      const data = (await response.json()) as { error?: string; url?: string };

      if (!response.ok) {
        toast.error(data.error ?? t("subscriptionManagement.checkoutErrorFallback"));
        return;
      }

      if (!data.url) {
        toast.error(t("subscriptionManagement.checkoutNoUrl"));
        return;
      }

      window.location.assign(data.url);
    } catch {
      toast.error(t("subscriptionManagement.checkoutGenericError"));
    } finally {
      setSubmittingPlanId(null);
    }
  }

  function openPortal() {
    startPortalTransition(async () => {
      try {
        const response = await fetch("/api/stripe/portal", {
          method: "POST",
        });

        const data = (await response.json()) as { error?: string; url?: string };

        if (!response.ok) {
          toast.error(data.error ?? t("subscriptionManagement.portalErrorFallback"));
          return;
        }

        if (!data.url) {
          toast.error(t("subscriptionManagement.portalNoUrl"));
          return;
        }

        window.location.assign(data.url);
      } catch {
        toast.error(t("subscriptionManagement.portalGenericError"));
      }
    });
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/60">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="size-3" />
              {t("subscriptionManagement.billingBadge")}
            </Badge>
            {billingState.hasActiveSubscription ? (
              <Badge className="capitalize">
                {formatSubscriptionStatus(billingState.activeSubscription?.status ?? null, t)}
              </Badge>
            ) : (
              <Badge variant="outline">{t("subscriptionManagement.noActiveSubscription")}</Badge>
            )}
          </div>
          <CardTitle className="text-xl">{t("subscriptionManagement.title")}</CardTitle>
          <CardDescription>
            {t("subscriptionManagement.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 text-sm md:grid-cols-3">
            <div className="rounded-2xl border bg-muted/40 p-3">
              <p className="text-muted-foreground">{t("subscriptionManagement.currentPlan")}</p>
              <p className="font-medium">
                {billingState.activeSubscription?.productName ?? t("subscriptionManagement.noPlanSelected")}
              </p>
            </div>
            <div className="rounded-2xl border bg-muted/40 p-3">
              <p className="text-muted-foreground">{t("subscriptionManagement.renewsEnds")}</p>
              <p className="font-medium">
                {formatDateFromUnix(billingState.activeSubscription?.currentPeriodEnd ?? null)}
              </p>
            </div>
            <div className="rounded-2xl border bg-muted/40 p-3">
              <p className="text-muted-foreground">{t("subscriptionManagement.stripeCustomer")}</p>
              <p className="truncate font-medium">
                {billingState.customerId ?? t("subscriptionManagement.createdOnFirstCheckout")}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <LoaderButton
            variant="outline"
            onClick={openPortal}
            isLoading={isPortalPending}
            disabled={!billingState.customerId}
            className="w-full sm:w-auto"
          >
            <CreditCard />
            {t("subscriptionManagement.openCustomerPortal")}
            <ArrowUpRight />
          </LoaderButton>
          <p className="text-xs text-muted-foreground">
            {billingState.customerId
              ? t("subscriptionManagement.portalHintAvailable")
              : t("subscriptionManagement.portalHintUnavailable")}
          </p>
        </CardFooter>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {billingState.plans.map((plan) => {
          const isCurrentPlan = currentPlanId === plan.priceId;
          const intent: CheckoutIntent = billingState.hasActiveSubscription
            ? "update"
            : "create";
          const buttonLabel = billingState.hasActiveSubscription
            ? isCurrentPlan
              ? t("subscriptionManagement.currentPlanButton")
              : t("subscriptionManagement.switchWithCheckout")
            : t("subscriptionManagement.startSubscription");

          return (
            <Card
              key={plan.priceId}
              className={cn(
                "border-border/60 transition-colors",
                isCurrentPlan && "border-primary/40 bg-primary/5"
              )}
            >
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle>{plan.productName}</CardTitle>
                  {isCurrentPlan ? (
                    <Badge className="gap-1">
                      <CheckCircle2 className="size-3" />
                      {t("subscriptionManagement.currentPlanBadge")}
                    </Badge>
                  ) : (
                    <Badge variant="outline">{plan.interval}</Badge>
                  )}
                </div>
                <CardDescription>
                  {plan.productDescription ?? t("subscriptionManagement.flexiblePlan")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-3xl font-semibold">{formatPrice(plan)}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatInterval(plan, t)}
                  </p>
                </div>
                <Separator />
                <div className="text-sm text-muted-foreground">
                  {billingState.hasActiveSubscription
                    ? t("subscriptionManagement.checkoutExistingHint")
                    : t("subscriptionManagement.checkoutNewHint")}
                </div>
              </CardContent>
              <CardFooter>
                <LoaderButton
                  className="w-full"
                  onClick={() => startCheckout(plan.priceId, intent)}
                  isLoading={submittingPlanId === plan.priceId}
                  disabled={isCurrentPlan}
                >
                  {submittingPlanId === plan.priceId ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <RefreshCcw />
                  )}
                  {buttonLabel}
                </LoaderButton>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
