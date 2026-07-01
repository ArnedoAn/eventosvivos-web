# syntax=docker/dockerfile:1

FROM node:24 AS build

WORKDIR /app

COPY package.json pnpm-lock.yaml .npmrc pnpm-workspace.yaml ./

RUN corepack enable && corepack prepare pnpm@11.9.0 --activate && \
    pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

FROM nginx:alpine

RUN apk add --no-cache gettext

COPY --from=build /app/dist/eventosvivos-web/browser/ /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
