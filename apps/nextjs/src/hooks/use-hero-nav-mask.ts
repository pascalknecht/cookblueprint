"use client";

import { useCallback } from "react";

/** Track the actual rounded hero, including responsive layout and translated copy. */
export function useHeroNavMask(enabled: boolean) {
  return useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || !enabled) return;

      let frame = 0;
      let hero: HTMLElement | null = null;
      let lastGeometry = "";

      const update = () => {
        frame = 0;
        const nextHero = document.querySelector<HTMLElement>(".landing-hero");
        if (nextHero !== hero) {
          if (hero) resizeObserver.unobserve(hero);
          hero = nextHero;
          if (hero) resizeObserver.observe(hero);
        }

        if (!hero) {
          node.style.setProperty(
            "--nav-hero-mask",
            "linear-gradient(transparent, transparent)",
          );
          lastGeometry = "";
          return;
        }

        const bounds = hero.getBoundingClientRect();
        const origin = node.getBoundingClientRect();

        // Once the hero (including its bottom edge) has scrolled fully past the nav, the
        // rounded-rect mask no longer has any reason to overlap it — but with no explicit
        // cutoff here, a sliver of the mask rect's own bottom edge kept poking into the nav's
        // tiny height indefinitely, and blurring that thin unmasked strip (backdrop-filter)
        // rendered as a hard rectangular band across the pill instead of fading out cleanly.
        if (bounds.top - origin.top + bounds.height <= 0) {
          if (lastGeometry !== "") {
            node.style.setProperty(
              "--nav-hero-mask",
              "linear-gradient(transparent, transparent)",
            );
            lastGeometry = "";
          }
          return;
        }

        const radius = getComputedStyle(hero).borderTopLeftRadius;
        const geometry = [
          bounds.width,
          bounds.height,
          bounds.left - origin.left,
          bounds.top - origin.top,
          radius,
        ].join(",");
        if (geometry === lastGeometry) return;
        lastGeometry = geometry;

        // The SVG is an alpha mask, never a visible image. Both layers share it.
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${bounds.width}" height="${bounds.height}"><rect width="100%" height="100%" rx="${parseFloat(radius)}" fill="white"/></svg>`;
        node.style.setProperty(
          "--nav-hero-mask",
          `url("data:image/svg+xml,${encodeURIComponent(svg)}")`,
        );
        node.style.setProperty(
          "--nav-mask-size",
          `${bounds.width}px ${bounds.height}px`,
        );
        node.style.setProperty(
          "--nav-mask-position",
          `${bounds.left - origin.left}px ${bounds.top - origin.top}px`,
        );
      };

      const schedule = () => {
        if (!frame) frame = requestAnimationFrame(update);
      };
      const resizeObserver = new ResizeObserver(schedule);
      resizeObserver.observe(node);
      // Streamed content and client navigation can insert the hero after the header.
      const mutationObserver = new MutationObserver(schedule);
      const main = document.querySelector("main");
      if (main)
        mutationObserver.observe(main, { childList: true, subtree: true });
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule);
      window.addEventListener("pageshow", schedule);
      update();

      return () => {
        cancelAnimationFrame(frame);
        resizeObserver.disconnect();
        mutationObserver.disconnect();
        window.removeEventListener("scroll", schedule);
        window.removeEventListener("resize", schedule);
        window.removeEventListener("pageshow", schedule);
      };
    },
    [enabled],
  );
}
