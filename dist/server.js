"use strict";
// ═══════════════════════════════════════════════════════════════
// src/server.ts
// Point d'entrée du serveur
// ═══════════════════════════════════════════════════════════════
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const database_1 = __importDefault(require("./config/database"));
// Route ping pour qu'Electron sache que le backend est pret
app_1.default.get("/api/auth/ping", (_req, res) => res.json({ ok: true }));
async function startServer() {
    try {
        await database_1.default.$connect();
        console.log("Connexion a la base de donnees etablie");
        const server = app_1.default.listen(env_1.env.PORT, () => {
            console.log(`Serveur Delice Pro demarre sur http://localhost:${env_1.env.PORT}`);
            console.log(`Environnement : ${env_1.env.NODE_ENV}`);
            console.log(`Frontend autorise : ${env_1.env.FRONTEND_URL}`);
        });
        const shutdown = async (signal) => {
            console.log(`Signal ${signal} recu. Arret propre en cours...`);
            server.close(async () => {
                await database_1.default.$disconnect();
                console.log("Connexion BDD fermee proprement");
                process.exit(0);
            });
            setTimeout(() => {
                console.error("Arret force apres timeout");
                process.exit(1);
            }, 10000);
        };
        process.on("SIGTERM", () => shutdown("SIGTERM"));
        process.on("SIGINT", () => shutdown("SIGINT"));
        process.on("unhandledRejection", (reason) => {
            console.error("Promesse rejetee non geree :", reason);
            shutdown("unhandledRejection");
        });
    }
    catch (error) {
        console.error("Impossible de demarrer le serveur :", error);
        await database_1.default.$disconnect();
        process.exit(1);
    }
}
startServer();
//# sourceMappingURL=server.js.map