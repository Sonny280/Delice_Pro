// ═══════════════════════════════════════════════════════════════
// src/server.ts
// Point d'entrée du serveur
// ═══════════════════════════════════════════════════════════════

import app from "./app";
import { env } from "./config/env";
import prisma from "./config/database";

// Route ping pour qu'Electron sache que le backend est pret
app.get("/api/auth/ping", (_req, res) => res.json({ ok: true }));

async function startServer() {
  try {
    await prisma.$connect();
    console.log("Connexion a la base de donnees etablie");

    const server = app.listen(env.PORT, () => {
      console.log(`Serveur Delice Pro demarre sur http://localhost:${env.PORT}`);
      console.log(`Environnement : ${env.NODE_ENV}`);
      console.log(`Frontend autorise : ${env.FRONTEND_URL}`);
    });

    const shutdown = async (signal: string) => {
      console.log(`Signal ${signal} recu. Arret propre en cours...`);
      server.close(async () => {
        await prisma.$disconnect();
        console.log("Connexion BDD fermee proprement");
        process.exit(0);
      });
      setTimeout(() => {
        console.error("Arret force apres timeout");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT",  () => shutdown("SIGINT"));

    process.on("unhandledRejection", (reason: unknown) => {
      console.error("Promesse rejetee non geree :", reason);
      shutdown("unhandledRejection");
    });
  } catch (error) {
    console.error("Impossible de demarrer le serveur :", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();
