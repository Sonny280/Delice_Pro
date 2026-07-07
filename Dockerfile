FROM node:20-alpine

WORKDIR /app

# Copier package.json
COPY package*.json ./

# Installer TOUS les packages (dev inclus)
RUN npm install

# Copier le code source
COPY . .

# Générer le client Prisma
RUN ./node_modules/.bin/prisma generate

# Compiler TypeScript
RUN ./node_modules/.bin/tsc

# Exposer le port
EXPOSE 5000

# Démarrer
CMD ["node", "dist/server.js"]
