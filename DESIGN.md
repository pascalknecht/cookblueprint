---
name: CookBlueprint
description: Warm kitchen tools for household recipes, meal plans, and a shared list.
colors:
  clay-terracotta: "#C4553E"
  brand-dark: "#9E3F2C"
  brand-light: "#D9714E"
  recipe-paper: "#FBF6EF"
  porcelain: "#FFFFFF"
  ink: "#221E1B"
  ink-soft: "#4A423B"
  muted: "#97887C"
  muted-light: "#B3A99D"
  border: "#EAE1D4"
  border-soft: "#F0E8DD"
  ink-night: "#141118"
  cream-text: "#FFF9F3"
  tint: "#FBEDE7"
  gold: "#E8A33D"
  berry: "#B0447E"
  fired-clay: "#C77C3A"
  amber: "#D98324"
  success: "#2FA46A"
typography:
  display:
    fontFamily: "Rethink Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3.75rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Rethink Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.875rem, 4vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Rethink Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.1875rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.14em"
rounded:
  sm: "10px"
  md: "14px"
  lg: "16px"
  xl: "18px"
  xxl: "22px"
  chrome: "26px"
  pill: "999px"
spacing:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "22px"
  xxl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.ink-night}"
    textColor: "{colors.cream-text}"
    rounded: "{rounded.lg}"
    padding: "0 18px"
    height: "56px"
    typography: "{typography.body}"
  button-primary-hover:
    backgroundColor: "{colors.ink-night}"
    textColor: "{colors.cream-text}"
    rounded: "{rounded.lg}"
    height: "56px"
  button-secondary:
    backgroundColor: "{colors.porcelain}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "0 18px"
    height: "56px"
  button-cta:
    backgroundColor: "{colors.ink-night}"
    textColor: "{colors.cream-text}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
    height: "40px"
  input:
    backgroundColor: "{colors.porcelain}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 15px"
    height: "54px"
  card:
    backgroundColor: "{colors.porcelain}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "0"
  chip:
    backgroundColor: "{colors.porcelain}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "6px 14px"
  chip-selected:
    backgroundColor: "{colors.ink-soft}"
    textColor: "{colors.cream-text}"
    rounded: "{rounded.pill}"
    padding: "6px 14px"
  nav-floating:
    backgroundColor: "{colors.recipe-paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "56px"
    padding: "0 20px"
  tab-bar:
    backgroundColor: "{colors.ink-night}"
    textColor: "{colors.muted-light}"
    rounded: "{rounded.chrome}"
    height: "72px"
    padding: "10px"
  page-header:
    backgroundColor: "{colors.ink-night}"
    textColor: "{colors.cream-text}"
    rounded: "{rounded.chrome}"
    padding: "12px 22px 20px"
---

# Design System: CookBlueprint

## 1. Overview

**Creative North Star: "The Kitchen Counter"**

This system is a kitchen counter in late afternoon: recipe paper under the hands, a copper pot on the back burner, nothing performing. Surfaces are warm cream. Chrome is Ink Night, like a cast-iron handle. Clay Terracotta is the one cooked note, used the way you use a tomato: visible, rare, never the whole plate.

The mood is warm premium. Paper, copper, and quiet confidence. Density stays scannable. This is for weeknight decisions, not a gallery. PRODUCT.md asks for premium, calm, trustworthy craft: expert and practical, with proof over hype. The counter does that by showing the actual tools: recipes, a real week, a shared list.

It rejects dark neon or crypto-style aesthetics, overly playful consumer-app styling, and gradient-heavy visual noise and decorative effects.

**Key Characteristics:**
- Recipe Paper ground, Ink Night chrome, Clay Terracotta as the scarce accent
- Rethink Sans display plus Plus Jakarta Sans body
- Floating pills for chrome (app tab bar, marketing nav after scroll); dark rounded headers in the app
- Soft kitchen radii (10px to 26px); true pills only for CTAs, chips, and capsules
- Shadows only on floating chrome and recipe cards; cream tone does the rest

## 2. Colors: The Kitchen Counter Palette

Warm paper, one cooked accent, iron chrome. Neutrals are tinted toward clay (hue around 50 to 80). Never a cold gray.

### Primary
- **Clay Terracotta** (`{colors.clay-terracotta}`): Logo mark, italic display emphasis, brand chips, focus ring. The cooked note. Not the fill for primary actions.
- **Brand Dark** (`{colors.brand-dark}`): Pressed or deeper terracotta. Gradient button shadow color in the app.
- **Brand Light** (`{colors.brand-light}`): Active tab icon and the light stop on the rare gradient button.

### Secondary
- **Gold** (`{colors.gold}`): Recipe accent and marketing "recipes" eyebrow. One of six recipe-card tints.
- **Berry** (`{colors.berry}`): Household and people cues.
- **Fired Clay** (`{colors.fired-clay}`): Earth accent beside terracotta; recipe-card tint.
- **Amber** (`{colors.amber}`): Recipe-card tint only.
- **Success** (`{colors.success}`): Done states, shopping checks, "list" cues. Functional, not decorative.

### Neutral
- **Recipe Paper** (`{colors.recipe-paper}`): Page ground on marketing and in the app.
- **Porcelain** (`{colors.porcelain}`): Cards, fields, secondary buttons.
- **Ink** (`{colors.ink}`): Body text and icons at rest.
- **Ink Soft** (`{colors.ink-soft}`): Field labels, selected filter chips.
- **Muted** (`{colors.muted}`): Secondary copy, inactive chrome.
- **Border** (`{colors.border}`): Hairlines on fields and cards. **Border Soft** (`{colors.border-soft}`) on recipe cards.
- **Ink Night** (`{colors.ink-night}`): App headers, tab bar, primary buttons, marketing Get Started.
- **Cream Text** (`{colors.cream-text}`): Type sitting on Ink Night.
- **Tint** (`{colors.tint}`): Warm wash behind terracotta chips.

### Named Rules
**The Clay Rule.** Clay Terracotta occupies at most a tenth of any screen. Logo marks, italic emphasis, brand chips, focus. Primary actions are Ink Night. If a layout is mostly orange, it has failed.

**The Warm Neutral Rule.** Every gray is tinted toward clay. Cold slate, cool zinc, and pure `#000` / `#fff` as a palette choice are forbidden. Porcelain is the one near-white, and it sits on Recipe Paper so it never reads as hospital white.

## 3. Typography

**Display Font:** Rethink Sans (ui-sans-serif, system-ui, sans-serif)
**Body Font:** Plus Jakarta Sans (ui-sans-serif, system-ui, sans-serif)

**Character:** A heavy, slightly geometric display that behaves like a painted sign on the counter, paired with a humanist sans that reads as a well-set recipe card. No serif. No mono costume.

### Hierarchy
- **Display** (700, `clamp(2.25rem, 5vw, 3.75rem)`, line-height 1.1, tracking `-0.02em`): Marketing heroes. Italic Clay Terracotta on the emphasis span only.
- **Headline** (700, `clamp(1.875rem, 4vw, 3rem)`, line-height 1.15, tracking `-0.02em`): Section titles. App large page titles sit at 34px / 38px line-height, same face.
- **Title** (700, 19px, line-height 1.2, tracking `-0.02em`): Compact app header once the large title has scrolled away. Marketing wordmark at 18px.
- **Body** (400, 16px, line-height 1.6, max ~70ch): Paragraphs, list copy, field values (15px in app fields). Medium 500, semibold 600, bold 700, extra-bold 800 are for UI labels and buttons, not for fake display.
- **Label** (600, 12px to 13px; tab labels 10.5px): Eyebrows use wide tracking (`0.14em` to `0.18em`) and uppercase only for short section kicker text. Field labels are 13px Ink Soft, sentence case, tracking normal.

### Named Rules
**The Tight Display Rule.** Display type is always Rethink Sans 700 with tracking `-0.02em` (app: `-0.5px` at 34px). Default tracking on this face looks loose. Never substitute a serif or a second display family.

**The One Italic Rule.** Italic is a single cooked word, not a paragraph style. Marketing uses it on the terracotta emphasis span. Body copy stays roman.

## 4. Elevation

Hybrid. Depth starts as a tonal shift on Recipe Paper (muted fill, tint wash, dimmer paper). Shadows appear only on floating chrome and recipe cards. Flat cards with a 1px Border Soft hairline are the default resting surface.

### Shadow Vocabulary
- **Recipe card** (`box-shadow: 0 6px 16px rgba(90, 60, 20, 0.05)`): Warm brown, not black. App `shadowColor: #5A3C14`, opacity 0.05, radius 16, offset y 6.
- **Floating chrome** (`box-shadow: 0 10px 28px oklch(0.2 0.03 50 / 0.14)`): Marketing nav after scroll. Soft, warm, large blur.
- **Tab bar** (`shadowColor: #000`, opacity 0.28, radius 18, offset y 10): The dark floating pill needs more lift than a paper card because it sits over photographs.
- **Gradient button** (`shadowColor` brand-dark, opacity 0.32, radius 12, offset y 8): Reserved for the rare terracotta gradient CTA in the app. Not a marketing default.

### Named Rules
**The Paper First Rule.** If a surface can read as a sheet of paper on the counter, use tone and a 1px border. Shadows are for things that float: the tab bar, the scrolled marketing capsule, a recipe card that has to lift off the grid.

**The No Layout Motion Rule.** Animate color, shadow, transform, border-radius, backdrop-filter. Never width, height, margin, padding, or top. Marketing nav eases 400ms `cubic-bezier(0.16, 1, 0.3, 1)`. App tab indicator is 280ms cubic-out. Press scale uses a snappy spring (damping 20, stiffness 500). Honor `prefers-reduced-motion` by dropping those transitions.

## 5. Components

Soft kitchen tools: generous radius, cream fills, terracotta sparingly. Primary fills are Ink Night.

### Buttons
- **Shape:** App primary and secondary use a 16px radius (`{rounded.lg}`) at 56px tall (48px compact). Marketing Get Started is a true pill (`{rounded.pill}`).
- **Primary:** Ink Night fill, Cream Text, Plus Jakarta Bold 16px. This is the action, not terracotta.
- **Secondary:** Porcelain fill, 1.5px Border, Ink label.
- **Marketing CTA:** Ink Night pill with a trailing arrow. Outline sibling is Porcelain with a hairline Border.
- **Hover / Focus:** App press-scale on the whole control. Marketing uses `hover:bg-near/90` and a 3px ring of Clay Terracotta at 30% on focus-visible. Active may shift 1px down. Disabled is 50% opacity.
- **Gradient:** App-only, Brand Light to Clay Terracotta. Do not use on the marketing site.

### Chips
- **Style:** Pill. Unselected is Porcelain with a thin Border and Ink. Selected is Ink Soft with Cream Text.
- **State:** Filter chips on Recipes ("All", meal types). Never terracotta fills for selection; terracotta is the brand mark, not a toggle.

### Cards / Containers
- **Corner Style:** Recipe cards 18px (`{rounded.xl}`). Marketing cards follow the 18px base radius, often appearing very round (`rounded-2xl` / `rounded-4xl` on shadcn). Photo top, meta below. No nested cards.
- **Background:** Porcelain on Recipe Paper.
- **Shadow Strategy:** Recipe cards get the warm 5% brown shadow. Marketing feature mocks may use a lighter `shadow-sm` plus Border.
- **Border:** 1px Border Soft on recipe cards; Border on marketing mocks.
- **Internal Padding:** Photo 112px tall in the app grid; body padding 12px to 16px.

### Inputs / Fields
- **Style:** Porcelain field, 1.5px Border, 14px radius (`{rounded.md}`), 54px tall, 15px Plus Jakarta. Label 13px semibold Ink Soft, 7px above the field.
- **Focus:** Border and ring shift to Clay Terracotta (`{colors.clay-terracotta}`).
- **Error / Disabled:** Destructive border and ring. Disabled at 50% opacity. Placeholder is Muted Light.

### Navigation
- **App tab bar:** Ink Night pill, 26px radius (`{rounded.chrome}`), 10px inset, 18px from the side, 16px from the bottom (plus safe area). Four tabs. Active icon is Brand Light. Inactive is `#9A8F82`. A 16px-radius indicator (outer 26 minus inset 10) slides at 280ms. This is the signature chrome.
- **App page header:** Ink Night block, bottom corners 26px, Cream Text 34px Rethink. Scrolls away with content. A compact 19px bar crossfades in. Not a sticky reshape.
- **Marketing nav:** Docked is flush, transparent, three columns (logo, links, actions). After 16px of scroll it becomes a centered Recipe Paper capsule (78% opaque, `blur(20px)`, 28px radius on a 56px bar, warm floating shadow). Links are 14px Muted, hover Ink. Pointer-events belong only to the bar, not the sticky spacer.
- **Logo mark:** 32px square, 10px radius, Clay Terracotta fill, cream chef-hat. Wordmark is Rethink Sans 18px Ink, not italic.

### Recipe Card (signature)
Porcelain tile, 18px corners, food photograph on top, 20m time badge as an Ink Night pill at 62% opacity, title in Plus Jakarta Bold, meta in Muted. Press scale to 0.96. Accent color lives in the photo placeholder, not as a side stripe.

## 6. Do's and Don'ts

### Do:
- **Do** put primary actions on Ink Night (`{colors.ink-night}`) with Cream Text.
- **Do** keep Clay Terracotta under 10% of the screen: mark, emphasis, focus, one chip.
- **Do** set Rethink Sans display at 700 with tracking `-0.02em`.
- **Do** use Recipe Paper as the page ground and Porcelain only for sitting objects (cards, fields, secondary buttons).
- **Do** compute inner radius as outer radius minus inset (tab indicator is the canonical example: 26px minus 10px equals 16px).
- **Do** float chrome: tab bar, compact header, marketing capsule after scroll.
- **Do** tint every shadow toward clay brown. Recipe cards use `#5A3C14` at 5%.
- **Do** meet WCAG 2.2 AA: text contrast, visible focus rings, keyboard paths, semantic structure.

### Don't:
- **Don't** use dark neon or crypto-style aesthetics.
- **Don't** use overly playful consumer-app styling.
- **Don't** use gradient-heavy visual noise and decorative effects. The app gradient button is a single exception, never a marketing pattern.
- **Don't** fill primary buttons with Clay Terracotta. That color is the accent, not the action.
- **Don't** set `border-left` or `border-right` greater than 1px as a colored stripe on cards, lists, or callouts.
- **Don't** clip type to a gradient (`background-clip: text`).
- **Don't** default to glassmorphism. Frost is allowed on the scrolled marketing nav only.
- **Don't** ship the hero-metric template (big number, small label, supporting stats, gradient accent).
- **Don't** tile identical icon-title-text cards.
- **Don't** nest cards inside cards.
- **Don't** animate width, height, margin, padding, or top.
- **Don't** introduce Inter, a display serif, or monospace as "technical" costume.
- **Don't** use cold gray, pure black, or pure white as the palette. Porcelain on Recipe Paper is the white; Ink Night is the black.
