// src/modules/production/production.routes.ts
//
// NOUVEAU FLUX : Plus de /demarrer + /finaliser séparés
// → Un seul endpoint POST /enregistrer
//   Le boulanger saisit tout en fin de pétrin en une fois

import { Router, Request, Response } from "express";
import { authMiddleware, requireRole } from "../../middleware/auth.middleware";
import prisma from "../../config/database";
import {
  enregistrerProduction, enregistrerProductionSchema,
  faconnerPaton, faconnerPatonSchema,
  getPatonsEnChambreFroide, getDerniereRetournee, getProductions,
  getLotsActifs, getProchainNumeroPetrin,
} from "./production.service";

const router = Router();
router.use(authMiddleware);

// ─── GET /api/production — Historique ────────────────────────────────────────
router.get("/", async (req: Request, res: Response) => {
  const { categorieProd, sessionProd, dateDebut, dateFin } = req.query;
  const result = await getProductions(req.user!.companyId, {
    categorieProd: categorieProd as string,
    sessionProd:   sessionProd   as string,
    dateDebut:     dateDebut     as string,
    dateFin:       dateFin       as string,
  });
  res.json({ success: true, data: result });
});

// ─── GET /api/production/prochain-numero ─────────────────────────────────────
// Retourne le prochain numéro de pétrin pour la journée (= dernier + 1)
router.get("/prochain-numero", async (req: Request, res: Response) => {
  const numero = await getProchainNumeroPetrin(req.user!.companyId);
  res.json({ success: true, data: { numeroPetrin: numero } });
});

// ─── GET /api/production/lots — Lots de stock actifs ─────────────────────────
// Retourne tous les lots actifs avec leur date d'expiration
// Utilisé par la page Stocks et la Clôture
router.get("/lots", async (req: Request, res: Response) => {
  const { produitId } = req.query;
  const result = await getLotsActifs(req.user!.companyId, produitId as string | undefined);
  res.json({ success: true, data: result });
});

// ─── GET /api/production/patons — Pâtons en chambre froide ───────────────────
router.get("/patons", async (req: Request, res: Response) => {
  const result = await getPatonsEnChambreFroide(req.user!.companyId);
  res.json({ success: true, data: result });
});

// ─── GET /api/production/derniere-retournee — Alerte pâte retournée ──────────
router.get("/derniere-retournee", async (req: Request, res: Response) => {
  const result = await getDerniereRetournee(req.user!.companyId);
  res.json({ success: true, data: result });
});

// ─── GET /api/production/recette-info — Infos recette pour formulaire ────────
// Retourne les ingrédients avec quantités pour une farine donnée
// Utilisé pour afficher le tableau d'ingrédients pendant la saisie
router.get("/recette-info", async (req: Request, res: Response) => {
  const { recetteId, quantiteFarine } = req.query;
  if (!recetteId) { res.status(400).json({ success: false, message: "recetteId requis" }); return; }

  const recette = await prisma.recette.findFirst({
    where: { id: recetteId as string, companyId: req.user!.companyId },
    include: {
      ingredients: {
        include: {
          mp:    { select: { id: true, nom: true, prixAchat: true, stockActuel: true, stockGere: true } },
          unite: { select: { abreviation: true, coefficient: true } },
        },
      },
    },
  });
  if (!recette) { res.status(404).json({ success: false, message: "Recette introuvable" }); return; }

  const farine = Number(quantiteFarine ?? 50);

  // Calculer les quantités pour ce volume de farine
  const ingredients = recette.ingredients.map(ing => {
    const coeff     = ing.unite?.coefficient ?? 1;
    const quantite  = Math.round(ing.quantite * farine * coeff * 1000) / 1000;
    const nonGere   = (ing.mp as any).stockGere === false;
    const manquant  = !nonGere && ing.mp.stockActuel < quantite;
    return {
      nom:        ing.mp.nom,
      quantite,
      unite:      ing.unite?.abreviation ?? "kg",
      nonGere,
      stockActuel: ing.mp.stockActuel,
      manquant,
      manque:     manquant ? Math.round((quantite - ing.mp.stockActuel) * 1000) / 1000 : 0,
    };
  });

  // Pâte théorique
  const pateRecuperee = Number(req.query.pateRecuperee ?? 0);
  const pateTheorique = Math.round(
    (recette.ratioPate * farine + pateRecuperee) * 100
  ) / 100;

  res.json({
    success: true,
    data: {
      recette: {
        nom:                     recette.nom,
        ratioPate:               recette.ratioPate,
        tauxPerte:               (recette as any).tauxPerte,
        ingredientReference:     (recette as any).ingredientReference      ?? "FARINE",
        ingredientReferenceNom:  (recette as any).ingredientReferenceNom   ?? "Farine",
        ingredientReferenceUnite:(recette as any).ingredientReferenceUnite ?? "kg",
      },
      ingredients,
      pateTheorique,
      alertesStock: ingredients.filter(i => i.manquant),
    },
  });
});

// ─── POST /api/production/enregistrer — Enregistrer un pétrin complet ────────
// Nouveau endpoint unique : remplace /demarrer + /finaliser
// Le boulanger saisit tout en fin de pétrin
router.post("/enregistrer",
  requireRole(["ADMIN", "RESPONSABLE", "CHEF_PATISSIER"]),
  async (req: Request, res: Response) => {
    const data   = enregistrerProductionSchema.parse(req.body);
    const result = await enregistrerProduction(req.user!.companyId, req.user!.id, data);
    res.status(201).json({ success: true, data: result });
  }
);

// ─── POST /api/production/patons/faconner ────────────────────────────────────
router.post("/patons/faconner",
  requireRole(["ADMIN", "RESPONSABLE", "CHEF_PATISSIER"]),
  async (req: Request, res: Response) => {
    const data   = faconnerPatonSchema.parse(req.body);
    const result = await faconnerPaton(req.user!.companyId, data);
    res.json({ success: true, data: result });
  }
);

// ─── PUT /api/production/patons/:id/perdu ────────────────────────────────────
router.put("/patons/:id/perdu",
  requireRole(["ADMIN", "RESPONSABLE", "CHEF_PATISSIER"]),
  async (req: Request, res: Response) => {
    const { companyId } = req.user!;

    const paton = await prisma.paton.findFirst({
      where: { id: req.params.id, companyId, statutPaton: "EN_CHAMBRE_FROIDE" },
      include: {
        production: {
          include: {
            recette: {
              include: {
                ingredients: {
                  include: {
                    mp:    { select: { id: true, nom: true, prixAchat: true, stockGere: true } },
                    unite: { select: { coefficient: true } },
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!paton) { res.status(404).json({ success: false, message: "Pâton introuvable" }); return; }

    const pateEffective = (paton.production as any).pateEffective || 1;
    const ratioPerte    = (paton as any).poids / pateEffective;

    for (const ing of paton.production.recette.ingredients) {
      if ((ing.mp as any).stockGere === false) continue;
      const coeff  = ing.unite?.coefficient ?? 1;
      const qtePer = Math.round(ing.quantite * paton.production.quantiteFarine * coeff * ratioPerte * 1000) / 1000;
      if (qtePer <= 0) continue;
      await prisma.perte.create({
        data: {
          companyId, type: "MATIERE_PREMIERE", mpId: ing.mp.id,
          quantite: qtePer,
          valeur:   Math.round(qtePer * (ing.mp as any).prixAchat * 100) / 100,
          cause:    "Pâton perdu (chambre froide)",
          deductMP: false, date: new Date(),
          notes:    `Pâton ${(paton as any).poids} kg — Pétrin #${(paton.production as any).numeroPetrin}`,
        },
      });
    }

    await prisma.paton.update({
      where: { id: req.params.id },
      data:  { statutPaton: "PERDU" } as any,
    });

    res.json({ success: true, data: { message: `Pâton déclaré perdu. Pertes MP enregistrées.` } });
  }
);

// ─── GET /api/production/:id — Détail complet d'un pétrin ───────────────────
router.get("/:id", async (req: Request, res: Response) => {
  const { companyId } = req.user!;
  const production = await prisma.production.findFirst({
    where: { id: req.params.id, companyId },
    include: {
      recette:  { select: {
        id: true, nom: true, ratioPate: true, tauxPerte: true,
        ingredientReferenceNom: true, ingredientReferenceUnite: true,
        ingredients: {
          include: {
            mp:    { select: { id: true, nom: true, prixAchat: true } },
            unite: { select: { abreviation: true } },
          },
        },
      }},
      user:     { select: { prenom: true, nom: true } },
      lignesProduction: {
        include: { produit: { select: { id: true, nom: true, prixVente: true, grammage: true } } },
      },
      patons:   true,
      lotsStock: {
        include: { produit: { select: { nom: true } } },
      },
    },
  });

  if (!production) {
    res.status(404).json({ success: false, message: "Pétrin introuvable" });
    return;
  }

  res.json({ success: true, data: production });
});

export default router;