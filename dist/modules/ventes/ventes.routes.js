"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/modules/ventes/ventes.routes.ts
const express_1 = require("express");
const zod_1 = require("zod");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const ventes_service_1 = require("./ventes.service");
const database_1 = __importDefault(require("../../config/database"));
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
// GET /api/ventes/stats
router.get("/stats", async (req, res) => {
    const { dateDebut, dateFin } = req.query;
    const result = await (0, ventes_service_1.getStatsVentes)(req.user.companyId, {
        dateDebut: dateDebut,
        dateFin: dateFin,
    });
    res.json({ success: true, data: result });
});
// GET /api/ventes -- Historique des ventes
router.get("/", async (req, res) => {
    const ventes = await database_1.default.vente.findMany({
        where: { companyId: req.user.companyId },
        include: {
            lignes: { include: { produit: { select: { nom: true } } } },
            user: { select: { prenom: true, nom: true } },
        },
        orderBy: { date: "desc" },
        take: 100,
    });
    res.json({ success: true, data: ventes });
});
// GET /api/ventes/stock-produits — Stock actuel de tous les produits finis
router.get("/stock-produits", async (req, res) => {
    const produits = await (0, ventes_service_1.getStockProduits)(req.user.companyId);
    res.json({ success: true, data: produits });
});
// PUT /api/ventes/stock-produits/:id/stock — Modifier stock + seuil en valeur ABSOLUE
// C'est la route utilisée par l'édition en ligne : on saisit directement la valeur finale
router.put("/stock-produits/:id/stock", (0, auth_middleware_1.requireRole)(["ADMIN", "RESPONSABLE", "GESTIONNAIRE", "CHEF_PATISSIER"]), async (req, res) => {
    const schema = zod_1.z.object({
        stockActuel: zod_1.z.number().min(0, "Le stock ne peut pas être négatif"),
        seuilAlerte: zod_1.z.number().min(0, "Le seuil ne peut pas être négatif"),
    });
    const { stockActuel, seuilAlerte } = schema.parse(req.body);
    // Vérifier que le produit appartient à l'entreprise
    const produit = await database_1.default.produit.findFirst({
        where: { id: req.params.id, companyId: req.user.companyId },
    });
    if (!produit) {
        res.status(404).json({ success: false, message: "Produit introuvable" });
        return;
    }
    const updated = await database_1.default.produit.update({
        where: { id: req.params.id },
        data: { stockActuel, seuilAlerte },
    });
    res.json({ success: true, data: updated });
});
// POST /api/ventes — Enregistrer une vente (décrémente le stock automatiquement)
router.post("/", (0, auth_middleware_1.requireRole)(["ADMIN", "RESPONSABLE", "CAISSIER"]), async (req, res) => {
    const data = ventes_service_1.createVenteSchema.parse(req.body);
    const vente = await (0, ventes_service_1.createVente)(req.user.companyId, req.user.id, data);
    // Décrémenter le stock de chaque produit vendu
    // On utilise Math.max(0, ...) pour éviter un stock négatif
    for (const ligne of data.lignes) {
        const produit = await database_1.default.produit.findUnique({ where: { id: ligne.produitId } });
        if (produit) {
            await database_1.default.produit.update({
                where: { id: ligne.produitId },
                data: {
                    stockActuel: Math.max(0, produit.stockActuel - ligne.quantite),
                },
            });
        }
    }
    res.status(201).json({ success: true, data: vente });
});
// POST /api/ventes/stock-produits/entree — Entree manuelle stock produit fini
router.post("/stock-produits/entree", (0, auth_middleware_1.requireRole)(["ADMIN", "RESPONSABLE", "CHEF_PATISSIER"]), async (req, res) => {
    const schema = zod_1.z.object({
        produitId: zod_1.z.string({ required_error: "Produit requis" }),
        quantite: zod_1.z.number().int().positive("La quantite doit etre positive"),
        motif: zod_1.z.string().optional(),
    });
    const { produitId, quantite } = schema.parse(req.body);
    const produit = await database_1.default.produit.findFirst({
        where: { id: produitId, companyId: req.user.companyId },
    });
    if (!produit) {
        res.status(404).json({ success: false, message: "Produit introuvable" });
        return;
    }
    const updated = await database_1.default.produit.update({
        where: { id: produitId },
        data: { stockActuel: { increment: quantite } },
    });
    res.json({
        success: true,
        data: {
            produit: updated,
            message: `+${quantite} pcs ajoutees. Nouveau stock : ${updated.stockActuel}`,
        },
    });
});
exports.default = router;
//# sourceMappingURL=ventes.routes.js.map