# Mise

A recipe, meal-planning, and shared shopping list app for a household, built with [Expo Router](https://docs.expo.dev/router/introduction/).

- **Recipes** — save your own, or "import" from a link (the import flow uses fixed mock data for now — there's no real scraping yet).
- **Meal plan** — a real Monday–Sunday week (`date-utils.ts`), assign recipes to breakfast/lunch/dinner slots, or auto-generate the week.
- **Shopping list** — add ingredients from a single recipe or the whole week's plan, with de-duplication by name; check items off, clear checked.
- **Household** — recipes/plan/list are shared per household via [better-auth](https://www.better-auth.com)'s organization plugin; invite others by email.

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

pnpm dev            # starts Metro; press w for web, or scan the QR code
pnpm dev -- --web   # go straight to web
```

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
| `pnpm web` / `pnpm ios` / `pnpm android` | Start directly on one platform |
| `pnpm build` | `expo export` |
| `pnpm lint` | `expo lint` |
| `pnpm typecheck` | `tsc --noEmit` |

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
└── constants/theme.ts    # Colors, fonts, radii
```

Not built yet: EAS Build/Submit config (no `eas.json`), push notifications, native deep linking, and the recipe-import flow is mock data rather than a real scraper.
