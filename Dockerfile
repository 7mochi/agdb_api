################################$
#  Build for local development  #
###############################$#

FROM node:lts-bullseye-slim AS development

# Install the necessary dependencies for hot reloading
RUN apt-get update && apt-get install -y procps openssl

# Create the app directory
WORKDIR /usr/src/app

# Copy package.json, yarn.lock to the container image.
# Copying this first avoids re-running npm install on every code change.
COPY --chown=node:node package.json yarn.lock ./

# Install all the necessary dependencies of the application
RUN yarn agdb-install-dev

# Copy the rest of the application code
COPY --chown=node:node . .

# Use the node user from the image (Instead of root)
USER node

###############################%
#     Build for production     #
###############################%

FROM node:lts-bullseye-slim AS build

WORKDIR /usr/src/app

COPY --chown=node:node package.json yarn.lock ./

# To run `yarn run build` we need access to the Nest CLI.
# The Nest CLI is a development dependency,
# In the previous development stage we ran `yarn install` which installed all the dependencies.
# so we can copy the node_modules directory from the development image to this image.
COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules

COPY --chown=node:node . .

# Run the build command that creates the production files
RUN yarn agdb-build

# Set the NODE_ENV to production
ENV NODE_ENV production

# Running `npm ci` removes the existing node_modules directory.
# Passing '--production --frozen-lockfile' ensures that only production dependencies are installed.
# This ensures that the node_modules directory is as optimized as possible.
RUN yarn agdb-install-prod

USER node

###############################
#         Producción          #
###############################

FROM node:lts-bullseye-slim AS production

# Copy the generated files from the build stage to the production image
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist
COPY --chown=node:node --from=build /usr/src/app/bin/*.sh ./bin/

USER node