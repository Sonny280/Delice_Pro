"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/modules/commandesClient/commandesClient.routes.ts
const express_1 = require("express");
const zod_1 = require("zod");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const database_1 = __importDefault(require("../../config/database"));
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
// Génère une référence unique ex: CMD-2025-042
async function genererReference(companyId) {
    const count = await database_1.default.commandeClient.count({ where: { companyId } });
    const year = new Date().getFullYear();
    return `CMD-${year}-${String(count + 1).padStart(3, "0")}`;
}
const ligneSchema = zod_1.z.object({
    produitId: zod_1.z.string(),
    quantite: zod_1.z.number().int().positive(),
    prixUnitaire: zod_1.z.number().positive(),
});
const commandeSchema = zod_1.z.object({
    clientId: zod_1.z.string(),
    dateLivraison: zod_1.z.string(),
    acompte: zod_1.z.number().min(0).default(0),
    notes: zod_1.z.string().optional(),
    lignes: zod_1.z.array(ligneSchema).min(1),
});
// GET /api/commandes-client
router.get("/", async (req, res) => {
    const { statut } = req.query;
    const commandes = await database_1.default.commandeClient.findMany({
        where: {
            companyId: req.user.companyId,
            ...(statut ? { statut: statut } : {}),
        },
        include: {
            client: { select: { id: true, nom: true, telephone: true, type: true } },
            lignes: {
                include: { produit: { select: { id: true, nom: true, prixVente: true } } },
            },
        },
        orderBy: { dateLivraison: "asc" },
    });
    res.json({ success: true, data: commandes });
});
// POST /api/commandes-client
router.post("/", async (req, res) => {
    const data = commandeSchema.parse(req.body);
    const reference = await genererReference(req.user.companyId);
    const montantTotal = data.lignes.reduce((sum, l) => sum + l.quantite * l.prixUnitaire, 0);
    const commande = await database_1.default.commandeClient.create({
        data: {
            reference,
            clientId: data.clientId,
            companyId: req.user.companyId,
            dateLivraison: new Date(data.dateLivraison),
            acompte: data.acompte,
            montantTotal,
            notes: data.notes,
            lignes: {
                create: data.lignes.map(l => ({
                    produitId: l.produitId,
                    quantite: l.quantite,
                    prixUnitaire: l.prixUnitaire,
                    sousTotal: l.quantite * l.prixUnitaire,
                })),
            },
        },
        include: {
            client: true,
            lignes: { include: { produit: true } },
        },
    });
    res.status(201).json({ success: true, data: commande });
});
// PUT /api/commandes-client/:id/statut — Changer le statut
router.put("/:id/statut", async (req, res) => {
    const { statut } = zod_1.z.object({
        statut: zod_1.z.enum(["RECUE", "EN_PRODUCTION", "PRETE", "LIVREE", "ANNULEE"]),
    }).parse(req.body);
    const commande = await database_1.default.commandeClient.update({
        where: { id: req.params.id },
        data: { statut },
        include: { client: true, lignes: { include: { produit: true } } },
    });
    res.json({ success: true, data: commande });
});
// PUT /api/commandes-client/:id — Modifier une commande
router.put("/:id", async (req, res) => {
    const data = commandeSchema.partial().parse(req.body);
    const montantTotal = data.lignes
        ? data.lignes.reduce((sum, l) => sum + l.quantite * l.prixUnitaire, 0)
        : undefined;
    // Si on modifie les lignes, on supprime et recrée
    if (data.lignes) {
        await database_1.default.ligneCommandeClient.deleteMany({ where: { commandeId: req.params.id } });
    }
    const commande = await database_1.default.commandeClient.update({
        where: { id: req.params.id },
        data: {
            ...(data.clientId ? { clientId: data.clientId } : {}),
            ...(data.dateLivraison ? { dateLivraison: new Date(data.dateLivraison) } : {}),
            ...(data.acompte !== undefined ? { acompte: data.acompte } : {}),
            ...(data.notes !== undefined ? { notes: data.notes } : {}),
            ...(montantTotal !== undefined ? { montantTotal } : {}),
            ...(data.lignes ? {
                lignes: {
                    create: data.lignes.map(l => ({
                        produitId: l.produitId,
                        quantite: l.quantite,
                        prixUnitaire: l.prixUnitaire,
                        sousTotal: l.quantite * l.prixUnitaire,
                    })),
                },
            } : {}),
        },
        include: { client: true, lignes: { include: { produit: true } } },
    });
    res.json({ success: true, data: commande });
});
// DELETE /api/commandes-client/:id
router.delete("/:id", (0, auth_middleware_1.requireRole)(["ADMIN", "RESPONSABLE"]), async (req, res) => {
    await database_1.default.commandeClient.update({
        where: { id: req.params.id },
        data: { statut: "ANNULEE" },
    });
    res.json({ success: true });
});
exports.default = router;
//# sourceMappingURL=commandesClient.routes.js.map