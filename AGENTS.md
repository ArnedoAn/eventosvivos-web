# AGENTS.md

## Package manager

- **pnpm only.** `pnpm install`, `pnpm test`, etc. The project enforces this.

## Tech stack

- Angular 22 · TypeScript · SCSS · RxJS · Vitest · pnpm
- **Standalone components only** (no NgModules). Bootstrap via `bootstrapApplication`.
- **Signals** for component state; RxJS only at the HTTP boundary (`HttpClient` → `toSignal`).

## Commands

| Action       | Command                                |
| ------------ | -------------------------------------- |
| Install      | `pnpm install`                         |
| Dev server   | `pnpm start` → `http://localhost:4200` |
| Build        | `pnpm build`                           |
| Test (all)   | `pnpm test`                            |
| Format check | `npx prettier --check .`               |
| Format write | `npx prettier --write .`               |

## File conventions

- **Component naming:** no `.component.` suffix. Files are `name.ts`, `name.html`, `name.scss`, `name.spec.ts`.
- **Styles:** SCSS everywhere (configured in `angular.json` schematics).
- **Selector prefix:** `app-` (e.g. `<app-root>`).

## Architecture

- `src/app/app.config.ts` — providers (router, http, interceptors)
- `src/app/app.routes.ts` — route definitions
- Feature-folder structure under `src/app/features/` (not yet scaffolded)
- `src/app/core/` — models, API services, auth store, interceptors, notifications
- `src/app/shared/` — reusable UI components, validators

## Key files

- `PLAN.md` — **authoritative implementation plan** with 10 tasks. Read this before starting work.
- `.prettierrc` — printWidth 100, singleQuote: true, angular parser for HTML
- `tsconfig.spec.json` — tests use `vitest/globals` types

## Testing

- Test runner is **Vitest** (not Karma), configured via Angular CLI's `@angular/build:unit-test`.
- Test files: `*.spec.ts` alongside source files.
- `HttpTestingController` is available for mocking HTTP in service tests.

## Environments

- Environment files (`src/environments/environment.ts`, `environment.development.ts`) do **not exist yet** — they must be created per PLAN.md Task 1.
- Expected structure: `{ apiBaseUrl: 'http://localhost:8080/api' }`.

## Gotchas

- No CI/CD workflows configured yet (no `.github/` directory).
- No linting or typecheck commands configured — only build and test.
- `pnpm-lock.yaml` exists; use `pnpm install --frozen-lockfile` in CI.
