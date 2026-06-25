# EventosVivos Web

Angular 22 single-page application for the EventosVivos platform. Built with standalone components, signals, and Vitest for unit tests.

## Run locally

Requires [pnpm](https://pnpm.io/) and Node.js 24.

```bash
pnpm install
pnpm start
```

Open [http://localhost:4200](http://localhost:4200). The dev server expects the API at [http://localhost:8080](http://localhost:8080); update `src/environments/environment.ts` if your backend runs elsewhere.

## Run with Docker

```bash
docker build -t eventosvivos-web .
docker run -p 4200:80 eventosvivos-web
```

The container serves the production build on port `80`; visit [http://localhost:4200](http://localhost:4200).

## Architecture

- **Standalone components** bootstrapped via `bootstrapApplication`.
- **Signals** for component state; RxJS is kept at the HTTP boundary (`HttpClient` → `toSignal`).
- **Typed API layer** with environment-driven base URLs and HTTP interceptors.
- **Role guards** for route protection.
- **SpartanUI** for the component library and styling primitives.

## Config

The API base URL is configured in `src/environments/environment.ts`:

```typescript
export const environment = {
  apiBaseUrl: 'http://localhost:8080/api',
};
```

## Deploy

The production build in `dist/` is a static bundle that can be deployed to any static host, CDN, or container. The hosting provider is swappable; common options include Netlify, Vercel, Render Static Sites, an nginx container, or S3 + CloudFront.
