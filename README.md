# CookBlueprint

A pnpm/Turborepo monorepo with two apps:

- **`apps/mobile`** — **CookBlueprint**, an Expo (React Native) recipe, meal-planning, and shared shopping list app. This is the actual product — see [`apps/mobile/README.md`](apps/mobile/README.md) for details.
- **`apps/nextjs`** — the marketing site and backend CookBlueprint talks to: a Better Auth API (email/password with verification + reset) and a REST API for recipes/meal-plans/shopping-items scoped per household. There's no web dashboard or web login — the website is marketing pages plus the API the mobile app calls.

## Screenshots

<p align="center">
  <img src="apps/nextjs/public/screenshots/en/recipes.webp" width="200" alt="Recipes list" />
  <img src="apps/nextjs/public/screenshots/en/plan.webp" width="200" alt="Weekly meal plan" />
  <img src="apps/nextjs/public/screenshots/en/shopping.webp" width="200" alt="Shared shopping list" />
  <img src="apps/nextjs/public/screenshots/en/recipe-detail.webp" width="200" alt="Recipe details" />
</p>

## Tech Stack (`apps/nextjs`)

| Category        | Technology                                                                  |
| --------------- | --------------------------------------------------------------------------- |
| Framework       | [Next.js 16](https://nextjs.org/) with [React 19](https://react.dev/)       |
| Language        | [TypeScript](https://www.typescriptlang.org/)                               |
| Build System    | [Turborepo](https://turbo.build/repo)                                       |
| Package Manager | [pnpm](https://pnpm.io/)                                                    |
| Database ORM    | [Prisma 7](https://www.prisma.io/) with PostgreSQL                          |
| Authentication  | [Better Auth](https://www.better-auth.com/) (email/password, organizations) |
| Purchases       | [RevenueCat](https://www.revenuecat.com/) (in-app purchases, entitlements) |
| UI Components   | [shadcn/ui](https://ui.shadcn.com/) + [Radix](https://www.radix-ui.com/)    |
| Styling         | [Tailwind CSS v4](https://tailwindcss.com/)                                 |
| Testing         | [Vitest](https://vitest.dev/) + Testing Library                             |
| Linting         | [ESLint 9](https://eslint.org/) (flat config)                               |
| Formatting      | [Prettier](https://prettier.io/) with Tailwind plugin                       |
| Env Validation  | [@t3-oss/env-nextjs](https://env.t3.gg/) with Zod                           |

## Project Structure

```
├── apps/
│   ├── mobile/             # CookBlueprint — Expo Router app (the actual product)
│   │   ├── .env.example    # Env template (copy to .env in this folder)
│   │   └── src/
│   │       ├── app/        # Expo Router routes (screens + modal sheets)
│   │       ├── components/mise/  # Shared UI, incl. @expo/ui native wrappers
│   │       ├── hooks/       # React Query hooks (recipes, meal plan, shopping list)
│   │       ├── lib/         # auth-client, API client, date utils
│   │       └── store/       # Toast context
│   └── nextjs/             # Next.js 16 application (backend for CookBlueprint)
│       ├── .env.example    # Env template (copy to .env in this folder)
│       ├── prisma/         # Database schema
│       └── src/
│           ├── app/       # App Router (pages, layouts, API routes)
│           │   ├── (marketing)/   # Landing page, password reset landing page
│           │   ├── (legal)/       # Privacy policy, terms of service
│           │   └── api/           # Auth, recipes/meal-plans/shopping-items
│           ├── components/        # UI components (shadcn/ui)
│           ├── hooks/             # Custom React hooks
│           ├── lib/               # Auth, email, database, utilities
│           └── use-cases/         # Business logic layer
├── docker/                # Docker configuration files
│   └── pgadmin/           # pgAdmin server pre-configuration
├── Dockerfile             # Multi-stage production build (+ dev stage for compose)
├── docker-compose.dev.yml # Postgres + pgAdmin + Next.js (dev, hot reload)
├── turbo.json             # Turborepo pipeline config
├── pnpm-workspace.yaml    # Workspace definition
└── .env.example           # Pointer to apps/nextjs/.env.example
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 20.19.0
- [pnpm](https://pnpm.io/) 10.6+
- A PostgreSQL database

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

All variables for the Next.js app live in **`apps/nextjs/.env`** (not the repo root). The template is committed as `apps/nextjs/.env.example`; the root `.env.example` only points there.

```bash
cp apps/nextjs/.env.example apps/nextjs/.env
```

If you still have a legacy **repo-root** `.env`, move its contents to `apps/nextjs/.env` so there is a single app env file.

**How values are loaded**

- **Next.js** (`next dev`, `next build`, `next start`) loads `.env`, `.env.local`, etc. from `apps/nextjs/` automatically. App scripts do not use a `with-env` wrapper.
- **Prisma CLI** (`pnpm db:generate`, `pnpm db:push`) loads `apps/nextjs/.env` via `apps/nextjs/prisma.config.ts`.
- **Validation** at runtime uses `@t3-oss/env-nextjs` in `apps/nextjs/src/env.ts` (see [Environment validation](#environment-validation)).

Edit `apps/nextjs/.env` with your values. Required for local development:

| Variable              | Description                                            |
| --------------------- | ------------------------------------------------------ |
| `DATABASE_URL`        | PostgreSQL connection string                           |
| `BETTER_AUTH_SECRET`  | Secret for session signing (`openssl rand -base64 32`) |
| `BETTER_AUTH_URL`     | Base URL of your app (e.g., `http://localhost:3000`)   |
| `NEXT_PUBLIC_APP_URL` | Public-facing app URL (usually same host as above)    |
| `RESEND_API_KEY`      | Sends verification/password-reset emails — get a key at [resend.com](https://resend.com); the sandbox sender works for local dev with no domain setup |

Optional variables for additional features:

| Variable                    | Description                   |
| ---------------------------- | ----------------------------- |
| `GOOGLE_CLIENT_ID`           | Google OAuth client ID        |
| `GOOGLE_CLIENT_SECRET`       | Google OAuth client secret    |
| `REVENUECAT_SECRET_API_KEY`  | RevenueCat secret key for server-side entitlement checks |
| `EMAIL_FROM`                 | Sender for auth emails (defaults to `CookBlueprint <onboarding@resend.dev>` if unset) |

### 3. Set up the database

```bash
pnpm db:generate    # Generate Prisma client
pnpm db:push        # Push schema to database
```

### 4. Start development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

Run these from the monorepo root:

| Command             | Description                            |
| ------------------- | -------------------------------------- |
| `pnpm dev`          | Start all apps in dev mode (Turbopack) |
| `pnpm build`        | Build all apps for production          |
| `pnpm lint`         | Lint all apps with ESLint              |
| `pnpm typecheck`    | Run TypeScript type checking           |
| `pnpm test`         | Run tests with Vitest                  |
| `pnpm format`       | Format codebase with Prettier          |
| `pnpm format:check` | Check formatting (CI-friendly)         |
| `pnpm db:generate`  | Generate Prisma client                 |
| `pnpm db:push`      | Push Prisma schema to database         |

## Authentication

The Better Auth backend (email/password, with **email verification required to sign in** and a password-reset flow) lives entirely behind the API — there's no web login or registration UI. The mobile app talks to it directly via `@better-auth/expo`. Verification and password-reset emails are sent via Resend (`src/lib/email.ts`) — see `RESEND_API_KEY` above.

Password reset is the one auth flow with a web page: Better Auth emails a reset link that opens `/reset-password` in a browser (`apps/nextjs/src/app/(marketing)/reset-password`), where the user sets a new password before returning to the app. Email verification doesn't need a web landing page — Better Auth's own API endpoint handles the token and the user is verified without leaving the app.

The **Organization** plugin backs household sharing — every new user gets a default organization automatically (`databaseHooks.user.create.after` in `src/lib/auth.ts`), and new sessions default to it (`databaseHooks.session.create.before`). There's no client-side "create organization" step.

There's no web dashboard and no protected web routes — the authenticated product experience is entirely the mobile app; this Next.js app is the marketing site, the password-reset landing page, and the API backend.

## Purchases (RevenueCat)

CookBlueprint Pro is an in-app purchase sold through the Apple App Store and Google Play, managed client-side by the RevenueCat SDK in `apps/mobile`. This Next.js app only does a server-side entitlement check (`src/lib/entitlement.ts`) against the RevenueCat REST API using `REVENUECAT_SECRET_API_KEY` — there's no web billing, checkout, or customer portal.

## Mobile app (CookBlueprint)

`apps/mobile` is an Expo Router app that talks to this Next.js app's REST API (`/api/recipes`, `/api/meal-plans`, `/api/shopping-items`) and shares the same Better Auth backend (via `@better-auth/expo`). Recipes, meal plans, and the shopping list are all scoped to the signed-in user's organization/household. Data fetching goes through React Query, calling a thin `fetch` wrapper (`src/lib/api-client.ts`) that attaches the session cookie manually on native and relies on the browser's cookie jar on web.

Run it from the root with `pnpm --filter @repo/mobile dev` (or `cd apps/mobile && pnpm dev`), then open it on a dev-client build (press `a`/`i` for a running emulator/simulator, or scan the QR code). There's no web target or Expo Go support — native modules (home-screen widgets, share-to-import, `@expo/ui`) require a real dev-client build. It needs this Next.js app running and reachable — set `EXPO_PUBLIC_API_URL` in `apps/mobile/.env` accordingly. See [`apps/mobile/README.md`](apps/mobile/README.md) for the full rundown.

## Adding Shared Packages

To add shared code (e.g., a design system or shared config), create a `packages/` directory and uncomment the entry in `pnpm-workspace.yaml`:

```yaml
packages:
  - apps/*
  - packages/*
```

## Environment validation

[`@t3-oss/env-nextjs`](https://env.t3.gg/) validates the same variables you define in **`apps/nextjs/.env`**. Schemas and `runtimeEnv` wiring live in `apps/nextjs/src/env.ts`.

Better Auth uses `baseURL` from validated `env` in `apps/nextjs/src/lib/auth.ts` and `auth-client.ts`, so `BETTER_AUTH_URL` / `NEXT_PUBLIC_APP_URL` stay aligned with the file.

To skip validation (e.g., during production Docker builds), set `SKIP_ENV_VALIDATION=1` in the build environment.

## Docker

Docker Compose runs **PostgreSQL**, **pgAdmin**, and **Next.js** (dev server, hot reload). Copy `apps/nextjs/.env.example` to `apps/nextjs/.env` first — the `nextjs` service loads it via `env_file` (only `DATABASE_URL` is overridden, to point at the `postgres` service instead of `localhost`).

```bash
docker compose -f docker-compose.dev.yml up
```

Or:

```bash
pnpm docker:dev
```

The `nextjs` service installs dependencies on container start (source and `node_modules` are bind-mounted, so edits on the host hot-reload). First start is slower while it installs; later starts are fast. If you'd rather run Next.js on the host instead, run `docker compose -f docker-compose.dev.yml up postgres pgadmin` and `pnpm dev` separately.

Recreate containers after compose or dependency changes:

```bash
docker compose -f docker-compose.dev.yml down --remove-orphans
docker compose -f docker-compose.dev.yml up --force-recreate
```

| Service    | Default host port       | Description             |
| ---------- | ------------------------ | ----------------------- |
| `postgres` | `localhost:5432`         | PostgreSQL 17 database  |
| `pgadmin`  | http://localhost:5050    | pgAdmin database UI     |
| `nextjs`   | http://localhost:3000    | Next.js app (dev)       |

Default host ports are stable. Override them with env vars if needed (`POSTGRES_PORT`, `PGADMIN_PORT`, `NEXTJS_PORT`).

**Postgres credentials:** `postgres` / `postgres` (database: `nextjs-boilerplate`)

Point **`DATABASE_URL`** in `apps/nextjs/.env` at the mapped host port, for example:

`postgresql://postgres:postgres@localhost:5432/nextjs-boilerplate`

(Use the same port as `POSTGRES_PORT` if you override it.)

### Push the database schema

After starting Postgres for the first time, push the Prisma schema:

```bash
pnpm db:generate
pnpm db:push
```

Host port overrides (optional env vars when you run Compose):

- `POSTGRES_PORT` (default: `5432`, mapped to container `5432`)
- `PGADMIN_PORT` (default: `5050`, mapped to container `80`)

## Deployment

This project is optimized for [Vercel](https://vercel.com/) deployment. The `turbo.json` configuration includes Vercel-aware environment variables. When importing the repo, set the project's **Root Directory** to `apps/nextjs` — Vercel detects the pnpm workspace and Next.js from there.

Configure the same keys as in **`apps/nextjs/.env.example`** on your host (Vercel project settings, Fly secrets, etc.). There is no repo-root `.env` for the app. Use a fresh `BETTER_AUTH_SECRET` for production, not the local dev one, and run `prisma migrate deploy` (not `db:push`) against the production database.

The generated Prisma client isn't committed to git (see `apps/nextjs/.gitignore`); `apps/nextjs/package.json` has a `postinstall: prisma generate` script so it's regenerated automatically on every install, including Vercel's.

For other platforms, run:

```bash
pnpm build
pnpm start
```
