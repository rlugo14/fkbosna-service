FROM node:14-alpine AS build


WORKDIR /app
COPY package*.json ./
COPY . ./

RUN npm ci && npm run build && npm prune --production

CMD [ "node", "dist/main.js" ]