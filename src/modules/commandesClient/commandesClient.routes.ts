// src/modules/commandesClient/commandesClient.routes.ts
import { Router, Request, Response } from "express";
import { z } from "zod";
import { authMiddleware, requireRole } from "../../middleware/auth.middleware";
import prisma from "../../config/database";

const router = Router();
router.use(authMiddleware);

// Génère une référence unique ex: CMD-2025-042
async function genererReference(companyId: string): Promise<string> {
  const count = await prisma.commandeClient.count({ where: { companyId } });
  const year = new Date().getFullYear();
  return `CMD-${year}-${String(count + 1).padStart(3, "0")}`;
}

const ligneSchema = z.object({
  produitId: z.string(),
  quantite: z.number().int().positive(),
  prixUnitaire: z.number().positive(),
});

const commandeSchema = z.object({
  clientId: z.string(),
  dateLivraison: z.string(),
  acompte: z.number().min(0).default(0),
  notes: z.string().optional(),
  lignes: z.array(ligneSchema).min(1),
});

// GET /api/commandes-client
router.get("/", async (req: Request, res: Response) => {
  const { statut } = req.query;
  const commandes = await prisma.commandeClient.findMany({
    where: {
      companyId: req.user!.companyId,
      ...(statut ? { statut: statut as any } : {}),
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
router.post("/", async (req: Request, res: Response) => {
  const data = commandeSchema.parse(req.body);
  const reference = await genererReference(req.user!.companyId);

  const montantTotal = data.lignes.reduce(
    (sum, l) => sum + l.quantite * l.prixUnitaire, 0
  );

  const commande = await prisma.commandeClient.create({
    data: {
      reference,
      clientId: data.clientId,
      companyId: req.user!.companyId,
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
router.put("/:id/statut", async (req: Request, res: Response) => {
  const { statut } = z.object({
    statut: z.enum(["RECUE", "EN_PRODUCTION", "PRETE", "LIVREE", "ANNULEE"]),
  }).parse(req.body);

  const commande = await prisma.commandeClient.update({
    where: { id: req.params.id },
    data: { statut },
    include: { client: true, lignes: { include: { produit: true } } },
  });
  res.json({ success: true, data: commande });
});

// PUT /api/commandes-client/:id — Modifier une commande
router.put("/:id", async (req: Request, res: Response) => {
  const data = commandeSchema.partial().parse(req.body);
  const montantTotal = data.lignes
    ? data.lignes.reduce((sum, l) => sum + l.quantite * l.prixUnitaire, 0)
    : undefined;

  // Si on modifie les lignes, on supprime et recrée
  if (data.lignes) {
    await prisma.ligneCommandeClient.deleteMany({ where: { commandeId: req.params.id } });
  }

  const commande = await prisma.commandeClient.update({
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
router.delete("/:id", requireRole(["ADMIN", "RESPONSABLE"]), async (req: Request, res: Response) => {
  await prisma.commandeClient.update({
    where: { id: req.params.id },
    data: { statut: "ANNULEE" },
  });
  res.json({ success: true });
});

export default router;