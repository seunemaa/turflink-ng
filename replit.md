# seun.emaa Pitch Pro

A premium Nigerian football pitch booking web app with Midnight Forest Green (#052c1e) & Electric Lime (#bfff00) design.

## Run & Operate

- `pnpm --filter @workspace/pitch-pro run dev` — run the frontend (auto-managed by workflow)
- `pnpm --filter @workspace/api-server run dev` — run the API server (auto-managed by workflow)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — session secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + shadcn/ui + Framer Motion
- API: Express 5 with Replit Auth (OpenID Connect PKCE)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (zod/v4), drizzle-zod
- API codegen: Orval (from OpenAPI spec)
- Auth: Replit Auth via `@workspace/replit-auth-web`

## Where things live

- `lib/api-spec/openapi.yaml` — single source of truth for all API contracts
- `lib/db/src/schema/` — Drizzle schema (pitches, bookings, memberships, auth)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/pitch-pro/src/pages/` — React pages
- `artifacts/pitch-pro/src/index.css` — Tailwind theme (Midnight Forest Green + Electric Lime)
- `lib/replit-auth-web/` — browser auth hook (`useAuth`)

## Architecture decisions

- Availability check uses path param `/pitches/{id}/availability/{date}` instead of query param to avoid Orval `*Params` type collision
- `AuthUser` type defined locally in `artifacts/api-server/src/lib/types.ts` (not from api-zod)
- Auth Zod schemas for mobile routes defined inline in `routes/auth.ts` (not in OpenAPI spec)
- Prices stored as `real` (float) in PostgreSQL — always cast to `Number()` before arithmetic

## Product

- 4 Nigerian pitches: Lagos Legacy Pitch, Abuja National Turf, Port Harcourt Arena, Enugu Coal City Field
- Time slots: 08:00–23:00 (1-hour increments)
- Match types: Friendly Match / Competitive League
- Add-ons: Professional Referee (+₦5,000), Team Bibs (+₦2,000), Cold Water Crate (+₦3,000)
- seun.emaa Pro membership: 10% off all bookings
- Weather widget: Lagos/Abuja current conditions
- Replit Auth: sign in to track bookings
- Confirmation page: reference number, invoice, Add to Google Calendar

## User preferences

- Brand: seun.emaa, Nigeria-localized (₦ Naira)
- Admin/developer footer name: seun.emaa
- Colors: #052c1e (background), #bfff00 (accent)

## Gotchas

- Run codegen after any OpenAPI spec change: `pnpm --filter @workspace/api-spec run codegen`
- Avoid operationId prefixes that generate `*Params` names already used for path params (Orval collision)
- `pnpm --filter @workspace/db run push` after schema changes
