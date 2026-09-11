import { cn } from "@/lib/utils";

function AppleLogo({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </svg>
  );
}

function GooglePlayLogo({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202a1.49 1.49 0 0 1 0 2.594zM1.337.924a1.486 1.486 0 0 0-.112.568v21.017c0 .217.045.419.124.6l11.155-11.087L1.337.924zm12.207 10.065l3.258-3.238L3.45.195a1.466 1.466 0 0 0-.946-.179l11.04 10.973zm0 2.067l-11 10.933c.298.036.612-.016.906-.183l13.324-7.54-3.23-3.21z" />
    </svg>
  );
}

// No iOS App Store listing yet — flip this to a real
// https://apps.apple.com/app/idXXXXXXXXXX link once the app is live there.
const APP_STORE_URL: string | null = null;
const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.cookblueprint.app";

export type DownloadButtonsLabels = {
  googlePlay: string;
  appStore: string;
  comingSoon: string;
};

type DownloadButtonsProps = {
  labels: DownloadButtonsLabels;
  size?: "sm" | "default" | "lg";
  compact?: boolean;
  /** Always stack the two pills full-width instead of sitting side by side — for narrow containers like a pricing card. */
  stack?: boolean;
  className?: string;
};

const SIZE_CLASSES: Record<"sm" | "default" | "lg", string> = {
  sm: "px-3.5 py-2 text-xs gap-1.5",
  default: "px-5 py-2.5 text-sm gap-2",
  lg: "px-6 py-3 text-base gap-2",
};

const ICON_SIZE: Record<"sm" | "default" | "lg", string> = {
  sm: "size-3.5",
  default: "size-4",
  lg: "size-5",
};

export function DownloadButtons({
  labels,
  size = "default",
  compact = false,
  stack = false,
  className,
}: DownloadButtonsProps) {
  const pillClasses = cn(
    "inline-flex min-h-11 items-center justify-center rounded-full font-semibold transition-opacity focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary",
    stack ? "w-full" : "shrink-0 whitespace-nowrap",
    SIZE_CLASSES[size],
  );

  if (compact) {
    return (
      <div className={cn("flex items-center gap-1.5", className)}>
        <a
          href={GOOGLE_PLAY_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={labels.googlePlay}
          title={labels.googlePlay}
          className="bg-near text-near-foreground focus-visible:outline-primary inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <GooglePlayLogo className="size-4" />
          <span>{labels.googlePlay}</span>
        </a>
        <span
          aria-disabled="true"
          aria-label={`${labels.appStore} — ${labels.comingSoon}`}
          title={`${labels.appStore} — ${labels.comingSoon}`}
          className="sr-only"
        >
          <AppleLogo className="size-4" />
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "download-actions flex flex-col items-center justify-center gap-3",
        stack ? "w-full" : "",
        className,
      )}
    >
      <a
        href={GOOGLE_PLAY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          pillClasses,
          "bg-near text-near-foreground hover:opacity-90",
        )}
      >
        <GooglePlayLogo className={ICON_SIZE[size]} />
        {labels.googlePlay}
      </a>
      <span
        aria-disabled="true"
        title={labels.comingSoon}
        className={cn(
          "download-pending text-muted-foreground inline-flex max-w-full flex-wrap items-center justify-center gap-1.5 text-xs",
        )}
      >
        <AppleLogo className="size-3.5" />
        {labels.appStore}
        <span>({labels.comingSoon})</span>
      </span>
    </div>
  );
}

export { APP_STORE_URL, GOOGLE_PLAY_URL };
