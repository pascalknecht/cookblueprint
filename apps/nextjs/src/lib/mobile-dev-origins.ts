// The Expo web dev server used to exercise the mobile app's auth/API flows
// from a browser during development. Real native builds don't need an entry
// here — they're not subject to CORS.
//
// Deliberately dependency-free: this is imported by `src/middleware.ts`,
// which runs on the Edge runtime and can't load `src/lib/auth.ts`'s
// Prisma/`pg` driver.
export const mobileWebDevOrigins = ["http://localhost:8081", "http://localhost:8099"];
