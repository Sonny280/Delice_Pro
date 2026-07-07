// src/modules/produits/produits.routes.ts
import { Router, Request, Response } from "express";
import { z } from "zod";
import { authMiddleware, requireRole } from "../../middleware/auth.middleware";
import prisma from "../../config/database";
import { calculerMargeProduit } from "../../utils/calculations";

const router = Router();
router.use(authMiddleware);

const produitSchema = z.object({
  nom: z.string().min(2),
  prixVente: z.number().positive("Le prix doit être positif"),
  margeMin: z.number().min(0).max(100).default(25),
  grammage: z.number().positive().optional().nullable(), // Poids d'une pièce en grammes
  categorieId: z.string().optional(),
  recetteId: z.string().optional(),
  seuilAlerte: z.number().min(0).optional(),
});

// GET /api/produits — Lister les produits avec leurs marges calculées
router.get("/", async (req: Request, res: Response) => {
  const produits = await prisma.produit.findMany({
    where: { companyId: req.user!.companyId, actif: true },
    include: {
      categorie: { select: { id: true, nom: true } },
      recette: { select: { id: true, nom: true } },
    },
    orderBy: { nom: "asc" },
  });

  // Calculer la marge de chaque produit
  const produitsAvecMarges = await Promise.all(
    produits.map(async (p) => ({
      ...p,
      ...(await calculerMargeProduit(p.id)),
    }))
  );

  res.json({ success: true, data: produitsAvecMarges });
});

// POST /api/produits
router.post(
  "/",
  requireRole(["ADMIN", "RESPONSABLE"]),
  async (req: Request, res: Response) => {
    const data = produitSchema.parse(req.body);
    const produit = await prisma.produit.create({
      data: { ...data, companyId: req.user!.companyId },
      include: { categorie: true, recette: true },
    });
    res.status(201).json({ success: true, data: produit });
  }
);

// PUT /api/produits/:id
router.put(
  "/:id",
  requireRole(["ADMIN", "RESPONSABLE"]),
  async (req: Request, res: Response) => {
    const data = produitSchema.partial().parse(req.body);
    const produit = await prisma.produit.update({
      where: { id: req.params.id },
      data,
      include: { categorie: true, recette: true },
    });
    res.json({ success: true, data: produit });
  }
);

// DELETE /api/produits/:id (soft delete)
router.delete(
  "/:id",
  requireRole(["ADMIN"]),
  async (req: Request, res: Response) => {
    await prisma.produit.update({
      where: { id: req.params.id },
      data: { actif: false },
    });
    res.json({ success: true, message: "Produit désactivé" });
  }
);

export default router;