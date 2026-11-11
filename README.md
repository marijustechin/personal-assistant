# Personal Assistant

Minimal empty starter application. No authentication, WhatsApp, AI, or financial features are included.

- **API:** NestJS 12 with Fastify, TypeScript, native ESM (`apps/api`)
- **Database:** PostgreSQL in Docker Compose, Prisma 7 with the PostgreSQL driver adapter
- **Web:** Next.js 16 App Router with TypeScript (`apps/web`)
- **Workspace:** pnpm workspaces

## Requirements

- Node.js 22 or newer
- pnpm 12 (`corepack enable`, then `corepack prepare pnpm@12.16.1 --activate`, or `npm install --global pnpm@12`)
- Docker with Docker Compose

## First-time setup

Run from the repository root:

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
docker compose up -d postgres
```

Prisma Client is generated automatically by the API's `postinstall` script.

Wait until PostgreSQL accepts connections:

```bash
docker compose exec postgres pg_isready -U app -d personal_assistant
```

## Start both applications

```bash
pnpm dev
```

- Web: <http://localhost:4200>
- API health: <http://localhost:4100/health>

The health endpoint returns HTTP 200 with:

```json
{ "status": "ok" }
```

The web page displays the application name and the live backend health response.

## Verify the setup

```bash
pnpm verify:init
```

This command validates the Prisma schema, regenerates Prisma Client, and builds both the API and the web application.

## Commands

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the API and web app together in watch mode |
| `pnpm build` | Build the API and web app |
| `pnpm verify:init` | Validate the Prisma schema, generate Prisma Client, and build both apps |
| `pnpm db:up` | Start the PostgreSQL container |
| `pnpm db:down` | Stop and remove the PostgreSQL container |

## Structure

```text
.
├── apps
│   ├── api
│   │   ├── prisma/schema.prisma    # Empty schema: generator + datasource only
│   │   ├── prisma.config.ts        # Prisma 7 config (ESM)
│   │   └── src
│   │       ├── health              # GET /health
│   │       ├── prisma              # PrismaClient + PostgreSQL adapter
│   │       └── main.ts             # NestJS/Fastify bootstrap
│   └── web
│       ├── next.config.mjs         # ESM Next.js config
│       └── src/app                 # App Router page
├── compose.yaml                    # Local PostgreSQL
└── pnpm-workspace.yaml
```

## Environment variables

| File | Variable | Value |
| --- | --- | --- |
| `apps/api/.env` | `DATABASE_URL` | `postgresql://app:app@localhost:5434/personal_assistant?schema=public` |
| `apps/api/.env` | `PORT` | `4100` |
| `apps/web/.env.local` | `API_URL` | `http://localhost:4100` |

Only the `.env.example` files are committed. All real `.env` files are ignored by Git, and the credentials in `compose.yaml` are for local development only.

Ports: API `4100`, web `4200`, PostgreSQL `5434` on the host (mapped to `5432` in the container). The non-default host port avoids conflicts with an existing local PostgreSQL installation; change both the Compose port mapping and `DATABASE_URL` if needed.

## ESM and Prisma notes

- Both workspace packages use `"type": "module"`.
- The API compiles with `module`/`moduleResolution` set to `NodeNext`; relative imports use explicit `.js` extensions.
- Prisma uses the `prisma-client` generator with `moduleFormat = "esm"`. The generated client goes to `apps/api/src/generated/prisma` and is gitignored. Regenerate it with `pnpm --filter @personal-assistant/api prisma:generate`.
- Prisma configuration lives in `apps/api/prisma.config.ts` and uses the PostgreSQL driver adapter (`@prisma/adapter-pg`) at runtime.
- The Prisma schema intentionally has no models. Add models and run `pnpm --filter @personal-assistant/api exec prisma migrate dev --name <migration-name>` when business models are introduced.

## Production start

```bash
pnpm build
pnpm --filter @personal-assistant/api start
pnpm --filter @personal-assistant/web start
```

Run the two `start` commands in separate terminals.
