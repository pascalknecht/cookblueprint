# CookBlueprint

A recipe, meal-planning, and shared shopping list app for a household, built with [Expo Router](https://docs.expo.dev/router/introduction/).

- **Recipes** — save your own, or "import" from a link (the import flow uses fixed mock data for now — there's no real scraping yet).
- **Meal plan** — a real Monday–Sunday week (`date-utils.ts`), assign recipes to breakfast/lunch/dinner slots, or auto-generate the week.
- **Shopping list** — add ingredients from a single recipe or the whole week's plan, with de-duplication by name; check items off, clear checked.
- **Household** — recipes/plan/list are shared per household via [better-auth](https://www.better-auth.com)'s organization plugin; invite others by email.
- **Home-screen widgets** — a meal-plan widget and a shopping-list widget for both platforms, see [Home-screen widgets](#home-screen-widgets) below.
- **Share-to-import** — share a recipe link from Chrome (or any app) straight into CookBlueprint's import flow, see [Share-to-import](#share-to-import) below.

This app is the client for the backend in [`../nextjs`](../nextjs) — see that app's README for the API, auth, and database setup. It needs to be running (and reachable at `EXPO_PUBLIC_API_URL`) for anything beyond the login screen to work.

## Stack

- **Expo Router** (SDK 57) for file-based routing, including modal sheets (`transparentModal` presentation) for pick-recipe/invite/plan-options
- **[`@expo/ui`](https://docs.expo.dev/versions/latest/sdk/ui/)** for native SwiftUI/Jetpack Compose components where it matters (`MiseSwitch`, `MiseSpinner`), hand-rolled RN views everywhere else
- **better-auth** email/password auth via `@better-auth/expo`, with the organization plugin for household sharing — session cookies via `expo-secure-store` on native, browser cookies on web
- **React Query** for all API data (recipes, meal plan, shopping list) through a thin fetch wrapper (`src/lib/api-client.ts`)
- **React Compiler** enabled — see `.claude/skills/no-use-effect` for this repo's rule against writing raw `useEffect` in components; the few legitimate cases live in reusable hooks (`src/hooks/use-mount-effect.ts`, `use-auth-redirect.ts`, `use-hide-splash-when-ready.ts`)

## Getting started

```bash
cp .env.example .env   # then fill in EXPO_PUBLIC_API_URL / EXPO_PUBLIC_WEB_APP_URL

pnpm dev   # starts Metro, then open on a dev-client build (scan the QR, or press a/i for a running emulator/simulator)
```

**There's no web target anymore.** The widgets (`react-native-android-widget`), share-to-import (`expo-share-intent`), and the `@expo/ui` native components are real native modules now, so `expo start --web` / `pnpm web` can't bundle the app. Always run against a dev-client build — see "Running on an Android emulator" below (or a real device/iOS simulator).

Requires the `apps/nextjs` backend running locally (see its README) — this app has no offline/mock mode.

### Running on an Android emulator

`EXPO_PUBLIC_API_URL=http://localhost:3000` (the `.env.example` default) resolves to the *emulator's own* loopback, not your host machine, so API calls fail silently unless you forward the port:

```bash
adb reverse tcp:3000 tcp:3000   # after the emulator is running, before testing login/API calls
pnpm android                    # or: expo start --android
```

Also needs Postgres up and the Next.js backend running (`docker compose -f docker-compose.dev.yml up -d postgres` and `pnpm dev` from the repo root, or in `apps/nextjs`).

Without a real `RESEND_API_KEY` (see `apps/nextjs/README.md`), sign-up emails don't actually send, so the "check your email" verification gate blocks login. For local testing, verify the user manually instead of setting up email:

```bash
docker exec food-postgres-1 psql -U postgres -d nextjs-boilerplate \
  -c "UPDATE \"user\" SET \"emailVerified\" = true WHERE email = 'you@example.com';"
```

## Environment variables

See `.env.example`. Both point at the Next.js app by default:

- `EXPO_PUBLIC_API_URL` — where the app makes its API calls
- `EXPO_PUBLIC_WEB_APP_URL` — where password-reset links send the user. Reset always happens in a browser tab, even when requested from this app, to avoid native deep-link handling

## Scripts

| Script | Description |
| --- | --- |
| `pnpm dev` | Start the Expo dev server |
| `pnpm ios` / `pnpm android` | Start directly on one platform (dev-client build) |
| `pnpm web` | `expo start --web` — kept for reference, but doesn't actually work anymore; see note above |
| `pnpm build` | `expo export` |
| `pnpm lint` | `expo lint` |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm e2e:android` | Run Android end-to-end tests with Maestro |

## Android E2E tests

The local E2E suite uses [Maestro](https://docs.maestro.dev), which drives an already-installed build directly through the device's UI Automator — no Appium server needed. Flows live in `.maestro/` and are tagged `offline` or `server` (see each file's `tags:` header) so the two groups can run independently.

Screens and interactive elements used by these flows carry stable `testID`s (e.g. `recipes-screen`, `tab-plan`, `meal-cell-empty-{dayIndex}-{meal}`) rather than relying on translated text, so they don't break when the device locale changes.

### Offline flows (`pnpm e2e:android`)

Each one is self-contained: it clears app data and starts the local trial flow (`useTrialMode`, see `src/hooks/use-trial-mode.ts`), so none of them need the backend, a real account, or email verification.

| Flow | Covers |
| --- | --- |
| `trial-mode.yaml` | Smoke test: trial mode starts and lands on the Recipes screen |
| `tab-navigation.yaml` | Tab bar navigation across Recipes/Plan/List/Household |
| `add-recipe-manual.yaml` | Add Recipe sheet → manual entry form → recipe appears in the list |
| `plan-assign-recipe.yaml` | Add a recipe, then assign it to Monday's breakfast slot on the Plan tab |
| `shopping-list-add-item.yaml` | Add a shopping item, then check it off |

One-time setup:

```bash
# Install the Maestro CLI: https://docs.maestro.dev/getting-started/installing-maestro
# Start an Android emulator from Android Studio first.
pnpm install
pnpm e2e:android:build
```

For each test run, start Metro in one terminal, then run the suite in another:

```bash
pnpm dev -- --dev-client
pnpm e2e:android
```

### Server-backed flows (`pnpm e2e:android:server`)

These need the `apps/nextjs` backend running and reachable (see "Running on an Android emulator" above — Postgres up, `adb reverse tcp:3000 tcp:3000`, `pnpm dev` from `apps/nextjs`), plus a verified test account, since there's no working email sender in local dev to complete real sign-up verification otherwise.

One-time (and after a `docker compose down -v` / DB reset) — from `apps/nextjs`, with its dev server already running:

```bash
pnpm seed:e2e-user
```

This upserts `e2e@example.com` / `e2e-test-password-1234` (hardcoded into the flows below — keep both in sync, see `apps/nextjs/scripts/seed-e2e-user.ts`) through the real sign-up API, then flips `emailVerified` directly in the database — scripting the same manual step described above under "Running on an Android emulator".

| Flow | Covers |
| --- | --- |
| `login.yaml` | Login screen with the seeded account → real backend session → Recipes screen |
| `register-verification-gate.yaml` | Register screen → submit (fresh, timestamped email each run) → "check your email" screen. Can't go further — no working email sender locally |
| `household-invite.yaml` | Log in as the seeded user → Household tab → invite by email → pending invitation appears |
| `trial-to-account-reconciliation.yaml` | Add a recipe in trial mode, then log into the seeded account and confirm the recipe was pushed up (`reconcileTrialData`, see `src/lib/reconcile-trial-data.ts`) — deep-links to `/login` since trial mode currently has no in-app link to it (only "Create account") |

```bash
pnpm dev -- --dev-client
pnpm e2e:android:server
```

`e2e:android:build` installs a debug development build on the active emulator. Run it again after changing native dependencies or `app.json`; JavaScript-only changes only need Metro restarted.

## Project structure

```
src/
├── app/                  # Expo Router routes
│   ├── (tabs)/            # Recipes, Plan, List, Household
│   ├── recipe/[id].tsx
│   ├── pick-recipe.tsx, plan-options.tsx, invite.tsx, ...  # modal sheets
│   └── login.tsx, register.tsx, forgot-password.tsx
├── components/mise/      # Shared UI (Button, TextField, Sheet, Toast, ...)
├── hooks/                # React Query hooks: use-recipes, use-meal-plan, use-shopping-list
├── lib/                  # auth-client, api-client, date-utils, secure-storage
├── store/                # ToastProvider (the only app-wide context left; no more mock data store)
├── widgets/              # Home-screen widget code, see below
└── constants/theme.ts    # Colors, fonts, radii
targets/widgets/          # iOS WidgetKit extension (Swift), added via @bacons/apple-targets
index.ts                  # Entry point (wraps expo-router/entry) — registers the Android widget task handler
```

Not built yet: push notifications, native deep linking, and the recipe-import flow is mock data rather than a real scraper.

## Environments

`.env` (used by `pnpm dev`/`pnpm android`/`pnpm ios`) points at your local backend — see [Running on an Android emulator](#running-on-an-android-emulator) above. `eas.json`'s `preview` and `production` build profiles instead inject `EXPO_PUBLIC_API_URL`/`EXPO_PUBLIC_WEB_APP_URL` pointing at the deployed backend (`https://cookblueprint.com`, `apps/nextjs`) at build time via EAS Build's `env` field, so a build made with `eas build --profile production` talks to production rather than localhost. The `development` profile still points at the emulator loopback for a dev-client build made through EAS instead of `expo run:android` locally.

## Home-screen widgets

A meal-plan widget and a shopping-list widget, for both platforms. Both widgets fetch straight from the Next.js API on their own refresh schedule — they don't read the app's React Query cache — so they keep working even if the app hasn't been opened in a while, as long as the session hasn't expired.

Because widgets need real native extensions, this app is no longer pure managed Expo: `ios/` and `android/` are generated via `npx expo prebuild` (continuous native generation), and `targets/widgets/` (Swift) lives outside those folders so it survives a re-prebuild.

- **Android** — built with [`react-native-android-widget`](https://github.com/sAleksovski/react-native-android-widget). The widget JSX lives in `src/widgets/android/`; `registerWidgetTaskHandler` (wired up in `index.ts`) runs as a Headless JS task that reuses the app's own `src/lib/api-client.ts` and `src/lib/auth-client.ts` to fetch and authenticate, so there's no separate native networking code. Requires a dev-client build — it does not work in Expo Go.
- **iOS** — a real WidgetKit extension (SwiftUI) added via [`@bacons/apple-targets`](https://github.com/EvanBacon/expo-apple-targets), in `targets/widgets/`. Unlike Android, a WidgetKit extension runs in its own process with no access to `expo-secure-store`, so `src/hooks/use-sync-widget-auth.ts` mirrors the session cookie and API URL into a shared App Group (`group.com.cookblueprint.app`) whenever auth state changes; the Swift side (`SharedData.swift`) reads that and calls the API directly over `URLSession`. **Building for iOS needs a real Apple Team ID** — set `expo.ios.appleTeamId` in `app.json` (it's currently blank) — and, since this repo runs on Windows, an actual build has to happen via [EAS Build](https://docs.expo.dev/build/introduction/) or a macOS machine; `expo prebuild` itself runs fine on Windows (with `--no-install` for the iOS platform, since CocoaPods needs macOS), but nothing here has been built or run on a real iOS target.
- After any mutation that changes the meal plan or shopping list, `src/widgets/refresh-widgets.ts` nudges both platforms to redraw immediately (`requestWidgetUpdate` on Android, `ExtensionStorage.reloadWidget()` on iOS) instead of waiting for the OS's own refresh schedule (`updatePeriodMillis` on Android, WidgetKit's refresh budget on iOS).
- Widget text uses two bundled `PlusJakartaSans` weights copied into `assets/fonts/` — Android widgets render to a bitmap and can't load fonts through the app's normal `expo-font`/`useFonts` path, they need real font files on disk.

## Share-to-import

Sharing a recipe URL from Chrome (or any other app) to CookBlueprint sends it straight to the import screen (`/import?url=...&autostart=1`) — the same flow the in-app "how sharing works" tutorial (`app/share-sheet.tsx`) walks through, just with the real shared URL instead of a demo one.

Built with [`expo-share-intent`](https://github.com/achorein/expo-share-intent), which registers a `text/*` intent-filter on Android and a real Share Extension on iOS (auto-generated by the library — no hand-written Swift needed here, unlike the WidgetKit extension above):

- `<ShareIntentProvider>` wraps the whole app in `src/app/_layout.tsx` (has to be the outermost provider per the library's docs)
- `src/app/+native-intent.ts` is an Expo Router hook that stops the router from 404ing on the special deep link the native side uses to hand off an incoming share
- `src/hooks/use-share-intent-redirect.ts` (mounted via the no-op `<ShareIntentRedirect />` component so it can sit inside the provider) reacts once the share is actually parsed and pushes to `/import`
- iOS's Share Extension defaults to the same App Group as the WidgetKit extension (`group.com.cookblueprint.app`) — harmless duplication in the generated entitlements plist, not a conflict; see the `expo-share-intent` plugin config in `app.json` if you ever need to point it elsewhere

Same platform caveat as the widgets: this needs a dev-client build (no Expo Go), and the iOS Share Extension can't be built or tested from this Windows machine.
