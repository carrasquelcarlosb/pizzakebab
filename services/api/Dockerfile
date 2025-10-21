# syntax=docker/dockerfile:1

FROM node:20-bullseye-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-bullseye-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run api:build

FROM node:20-bullseye-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/services/api/dist ./services/api/dist
COPY package.json package-lock.json ./
RUN npm prune --omit=dev
EXPOSE 4000
CMD ["npm", "run", "api:start"]
