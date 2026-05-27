# NM Forms

NM Forms is a full-stack form builder for creating cinematic, shareable forms with public or unlisted visibility, dashboard analytics, response exports, guest demo access, password protection, and QR-code sharing.

## Tech Stack

- Web: Next.js, React, Tailwind CSS, shadcn/Radix UI, TanStack Query, tRPC client
- API: Express, tRPC, `trpc-to-openapi`
- API docs: Scalar at `/docs`
- Database: PostgreSQL with Drizzle ORM
- Tooling: pnpm workspaces, Turborepo, TypeScript, ESLint, Prettier

## Workspace Layout

- `apps/web`: Next.js user interface
- `apps/api`: Express API server, OpenAPI generation, Scalar docs
- `packages/trpc`: tRPC routers, context, OpenAPI metadata
- `packages/services`: business logic for users, forms, fields, links, and responses
- `packages/database`: Drizzle schema and migrations
- `packages/logger`: shared logger

## Local Setup

1. Install dependencies.

```sh
pnpm install
```

2. Configure environment variables in `.env`.

```sh
DATABASE_URL=postgres://...
JWT_SERECT=replace-with-a-strong-secret
BASE_URL=http://localhost:8000
PORT=8000
NODE_ENV=dev

# Optional production-grade shared rate limiter.
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

3. Start PostgreSQL if using Docker.

```sh
docker compose up -d
```

4. Run migrations.

```sh
pnpm db:migrate
```

5. Start the app.

```sh
pnpm dev
```

Default local URLs:

- Web app: `http://localhost:3001`
- API health: `http://localhost:8000/health`
- Scalar API docs: `http://localhost:8000/docs`
- OpenAPI JSON: `http://localhost:8000/openapi.json`

## Core Features

- Form builder with drag-and-drop question ordering
- Public forms listed in Explore
- Unlisted forms with share links
- Publish and unpublish controls
- Optional form password protection
- Shareable QR codes for form links
- Dashboard analytics and CSV response export
- User profile page
- Guest judge login with seeded demo form data
- Mobile navigation drawer
- Shared-store-ready rate limiting for auth, form creation, and response submission

## Guest Demo

Use **Continue as guest judge** on the login page. The backend creates or reuses a guest account and seeds a published demo form with fields and sample responses so judges can review the dashboard without manual setup.

## API Documentation

The API server generates OpenAPI documentation from tRPC router metadata and serves it through Scalar:

```txt
http://localhost:8000/docs
```

When adding a new route, include `meta.openapi` on the tRPC procedure so it appears in Scalar automatically.

## Security And Abuse Controls

- User passwords are salted with Node's memory-hard `scrypt` password hashing before storage.
- Legacy password hashes are upgraded to `scrypt` after a successful login.
- New accounts must pass email verification before they can sign in.
- Password reset requests use one-time hashed tokens with short expiration windows.
- Form passwords are salted and hashed separately from user passwords.
- Protected forms require the form password before fields or submissions are available.
- Rate limiting uses Upstash Redis when `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are configured, with local in-memory fallback for development.
- Auth attempts, form creation, and response submission are rate-limited by user, email, form, and client IP where appropriate.
- Soft-deleted forms are excluded from user lists and public access.

## Developer Practices

- Keep business rules in `packages/services`.
- Keep transport validation and OpenAPI metadata in `packages/trpc`.
- Keep reusable UI in `apps/web/components`.
- Prefer typed schemas over ad hoc request parsing.
- Run type checks before merging significant changes.

```sh
pnpm check-types
pnpm lint
```
