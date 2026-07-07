FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install && chmod -R +x node_modules/.bin/

COPY . .

RUN node_modules/.bin/prisma generate

RUN node_modules/.bin/tsc

EXPOSE 5000

CMD ["node", "dist/server.js"]
