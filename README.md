# School OS

**An AI-native operating system for schools** — built as a production-grade monorepo with Bun, Turborepo, Next.js, Expo, and NestJS.

School OS is not a generic ERP or dashboard. It is designed to understand school state, surface risk and policy gaps, orchestrate workflows, and assist staff with AI — while keeping humans in the loop for important decisions.

## What's in the box

| Surface | Stack | Role |
| --- | --- | --- |
| **Web** | Next.js 16, React 19, Tailwind 4 | Admin, marketing, auth, billing |
| **Mobile** | Expo SDK 57, Expo Router, NativeWind | Student/parent mobile experience |
| **API** | NestJS 11, Drizzle, Postgres/Neon | Production backend spine |
| **Docs** | Fumadocs + MDX | Project documentation site |
| **AI assist** | FastAPI (optional) | Proxied by Nest — never public-facing |
| **Rust demo** | Axum (optional) | Reference binary / experiments |

Shared packages (`@school-os/ui`, `@school-os/logger`, TypeScript configs), Docker Compose, Dev Container, Lefthook hooks, and CI/CD pipelines are included out of the box.

## Quick start

**Prerequisites:** [Bun](https://bun.sh) `1.3.13` · Git · optional Docker Compose `v2.20+` and Rust (for `apps/rust`)

```bash
git clone https://github.com/shabirkhan-dev/school-os.git
cd school-os
bun install
bun run prepare   # install git hooks (recommended)
bun run dev
```

| App | Dev URL |
| --- | --- |
| Web | http://localhost:3000 |
| Nest API | http://localhost:4000 — `/api/v1/health`, `/api/docs` |
| Docs | http://localhost:3002/docs |

Run a single app:

```bash
bun --cwd apps/web run dev
bun --cwd apps/nest-api run dev
bun --cwd apps/mobile run dev
bun --cwd apps/docs run dev
```

Before pushing changes:

```bash
bun run lint && bun run format && bun run typecheck
```

## Architecture

```text
┌─────────────┐   ┌─────────────┐
│  apps/web   │   │ apps/mobile │
│  (Next.js)  │   │   (Expo)    │
└──────┬──────┘   └──────┬──────┘
       │                 │
       └────────┬────────┘
                ▼
       ┌─────────────────┐
       │  apps/nest-api  │◄── optional ── apps/ai-api (FastAPI)
       │    (NestJS)     │
       └────────┬────────┘
                ▼
       ┌─────────────────┐
       │ Postgres / Neon │
       └─────────────────┘

packages/ui · packages/logger · packages/typescript-config
```

Import boundaries and naming rules are enforced via `bun run architecture:check`.

## Monorepo layout

```text
school-os/
├── apps/
│   ├── web/          Next.js admin + marketing + auth
│   ├── mobile/       Expo Router mobile app
│   ├── nest-api/     NestJS production API
│   ├── docs/         Fumadocs documentation site
│   ├── ai-api/       Optional FastAPI AI assist
│   └── rust/         Optional Rust/Axum demo
├── packages/
│   ├── ui/           Shared shadcn-style components + tokens
│   ├── logger/       Structured logger (TS + Rust)
│   └── typescript-config/
├── docker/           Compose fragments (Postgres, Nest, web)
├── scripts/          Bash + Python utilities
├── .github/workflows CI, CD, security
└── .devcontainer/    Reproducible dev environment
```

## Commands

| Command | Purpose |
| --- | --- |
| `bun run dev` | Start dev servers (Turbo; excludes Rust by default) |
| `bun run dev:all` | Start all apps including Rust |
| `bun run dev:ai` | Start FastAPI AI assist only |
| `bun run build` | Build all apps |
| `bun run lint` / `lint:fix` | Biome + ShellCheck + Ruff |
| `bun run format` | Format TS/JS, shell, Python, Rust |
| `bun run typecheck` | TypeScript across workspaces |
| `bun run test` / `test:coverage` | Unit tests + coverage gates |
| `bun run test:e2e:web` | Playwright e2e for web |
| `bun run architecture:check` | Import boundary enforcement |
| `bun run preflight` | Lint + typecheck + test (CI parity) |

## Tooling

- **Bun** workspaces + **Turborepo** orchestration
- **Biome** for TS/JS lint and format (tabs, line width 100)
- **Lefthook** pre-commit and commit-msg hooks (Conventional Commits, lowercase)
- Bash: ShellCheck + shfmt · Python: Ruff · Rust: rustfmt + clippy

## Docker

```bash
cp env.docker.example .env
docker compose up -d --build
```

| Service | Port |
| --- | --- |
| Web | `:3000` |
| Nest API | `:4000` |
| Postgres (host) | `:5433` |

Optional profiles: `docker compose --profile rust up -d --build` · `--profile ai` for FastAPI.

See [docker/README.md](docker/README.md) and `/docs/docker`.

## Deploy

| Piece | Host |
| --- | --- |
| Web + docs | [Vercel](https://vercel.com) (`apps/*/vercel.json`) |
| Nest API | [Render](https://render.com) (`render.yaml`) |
| Database | [Neon](https://neon.tech) (`DATABASE_URL`) |

Guide: `/docs/deploy` ([apps/docs/content/docs/deploy.mdx](apps/docs/content/docs/deploy.mdx)).

## Dev Container

Reopen in Container for Bun, Rust, Python/Ruff, and Bash lint tools pre-installed.

```text
Reopen in Container → bun run prepare → bun run dev
```

See [.devcontainer/README.md](.devcontainer/README.md).

## Documentation

```bash
bun --cwd apps/docs run dev
```

Key routes (http://localhost:3002/docs/…):

- [quick-start](http://localhost:3002/docs/quick-start) — setup and first run
- [production-roadmap](http://localhost:3002/docs/production-roadmap) — phased build plan
- [architecture](http://localhost:3002/docs/architecture) — boundaries and conventions
- [docker](http://localhost:3002/docs/docker) — Compose setup
- [deploy](http://localhost:3002/docs/deploy) — production deployment
- [product-system-design](http://localhost:3002/docs/product-system-design) — security and product model

Also see [PROJECT.md](PROJECT.md), [DESIGN.md](DESIGN.md), [AGENTS.md](AGENTS.md), [CHANGELOG.md](CHANGELOG.md).

## Contributing

1. Fork and clone the repo.
2. `bun install && bun run prepare`
3. Create a branch and make changes.
4. Run `bun run preflight` before opening a PR.
5. Use [Conventional Commits](https://www.conventionalcommits.org/) — lowercase subjects, e.g. `feat(auth): add password reset flow`.

## License

Dual-licensed under **MIT** or **Apache-2.0**:
[LICENSE-MIT](LICENSE-MIT), [LICENSE-Apache-2.0](LICENSE-Apache-2.0).
