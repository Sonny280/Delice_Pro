FROM node:20

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

RUN npm run prisma:generate

COPY . .

RUN npm run build

EXPOSE 5000

CMD ["node", "dist/server.js"]*
