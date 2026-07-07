FROM node:20

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

RUN npm run prisma:generate

COPY . .

RUN node ./node_modules/typescript/lib/tsc.js

EXPOSE 5000

CMD ["node", "dist/server.js"]
