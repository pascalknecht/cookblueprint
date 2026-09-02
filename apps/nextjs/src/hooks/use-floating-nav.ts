import { useSyncExternalStore } from "react";

const THRESHOLD_PX = 16;

function subscribe(onStoreChange: () => void) {
  window.addEventListener("scroll", onStoreChange, { passive: true });
  return () => window.removeEventListener("scroll", onStoreChange);
}

function getSnapshot() {
  return window.scrollY > THRESHOLD_PX;
}

function getServerSnapshot() {
  return false;
}

export function useFloatingNav() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
