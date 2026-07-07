"use strict";
// src/modules/users/users.routes.ts
// Ameliorations :
// - PUT /:id/password : reinitialiser le mot de passe
// - lastLogin : date derniere connexion
// - Protection : ADMIN seulement pour creer/modifier/desactiver
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const auth_middleware_1 = require("../../middleware/auth.middleware");
const database_1 = __importDefault(require("../../config/database"));
const error_middleware_1 = require("../../middleware/error.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
const createUserSchema = zod_1.z.object({
    prenom: zod_1.z.string().min(1, "Prenom requis"),
    nom: zod_1.z.string().min(1, "Nom requis"),
    email: zod_1.z.string().email("Email invalide"),
    password: zod_1.z.string().min(8, "Minimum 8 caracteres"),
    role: zod_1.z.enum(["ADMIN", "RESPONSABLE", "CHEF_PATISSIER", "GESTIONNAIRE", "CAISSIER", "COMPTABLE"]),
});
const updateUserSchema = zod_1.z.object({
    prenom: zod_1.z.string().min(1).optional(),
    nom: zod_1.z.string().min(1).optional(),
    role: zod_1.z.enum(["ADMIN", "RESPONSABLE", "CHEF_PATISSIER", "GESTIONNAIRE", "CAISSIER", "COMPTABLE"]).optional(),
    actif: zod_1.z.boolean().optional(),
});
// GET /api/users
router.get("/", (0, auth_middleware_1.requireRole)(["ADMIN", "RESPONSABLE"]), async (req, res) => {
    const users = await database_1.default.user.findMany({
        where: { companyId: req.user.companyId },
        select: {
            id: true, prenom: true, nom: true, email: true,
            role: true, actif: true, createdAt: true,
            // lastLogin si le champ existe (optionnel)
        },
        orderBy: { createdAt: "asc" },
    });
    res.json({ success: true, data: users });
});
// POST /api/users — Creer un utilisateur (ADMIN seulement)
router.post("/", (0, auth_middleware_1.requireRole)(["ADMIN"]), async (req, res) => {
    const data = createUserSchema.parse(req.body);
    const existing = await database_1.default.user.findFirst({
        where: { email: data.email, companyId: req.user.companyId },
    });
    if (existing)
        throw new error_middleware_1.AppError("Cet email est deja utilise dans votre entreprise", 409);
    const passwordHash = await bcryptjs_1.default.hash(data.password, 12);
    const user = await database_1.default.user.create({
        data: {
            prenom: data.prenom, nom: data.nom,
            email: data.email, passwordHash,
            role: data.role, companyId: req.user.companyId,
        },
        select: { id: true, prenom: true, nom: true, email: true, role: true, actif: true },
    });
    res.status(201).json({ success: true, data: user });
});
// PUT /api/users/:id — Modifier role/statut (ADMIN seulement)
router.put("/:id", (0, auth_middleware_1.requireRole)(["ADMIN"]), async (req, res) => {
    const { id } = req.params;
    // Empecher l'ADMIN de se desactiver lui-meme
    if (id === req.user.id && req.body.actif === false) {
        throw new error_middleware_1.AppError("Vous ne pouvez pas desactiver votre propre compte", 400);
    }
    // Verifier que l'utilisateur appartient a la meme entreprise
    const existing = await database_1.default.user.findFirst({
        where: { id, companyId: req.user.companyId },
    });
    if (!existing)
        throw new error_middleware_1.AppError("Utilisateur introuvable", 404);
    const data = updateUserSchema.parse(req.body);
    const user = await database_1.default.user.update({
        where: { id },
        data,
        select: { id: true, prenom: true, nom: true, email: true, role: true, actif: true },
    });
    res.json({ success: true, data: user });
});
// PUT /api/users/:id/password — Reinitialiser le mot de passe (ADMIN seulement)
router.put("/:id/password", (0, auth_middleware_1.requireRole)(["ADMIN"]), async (req, res) => {
    const { id } = req.params;
    const { password } = zod_1.z.object({
        password: zod_1.z.string().min(8, "Minimum 8 caracteres"),
    }).parse(req.body);
    // Verifier appartenance a la meme entreprise
    const existing = await database_1.default.user.findFirst({
        where: { id, companyId: req.user.companyId },
    });
    if (!existing)
        throw new error_middleware_1.AppError("Utilisateur introuvable", 404);
    const passwordHash = await bcryptjs_1.default.hash(password, 12);
    await database_1.default.user.update({
        where: { id },
        data: { passwordHash },
    });
    res.json({ success: true, data: { message: "Mot de passe reinitialise avec succes" } });
});
exports.default = router;
//# sourceMappingURL=users.routes.js.map