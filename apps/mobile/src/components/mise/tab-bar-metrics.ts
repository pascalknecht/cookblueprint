export const TAB_BAR_HEIGHT = 72;

// Devices with a bottom system nav bar (insetsBottom > 0) need extra breathing
// room above it, or the pill reads as glued to it — gesture-nav devices have no
// such bar and just get the flat 16 floor.
export function getTabBarBottomGap(insetsBottom: number): number {
  return insetsBottom > 0 ? insetsBottom + 16 : 16;
}

// Space below the last scroll item so it can travel above the floating pill
// instead of dying underneath it. `extra` is for screen-owned chrome that also
// overlays the list (the shopping add-item bar).
const TAB_BAR_SCROLL_EXTRA = 24;

export function getTabBarScrollPadding(insetsBottom: number, extra = 0): number {
  return TAB_BAR_HEIGHT + getTabBarBottomGap(insetsBottom) + TAB_BAR_SCROLL_EXTRA + extra;
}
