# EventosVivos Web — Implementation Plan

> **For agentic workers:** Implement task-by-task. Angular 22, standalone components, signals, typed reactive forms. Each task ends with a passing unit test (Vitest/Karma per CLI default) and a commit. Steps use checkbox (`- [ ]`) syntax.

**Goal:** A functional Angular SPA that consumes the EventosVivos API: authenticate, list/filter events, create events (admin), reserve tickets, confirm/cancel reservations (admin), and view occupancy reports — with clean error handling and loading states.

**Architecture:** Standalone components (no NgModules), signal-based state, feature-folder structure, a typed `ApiClient` per resource, an HTTP interceptor for JWT + error normalization, route guards for role-based access. Forms use typed Reactive Forms with client-side validation mirroring server rules.

**Tech Stack:** Angular 22 · TypeScript · SCSS · RxJS · Angular Router · pnpm · standalone APIs · signals. HTTP via `HttpClient` + `provideHttpClient(withInterceptors(...))`.

---

## Global Constraints

- **Package manager:** `pnpm` only. All install/run commands use `pnpm`.
- **Standalone everywhere:** no `NgModule`. Bootstrap via `bootstrapApplication` + `app.config.ts` providers.
- **Signals for component state**; RxJS only at the HTTP boundary (`HttpClient` observables), converted to signals via `toSignal` where it simplifies templates.
- **API base URL** from `src/environments/environment.ts` (`apiBaseUrl`), default `http://localhost:8080/api`.
- **All API DTOs are typed** in `src/app/core/models/` — no `any`.
- **Enums mirror backend exactly:** `EventType = 'Conferencia'|'Taller'|'Concierto'`, `EventStatus = 'Activo'|'Cancelado'|'Completado'`, `ReservationStatus = 'PendientePago'|'Confirmada'|'Cancelada'`, `Role = 'Admin'|'User'`.
- **Money/dates:** send ISO-8601 UTC strings; display in local time.
- **Error contract:** backend returns `ProblemDetails` with an error `code`; the interceptor surfaces a human message via a toast/notification service.

---

## Requirement → Task Map

| Capability | Task |
|-----------|------|
| Project config, env, routing shell | 1 |
| Models + ApiClient services | 2 |
| Auth (login, token store, interceptor, guard) | 3 |
| Event list + filters (RF-02) | 4 |
| Create event form (RF-01, admin) | 5 |
| Reserve modal (RF-03) | 6 |
| Admin confirm/cancel (RF-04/05) | 7 |
| Occupancy report view (RF-06) | 8 |
| Error/loading UX + notifications | 9 |
| Dockerfile (nginx) + README | 10 |

---

## File Structure

```
src/
  environments/environment.ts  environment.development.ts   apiBaseUrl
  app/
    app.config.ts            providers: router, http + interceptors
    app.routes.ts            routes + role guards
    app.component.ts/html    shell: nav, router-outlet, notifications host
    core/
      models/event.model.ts  reservation.model.ts  auth.model.ts  occupancy.model.ts  enums.ts
      api/events-api.service.ts  reservations-api.service.ts  auth-api.service.ts  reports-api.service.ts
      auth/auth.store.ts      signal store: token, role, isAuthenticated
      auth/auth.guard.ts      CanActivateFn + role check
      http/auth.interceptor.ts    attaches Bearer
      http/error.interceptor.ts   maps ProblemDetails -> notification
      notifications/notification.service.ts   signal-based toast queue
    features/
      auth/login.component.ts
      events/event-list.component.ts        + filter form
      events/event-create.component.ts      admin only
      events/event-card.component.ts
      reservations/reserve-dialog.component.ts
      reservations/reservation-admin.component.ts   confirm/cancel
      reports/occupancy.component.ts
    shared/
      ui/spinner.component.ts  error-banner.component.ts
      validators/  form validators mirroring server rules
```

---

## Task 1: Config, environments, routing shell

**Files:** `src/environments/environment.ts`, `environment.development.ts`, `app/app.config.ts`, `app/app.routes.ts`, `app/app.component.*`.

- [ ] **Step 1:** Add `apiBaseUrl` to both environment files (`http://localhost:8080/api`).
- [ ] **Step 2:** `app.config.ts` → `provideRouter(routes)`, `provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]))` (interceptors stubbed for now).
- [ ] **Step 3:** `app.routes.ts` with lazy `loadComponent` routes: `/login`, `/events` (default), `/events/new`, `/events/:id/occupancy`, `/admin/reservations`.
- [ ] **Step 4:** Shell `app.component` with nav (links shown/hidden by auth role signal) + `<router-outlet>` + notifications host.
- [ ] **Step 5: Test** — `app.component.spec` renders nav + outlet. Run `pnpm test` → PASS.
- [ ] **Step 6:** Commit `feat: routing shell, env config, http providers`.

---

## Task 2: Models + typed API services

**Files:** `core/models/*.ts`, `core/api/*.service.ts`.

**Interfaces produced:**
- `EventResponse`, `CreateEventRequest`, `EventFilter`, `ReservationResponse`, `CreateReservationRequest`, `OccupancyResponse`, `LoginRequest`, `LoginResponse` — fields mirror backend DTOs in `eventosvivos-api/PLAN.md`.
- `EventsApiService`: `list(filter): Observable<EventResponse[]>` (builds query params), `create(req): Observable<EventResponse>`, `occupancy(id): Observable<OccupancyResponse>`.
- `ReservationsApiService`: `create(req)`, `confirm(id)`, `cancel(id)`.
- `AuthApiService`: `login(req): Observable<LoginResponse>`.

- [ ] **Step 1: Failing test** — `EventsApiService.list` issues GET to `${apiBaseUrl}/events` with only the provided filter params (use `HttpTestingController`).
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement models + services (`inject(HttpClient)`, build `HttpParams` skipping null filters).
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit `feat(core): typed models + API services`.

---

## Task 3: Auth — store, interceptors, guard, login

**Files:** `core/auth/auth.store.ts`, `auth.guard.ts`, `core/http/auth.interceptor.ts`, `error.interceptor.ts`, `features/auth/login.component.ts`.

**Interfaces produced:**
- `AuthStore` (signal): `token: Signal<string|null>`, `role: Signal<Role|null>`, `isAuthenticated: Signal<boolean>`, `login(res)`, `logout()`; persists token to `localStorage`, restores on init; decodes role from JWT or login response.
- `authGuard(requiredRole?)`: redirects to `/login` if unauthenticated, to `/events` if role mismatch.
- `authInterceptor`: adds `Authorization: Bearer` when token present.
- `errorInterceptor`: catches HTTP errors, pushes `NotificationService` message from ProblemDetails, rethrows.

- [ ] **Step 1: Failing tests** — `authInterceptor` adds header when token set, none when null; `authGuard` blocks unauthenticated; login component calls `AuthApiService.login` and stores token on success.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement store, interceptors, guard, login form (typed Reactive Form: email/password, disabled submit while pending, error display).
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit `feat(auth): signal store, JWT interceptor, role guard, login`.

---

## Task 4: Event list + filters (RF-02)

**Files:** `features/events/event-list.component.ts`, `event-card.component.ts`.

- [ ] **Step 1: Failing test** — component loads events on init via `EventsApiService.list`, renders one card per event; changing the type filter re-requests with `type` param; title search debounces and passes `q`.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement: filter form (type, venue, status, from/to date, title text), `toSignal` of results, loading + empty states, status badge color, card shows title/venue/date/price/status.
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit `feat(events): list with filters (RF-02)`.

---

## Task 5: Create event form (RF-01, admin)

**Files:** `features/events/event-create.component.ts`. Route guarded `authGuard('Admin')`.

- [ ] **Step 1: Failing test** — invalid form (title <5, end before start, capacity ≤0) keeps submit disabled / shows errors; valid form calls `EventsApiService.create` and navigates to `/events`; server error (e.g. `event.venueOverlap`) is shown inline.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement typed Reactive Form mirroring RF-01 validations (title 5–100, desc 10–500, capacity >0, price >0, start future, end>start, type select, venue select). Show server `code` mapped to friendly message.
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit `feat(events): create form with client validation (RF-01)`.

---

## Task 6: Reserve dialog (RF-03)

**Files:** `features/reservations/reserve-dialog.component.ts`. Invoked from event card.

- [ ] **Step 1: Failing test** — form (quantity, buyerName, buyerEmail) validates email + quantity≥1; submit calls `ReservationsApiService.create`; on `reserve.soldOut`/`reserve.max5Near24h`/`reserve.max10HighPrice` shows the mapped message; success shows reservation status `PendientePago`.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement dialog + form; surface server rule errors verbatim-mapped to friendly Spanish text.
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit `feat(reservations): reserve dialog (RF-03)`.

---

## Task 7: Admin confirm / cancel reservations (RF-04, RF-05)

**Files:** `features/reservations/reservation-admin.component.ts`. Guarded `authGuard('Admin')` (cancel allowed to User too per backend, but admin screen here).

- [ ] **Step 1: Failing test** — confirm calls `confirm(id)` and shows returned `EV-######` code; confirm already-confirmed shows `reservation.alreadyConfirmed`; cancel calls `cancel(id)` and reflects `Cancelada`; cancel of pending shows `reservation.notConfirmed`.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement list of reservations with confirm/cancel actions, optimistic UI disabled while pending, error mapping.
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit `feat(reservations): admin confirm/cancel (RF-04, RF-05)`.

---

## Task 8: Occupancy report (RF-06)

**Files:** `features/reports/occupancy.component.ts`. Route `/events/:id/occupancy`.

- [ ] **Step 1: Failing test** — loads `reportsApi.occupancy(id)`, renders Sold, Available, **RetainedByPenalty (perdidas)** explicitly, Occupancy %, Total revenue, Status.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement with a simple progress bar for occupancy %, and an explicit labeled line for retained-by-penalty seats (decision #2).
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit `feat(reports): occupancy view (RF-06)`.

---

## Task 9: Error/loading UX + notifications

**Files:** `core/notifications/notification.service.ts`, `shared/ui/spinner.component.ts`, `error-banner.component.ts`. Wire into shell + error interceptor.

- [ ] **Step 1: Failing test** — `NotificationService.push` adds a message signal entry; auto-dismiss after timeout; `errorInterceptor` pushes on HTTP error.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement toast queue (signal array), spinner, error banner; map common backend error `code`s → Spanish messages in one dictionary.
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit `feat(ux): notifications, spinner, error mapping`.

---

## Task 10: Dockerfile (nginx) + README

**Files:** `Dockerfile`, `.dockerignore`, `nginx.conf`, `README.md`.

- [ ] **Step 1:** Multi-stage `Dockerfile`: `node:24` build (`pnpm install --frozen-lockfile && pnpm build`) → `nginx:alpine` serving `dist/`. `nginx.conf` with SPA fallback (`try_files $uri /index.html`) and a `/api` note (reverse-proxy or env-injected base URL).
- [ ] **Step 2: README.md** sections:
  - **Run locally:** `pnpm install` → `pnpm start` → `http://localhost:4200` (expects API at `http://localhost:8080`).
  - **Run with Docker:** `docker build -t eventosvivos-web . && docker run -p 4200:80 eventosvivos-web`.
  - **Architecture:** standalone + signals + typed API layer + interceptors + role guards.
  - **Config:** `environment.ts apiBaseUrl`.
  - **Deploy (provider-agnostic):** static build (`dist/`) deployable to any static host / CDN / container; provider not fixed (examples: Netlify, Vercel, Render static, nginx container, S3+CloudFront). The build artifact is the unit; provider is swappable.
- [ ] **Step 3:** Commit `chore: dockerize web + README`.

---

## Self-Review Notes

- Each RF that has a UI (01–06) maps to a task; auth + UX + docker covered.
- Model enums and DTO field names must match `eventosvivos-api/PLAN.md` exactly — verify against backend `*Response` records before implementing Task 2.
- Occupancy view explicitly labels penalty-retained seats (decision #2).
- pnpm is the only package manager; all commands use it.
