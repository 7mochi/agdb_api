FROM node:lts-bullseye-slim AS development

RUN apt-get update && apt-get install -y procps openssl

WORKDIR /srv/root

COPY --chown=node:node package.json yarn.lock ./

RUN yarn agdb-install-dev

COPY --chown=node:node . .

USER node

FROM node:lts-bullseye-slim AS build

WORKDIR /srv/root

COPY --chown=node:node package.json yarn.lock ./
COPY --chown=node:node --from=development /srv/root/node_modules ./node_modules
COPY --chown=node:node . .

RUN yarn agdb-build

ENV NODE_ENV production
RUN yarn agdb-install-prod

USER node

FROM node:lts-bullseye-slim AS production

COPY --chown=node:node --from=build /srv/root/node_modules ./node_modules
COPY --chown=node:node --from=build /srv/root/dist ./dist
COPY --chown=node:node --from=build /srv/root/scripts/*.sh ./scripts/

USER node