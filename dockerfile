#===============================
# Compiling
#===============================
FROM node:14.16.1-slim AS Compiling

RUN echo "⚠⚠⚠⚠⚠⚠  WARNING  ⚠⚠⚠⚠⚠⚠"
RUN echo "This Docker Image Has GCP Credential Files!"
RUN echo "Don't Publish in Public!"

WORKDIR /compile

COPY . ./

# `@types/**` なども含めてインストール
RUN yarn --frozen-lockfile

# TSをJSにトランスパイル
RUN yarn compile


#===============================
# Running Modules Install
#===============================
FROM node:14.16.1-slim AS node_modules

WORKDIR /modules
COPY package.json yarn.lock ./

# `@types/**` などを省いてインストール
RUN yarn --production --frozen-lockfile


#===============================
# Run
#===============================
FROM gcr.io/distroless/nodejs:14

WORKDIR /usr/src/HikakinSymmetry/nodeBot

COPY package.json yarn.lock ./
COPY .envs ./.envs/
COPY --from=Compiling /compile/dist ./dist/
COPY --from=node_modules /modules/node_modules ./node_modules

CMD ["dist/index.js"]
