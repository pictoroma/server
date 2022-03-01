FROM node:16-alpine as build
WORKDIR /app
RUN apk update && apk add sqlite
COPY yarn.lock .yarnrc.yml package.json /app/
RUN \
  corepack enable && \
  yarn install
COPY . /app/
RUN yarn build:bundle

FROM node:16-alpine
ENV NODE_ENV=production
ENV DATA_LOCATION=/data
COPY --from=build /app/bundle /app
CMD ["node", "/app/index.js"]
