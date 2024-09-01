FROM node:lts-bullseye-slim AS build

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn agdb-install-prod

COPY . .
RUN yarn agdb-build

FROM node:lts-bullseye-slim AS production

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/bin ./bin
