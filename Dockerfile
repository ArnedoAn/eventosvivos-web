# syntax=docker/dockerfile:1

FROM node:24 AS build

WORKDIR /app

COPY package.json pnpm-lock.yaml .npmrc pnpm-workspace.yaml ./

RUN corepack enable && corepack prepare pnpm@11.9.0 --activate && \
    pnpm install --frozen-lockfile

COPY . .

ARG API_BASE_URL=http://localhost:8080/api
RUN printf 'export const environment = { apiBaseUrl: "%s" };\n' "$API_BASE_URL" \
    > src/environments/environment.ts && \
    pnpm build

FROM nginx:alpine

COPY --from=build /app/dist/eventosvivos-web/browser/ /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
