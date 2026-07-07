"use strict";
// ═══════════════════════════════════════════════════════════════
// src/middleware/auth.middleware.ts
// Middleware d'authentification JWT
//
// Un middleware est une fonction qui s'exécute AVANT le controller.
// Son rôle : vérifier que la requête vient d'un utilisateur connecté.
//
// Fonctionnement :
// 1. Le client envoie le token JWT dans le header Authorization
// 2. On extrait et vérifie le token
// 3. On charge l'utilisateur depuis la BDD
// 4. On stocke l'utilisateur dans req.user pour le controller
// ═══════════════════════════════════════════════════════════════
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const database_1 = __importDefault(require("../config/database"));
// ─── Middleware principal : vérifie que l'utilisateur est connecté ───
const authMiddleware = async (req, res, next // next() = passe au middleware/controller suivant
) => {
    try {
        // 1. Récupérer le header Authorization
        // Format attendu : "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI..."
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            // 401 = Non autorisé (pas de token)
            res.status(401).json({
                success: false,
                message: "Accès refusé : aucun token fourni",
            });
            return;
        }
        // 2. Extraire le token (enlever "Bearer " du début)
        const token = authHeader.split(" ")[1];
        // 3. Vérifier et décoder le token
        // jwt.verify lance une exception si le token est invalide ou expiré
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        // 4. Vérifier que l'utilisateur existe toujours en BDD et est actif
        // (il pourrait avoir été désactivé depuis la création du token)
        const user = await database_1.default.user.findFirst({
            where: {
                id: decoded.userId,
                companyId: decoded.companyId,
                actif: true, // Seulement les utilisateurs actifs
            },
            select: {
                id: true,
                companyId: true,
                role: true,
                email: true,
            },
        });
        if (!user) {
            res.status(401).json({
                success: false,
                message: "Token invalide : utilisateur introuvable ou inactif",
            });
            return;
        }
        // 5. Stocker les infos utilisateur dans req.user pour les controllers
        req.user = user;
        // 6. Passer au middleware/controller suivant
        next();
    }
    catch (error) {
        // Le token est invalide ou expiré
        res.status(401).json({
            success: false,
            message: "Token invalide ou expiré",
        });
    }
};
exports.authMiddleware = authMiddleware;
// ─── Factory de middleware : vérifie les rôles autorisés ───
// Usage : router.get('/admin', authMiddleware, requireRole(['ADMIN']), controller)
const requireRole = (roles) => {
    return (req, res, next) => {
        // req.user est rempli par authMiddleware (appelé avant)
        if (!req.user) {
            res.status(401).json({ success: false, message: "Non authentifié" });
            return;
        }
        // Vérifier si le rôle de l'utilisateur est dans la liste autorisée
        if (!roles.includes(req.user.role)) {
            // 403 = Interdit (connecté mais pas les droits suffisants)
            res.status(403).json({
                success: false,
                message: `Accès refusé. Rôles autorisés : ${roles.join(", ")}`,
            });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
//# sourceMappingURL=auth.middleware.js.map