# syntax=docker/dockerfile:1

# Stage 1: Build the Angular application
FROM node:24 AS build

WORKDIR /app

# Copy package manifests first for better layer caching
COPY package.json pnpm-lock.yaml ./

# Install pnpm (pinned to match packageManager field) and dependencies
RUN corepack enable && corepack prepare pnpm@11.9.0 --activate && \
    pnpm install --frozen-lockfile

# Copy the rest of the source code
COPY . .

# Production build (default Angular CLI configuration)
RUN pnpm build

# Stage 2: Serve the built application with nginx
FROM nginx:alpine

# Copy static output from the build stage
# @angular/build:application outputs browser bundles to dist/eventosvivos-web/browser/
COPY --from=build /app/dist/eventosvivos-web/browser/ /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
