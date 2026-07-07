"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/modules/produits/produits.routes.ts
const express_1 = require("express");
const zod_1 = require("zod");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const database_1 = __importDefault(require("../../config/database"));
const calculations_1 = require("../../utils/calculations");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
const produitSchema = zod_1.z.object({
    nom: zod_1.z.string().min(2),
    prixVente: zod_1.z.number().positive("Le prix doit être positif"),
    margeMin: zod_1.z.number().min(0).max(100).default(25),
    grammage: zod_1.z.number().positive().optional().nullable(), // Poids d'une pièce en grammes
    categorieId: zod_1.z.string().optional(),
    recetteId: zod_1.z.string().optional(),
    seuilAlerte: zod_1.z.number().min(0).optional(),
});
// GET /api/produits — Lister les produits avec leurs marges calculées
router.get("/", async (req, res) => {
    const produits = await database_1.default.produit.findMany({
        where: { companyId: req.user.companyId, actif: true },
        include: {
            categorie: { select: { id: true, nom: true } },
            recette: { select: { id: true, nom: true } },
        },
        orderBy: { nom: "asc" },
    });
    // Calculer la marge de chaque produit
    const produitsAvecMarges = await Promise.all(produits.map(async (p) => ({
        ...p,
        ...(await (0, calculations_1.calculerMargeProduit)(p.id)),
    })));
    res.json({ success: true, data: produitsAvecMarges });
});
// POST /api/produits
router.post("/", (0, auth_middleware_1.requireRole)(["ADMIN", "RESPONSABLE"]), async (req, res) => {
    const data = produitSchema.parse(req.body);
    const produit = await database_1.default.produit.create({
        data: { ...data, companyId: req.user.companyId },
        include: { categorie: true, recette: true },
    });
    res.status(201).json({ success: true, data: produit });
});
// PUT /api/produits/:id
router.put("/:id", (0, auth_middleware_1.requireRole)(["ADMIN", "RESPONSABLE"]), async (req, res) => {
    const data = produitSchema.partial().parse(req.body);
    const produit = await database_1.default.produit.update({
        where: { id: req.params.id },
        data,
        include: { categorie: true, recette: true },
    });
    res.json({ success: true, data: produit });
});
// DELETE /api/produits/:id (soft delete)
router.delete("/:id", (0, auth_middleware_1.requireRole)(["ADMIN"]), async (req, res) => {
    await database_1.default.produit.update({
        where: { id: req.params.id },
        data: { actif: false },
    });
    res.json({ success: true, message: "Produit désactivé" });
});
exports.default = router;
//# sourceMappingURL=produits.routes.js.map