"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/modules/pertes/pertes.routes.ts
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const pertes_service_1 = require("./pertes.service");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
// GET /api/pertes
router.get("/", async (req, res) => {
    const { type, cause, dateDebut, dateFin, limit } = req.query;
    const result = await (0, pertes_service_1.getPertes)(req.user.companyId, {
        type: type,
        cause: cause,
        dateDebut: dateDebut,
        dateFin: dateFin,
        limit: limit ? parseInt(limit) : undefined,
    });
    res.json({ success: true, data: result });
});
// GET /api/pertes/causes — Liste des causes predefinies
router.get("/causes", async (_req, res) => {
    res.json({ success: true, data: { produit: pertes_service_1.CAUSES_PRODUIT_FINI, mp: pertes_service_1.CAUSES_MATIERE_PREMIERE } });
});
// POST /api/pertes/produit
router.post("/produit", (0, auth_middleware_1.requireRole)(["ADMIN", "RESPONSABLE", "CAISSIER", "GESTIONNAIRE"]), async (req, res) => {
    const data = pertes_service_1.createPerteProduitSchema.parse(req.body);
    const result = await (0, pertes_service_1.createPerteProduit)(req.user.companyId, data);
    res.status(201).json({ success: true, data: result });
});
// POST /api/pertes/mp
router.post("/mp", (0, auth_middleware_1.requireRole)(["ADMIN", "RESPONSABLE", "CHEF_PATISSIER", "GESTIONNAIRE"]), async (req, res) => {
    const data = pertes_service_1.createPerteMPSchema.parse(req.body);
    const result = await (0, pertes_service_1.createPerteMP)(req.user.companyId, data);
    res.status(201).json({ success: true, data: result });
});
exports.default = router;
//# sourceMappingURL=pertes.routes.js.map