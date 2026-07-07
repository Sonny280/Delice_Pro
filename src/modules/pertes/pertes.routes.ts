// src/modules/pertes/pertes.routes.ts
import { Router, Request, Response } from "express";
import { authMiddleware, requireRole } from "../../middleware/auth.middleware";
import {
  createPerteProduit, createPerteMP, getPertes,
  createPerteProduitSchema, createPerteMPSchema,
  CAUSES_PRODUIT_FINI, CAUSES_MATIERE_PREMIERE,
} from "./pertes.service";

const router = Router();
router.use(authMiddleware);

// GET /api/pertes
router.get("/", async (req: Request, res: Response) => {
  const { type, cause, dateDebut, dateFin, limit } = req.query;
  const result = await getPertes(req.user!.companyId, {
    type:      type      as "PRODUIT_FINI" | "MATIERE_PREMIERE" | undefined,
    cause:     cause     as string | undefined,
    dateDebut: dateDebut as string | undefined,
    dateFin:   dateFin   as string | undefined,
    limit:     limit ? parseInt(limit as string) : undefined,
  });
  res.json({ success: true, data: result });
});

// GET /api/pertes/causes — Liste des causes predefinies
router.get("/causes", async (_req: Request, res: Response) => {
  res.json({ success: true, data: { produit: CAUSES_PRODUIT_FINI, mp: CAUSES_MATIERE_PREMIERE } });
});

// POST /api/pertes/produit
router.post("/produit",
  requireRole(["ADMIN", "RESPONSABLE", "CAISSIER", "GESTIONNAIRE"]),
  async (req: Request, res: Response) => {
    const data   = createPerteProduitSchema.parse(req.body);
    const result = await createPerteProduit(req.user!.companyId, data);
    res.status(201).json({ success: true, data: result });
  }
);

// POST /api/pertes/mp
router.post("/mp",
  requireRole(["ADMIN", "RESPONSABLE", "CHEF_PATISSIER", "GESTIONNAIRE"]),
  async (req: Request, res: Response) => {
    const data   = createPerteMPSchema.parse(req.body);
    const result = await createPerteMP(req.user!.companyId, data);
    res.status(201).json({ success: true, data: result });
  }
);

export default router;