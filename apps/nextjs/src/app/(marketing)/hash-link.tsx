"use client";

import { forwardRef, type ComponentProps, type MouseEvent } from "react";

function scrollToHash(href: string, event: MouseEvent<HTMLAnchorElement>) {
  const url = new URL(href, window.location.href);
  if (url.pathname !== window.location.pathname) return;
  if (!url.hash) return;

  const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
  if (!target) return;

  event.preventDefault();
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  if (url.hash !== window.location.hash) {
    history.pushState(null, "", `${url.pathname}${url.hash}`);
  }
}

export const HashLink = forwardRef<HTMLAnchorElement, ComponentProps<"a">>(
  function HashLink({ href, onClick, ...props }, ref) {
    return (
      <a
        ref={ref}
        href={href}
        onClick={(event) => {
          onClick?.(event);
          if (
            event.defaultPrevented ||
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey ||
            !href
          ) {
            return;
          }
          scrollToHash(href, event);
        }}
        {...props}
      />
    );
  },
);
