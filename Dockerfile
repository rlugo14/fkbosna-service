FROM node:20-alpine AS build


WORKDIR /app
COPY package*.json ./
COPY . ./

RUN apk add --update python3 make g++ && rm -rf /var/cache/apk/*
ENV NODE_OPTIONS --max-old-space-size=2048
RUN npm ci && npm run build && npm prune --omit=dev

EXPOSE 3000

CMD [ "node", "dist/main.js" ]