import { redirect } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { getSSRSession } from "@/lib/get-server-session";
import { finalizeCheckoutSubscriptionUpdate } from "@/use-cases/billing-checkout";
import { getBillingStateForUser } from "@/use-cases/billing";
import { CircleAlert, CircleCheck, CircleX } from "lucide-react";
import { SubscriptionManagement } from "./_components/subscription-management";
import { DeleteAccountButton } from "./_components/delete-account-button";
import { getServerTranslator } from "@/lib/i18n/server";

type BillingPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getBillingBannerMessage(
  status: string | undefined,
  t: Awaited<ReturnType<typeof getServerTranslator>>,
  checkoutFinalizeStatus?: "success" | "pending" | "error"
): {
  variant: "default" | "destructive" | "success";
  title: string;
  description: string;
  icon: "success" | "cancelled" | "error";
} | null {
  switch (status) {
    case "checkout-success":
      if (checkoutFinalizeStatus === "error") {
        return {
          variant: "destructive",
          title: t("settings.checkoutIssueTitle"),
          description: t("settings.checkoutIssueDescription"),
          icon: "error",
        };
      }

      if (checkoutFinalizeStatus === "pending") {
        return {
          variant: "default",
          title: t("settings.checkoutProcessingTitle"),
          description: t("settings.checkoutProcessingDescription"),
          icon: "success",
        };
      }

      return {
        variant: "success",
        title: t("settings.checkoutCompletedTitle"),
        description: t("settings.checkoutCompletedDescription"),
        icon: "success",
      };
    case "checkout-cancelled":
      return {
        variant: "default",
        title: t("settings.checkoutCancelledTitle"),
        description: t("settings.checkoutCancelledDescription"),
        icon: "cancelled",
      };
    case "portal-return":
      return {
        variant: "success",
        title: t("settings.portalReturnTitle"),
        description: t("settings.portalReturnDescription"),
        icon: "success",
      };
    default:
      return null;
  }
}

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const params = await searchParams;
  const billingParam =
    typeof params.billing === "string" ? params.billing : undefined;
  const sessionId =
    typeof params.session_id === "string" ? params.session_id : undefined;

  const { user } = await getSSRSession();
  if (!user?.email) {
    redirect("/login?callbackUrl=/billing");
  }

  const t = await getServerTranslator();

  let checkoutFinalizeStatus: "success" | "pending" | "error" | undefined;
  if (billingParam === "checkout-success" && sessionId) {
    const finalizeResult = await finalizeCheckoutSubscriptionUpdate({
      sessionId,
      userId: user.id,
    });

    if (finalizeResult.status === "cancelled-previous") {
      checkoutFinalizeStatus = "success";
    } else if (finalizeResult.status === "pending") {
      checkoutFinalizeStatus = "pending";
    } else if (finalizeResult.status === "error") {
      checkoutFinalizeStatus = "error";
    }
  }

  const banner = getBillingBannerMessage(billingParam, t, checkoutFinalizeStatus);

  const billingState = await getBillingStateForUser(user.email);

  const Icon =
    banner?.icon === "success"
      ? CircleCheck
      : banner?.icon === "cancelled"
        ? CircleX
        : CircleAlert;

  return (
    <div className="container mx-auto max-w-4xl space-y-6 px-4 py-16">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{t("settings.title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("settings.subtitle")}
        </p>
      </div>

      {banner ? (
        <Alert variant={banner.variant}>
          <Icon className="size-4" />
          <AlertTitle>{banner.title}</AlertTitle>
          <AlertDescription>{banner.description}</AlertDescription>
        </Alert>
      ) : null}

      {billingState.plans.length === 0 ? (
        <Alert variant="destructive">
          <CircleAlert className="size-4" />
          <AlertTitle>{t("settings.noPlansTitle")}</AlertTitle>
          <AlertDescription>
            {t("settings.noPlansDescription")}
          </AlertDescription>
        </Alert>
      ) : (
        <SubscriptionManagement billingState={billingState} />
      )}

      <Separator />

      <div className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">{t("settings.dangerZoneTitle")}</h2>
          <p className="text-sm text-muted-foreground">{t("settings.dangerZoneDescription")}</p>
        </div>
        <DeleteAccountButton />
      </div>
    </div>
  );
}
