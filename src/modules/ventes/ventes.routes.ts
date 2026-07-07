// src/modules/ventes/ventes.routes.ts
import { Router, Request, Response } from "express";
import { z } from "zod";
import { authMiddleware, requireRole } from "../../middleware/auth.middleware";
import { createVente, getStatsVentes, getStockProduits, createVenteSchema } from "./ventes.service";
import prisma from "../../config/database";

const router = Router();
router.use(authMiddleware);

// GET /api/ventes/stats
router.get("/stats", async (req: Request, res: Response) => {
  const { dateDebut, dateFin } = req.query;
  const result = await getStatsVentes(req.user!.companyId, {
    dateDebut: dateDebut as string,
    dateFin: dateFin as string,
  });
  res.json({ success: true, data: result });
});

// GET /api/ventes -- Historique des ventes
router.get("/", async (req: Request, res: Response) => {
  const ventes = await prisma.vente.findMany({
    where: { companyId: req.user!.companyId },
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
router.get("/stock-produits", async (req: Request, res: Response) => {
  const produits = await getStockProduits(req.user!.companyId);
  res.json({ success: true, data: produits });
});

// PUT /api/ventes/stock-produits/:id/stock — Modifier stock + seuil en valeur ABSOLUE
// C'est la route utilisée par l'édition en ligne : on saisit directement la valeur finale
router.put(
  "/stock-produits/:id/stock",
  requireRole(["ADMIN", "RESPONSABLE", "GESTIONNAIRE", "CHEF_PATISSIER"]),
  async (req: Request, res: Response) => {
    const schema = z.object({
      stockActuel: z.number().min(0, "Le stock ne peut pas être négatif"),
      seuilAlerte: z.number().min(0, "Le seuil ne peut pas être négatif"),
    });
    const { stockActuel, seuilAlerte } = schema.parse(req.body);

    // Vérifier que le produit appartient à l'entreprise
    const produit = await prisma.produit.findFirst({
      where: { id: req.params.id, companyId: req.user!.companyId },
    });
    if (!produit) {
      res.status(404).json({ success: false, message: "Produit introuvable" });
      return;
    }

    const updated = await prisma.produit.update({
      where: { id: req.params.id },
      data: { stockActuel, seuilAlerte },
    });
    res.json({ success: true, data: updated });
  }
);

// POST /api/ventes — Enregistrer une vente (décrémente le stock automatiquement)
router.post(
  "/",
  requireRole(["ADMIN", "RESPONSABLE", "CAISSIER"]),
  async (req: Request, res: Response) => {
    const data = createVenteSchema.parse(req.body);
    const vente = await createVente(req.user!.companyId, req.user!.id, data);

  
    // Décrémenter le stock de chaque produit vendu
    // On utilise Math.max(0, ...) pour éviter un stock négatif
    for (const ligne of data.lignes) {
      const produit = await prisma.produit.findUnique({ where: { id: ligne.produitId } });
      if (produit) {
        await prisma.produit.update({
          where: { id: ligne.produitId },
          data: {
            stockActuel: Math.max(0, produit.stockActuel - ligne.quantite),
          },
        });
      }
    }

    res.status(201).json({ success: true, data: vente });
  }
);

// POST /api/ventes/stock-produits/entree — Entree manuelle stock produit fini
router.post(
  "/stock-produits/entree",
  requireRole(["ADMIN", "RESPONSABLE", "CHEF_PATISSIER"]),
  async (req: Request, res: Response) => {
    const schema = z.object({
      produitId: z.string({ required_error: "Produit requis" }),
      quantite:  z.number().int().positive("La quantite doit etre positive"),
      motif:     z.string().optional(),
    });
    const { produitId, quantite } = schema.parse(req.body);

    const produit = await prisma.produit.findFirst({
      where: { id: produitId, companyId: req.user!.companyId },
    });
    if (!produit) {
      res.status(404).json({ success: false, message: "Produit introuvable" });
      return;
    }

    const updated = await prisma.produit.update({
      where: { id: produitId },
      data:  { stockActuel: { increment: quantite } },
    });

    res.json({
      success: true,
      data: {
        produit: updated,
        message: `+${quantite} pcs ajoutees. Nouveau stock : ${updated.stockActuel}`,
      },
    });
  }
);

export default router;